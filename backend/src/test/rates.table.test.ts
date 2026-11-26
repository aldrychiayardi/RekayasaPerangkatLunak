import { describe, expect, it, vi } from "vitest";
import type { PrismaClient } from "@prisma/client";
import { ApiError } from "../lib/errors.js";
import { DESTINATION_CITIES } from "../lib/locations.js";
import { calculateRates, calculateRatesForRoute } from "../services/rates.service.js";

const storedRates = [
  { serviceType: "REGULAR", ratePerKg: 12_000, estimatedDays: "2-3 Hari" },
  { serviceType: "VEHICLE", ratePerKg: 200_000, estimatedDays: "Sesuai jadwal" }
];

function input(weight: number, length: number, width: number, height: number) {
  return { originCity: "Pontianak", destinationCity: "Kubu Raya", weight, length, width, height };
}

describe("rates: chargeable weight table", () => {
  // [berat, panjang, lebar, tinggi, volumetrik, berat tagihan]
  it.each([
    [1, 10, 10, 10, 0.17, 1],
    [2, 60, 50, 40, 20, 20],
    [25, 10, 10, 10, 0.17, 25],
    [1, 30, 30, 30, 4.5, 4.5],
    [10, 100, 50, 50, 41.67, 41.7],
    [7.25, 20, 20, 20, 1.33, 7.3],
    [1.06, 10, 10, 10, 0.17, 1.1],
    [4, 40, 30, 25, 5, 5],
    [100, 50, 50, 50, 20.83, 100],
    [0.1, 0.5, 0.5, 0.5, 0, 1]
  ])(
    "w=%d %dx%dx%d -> volumetric %d, chargeable %d",
    (weight, length, width, height, volumetric, chargeable) => {
      const result = calculateRates(input(weight, length, width, height), storedRates);
      expect(result.volumetricWeight).toBe(volumetric);
      expect(result.chargeableWeight).toBe(chargeable);
      expect(result.services[0].totalCost).toBe(Math.round(12_000 * chargeable));
    }
  );
});

describe("rates: invalid input", () => {
  it.each([
    ["weight = 0", input(0, 10, 10, 10)],
    ["weight < 0", input(-1, 10, 10, 10)],
    ["length = 0", input(1, 0, 10, 10)],
    ["width < 0", input(1, 10, -5, 10)],
    ["height = 0", input(1, 10, 10, 0)],
    ["weight NaN", input(Number.NaN, 10, 10, 10)],
    ["length Infinity", input(1, Number.POSITIVE_INFINITY, 10, 10)],
    ["height -Infinity", input(1, 10, 10, Number.NEGATIVE_INFINITY)]
  ])("rejects %s with HTTP 400", (_label, value) => {
    expect(() => calculateRates(value, storedRates)).toThrow(ApiError);
  });
});

describe("rates: fallback to default tariff", () => {
  it.each([
    ["no stored rates", [], 12_000, 200_000],
    ["zero regular rate", [{ serviceType: "REGULAR", ratePerKg: 0, estimatedDays: "1 Hari" }], 12_000, 200_000],
    ["negative vehicle rate", [{ serviceType: "VEHICLE", ratePerKg: -1, estimatedDays: "x" }], 12_000, 200_000],
    ["custom regular rate", [{ serviceType: "REGULAR", ratePerKg: 15_000, estimatedDays: "1 Hari" }], 15_000, 200_000],
    ["custom vehicle rate", [{ serviceType: "VEHICLE", ratePerKg: 250_000, estimatedDays: "3 Hari" }], 12_000, 250_000],
    ["both custom", [
      { serviceType: "REGULAR", ratePerKg: 9_000, estimatedDays: "1 Hari" },
      { serviceType: "VEHICLE", ratePerKg: 300_000, estimatedDays: "2 Hari" }
    ], 9_000, 300_000]
  ])("%s -> regular %d, vehicle %d", (_label, rates, regular, vehicle) => {
    const result = calculateRates(input(1, 10, 10, 10), rates);
    expect(result.services[0].rateAmount).toBe(regular);
    expect(result.services[1].rateAmount).toBe(vehicle);
    expect(result.services[1].totalCost).toBe(vehicle);
  });

  it.each([
    ["Belum ditentukan", "2-3 Hari"],
    ["", "2-3 Hari"],
    ["4 Hari", "4 Hari"]
  ])("regular estimate %j is shown as %j", (stored, expected) => {
    const result = calculateRates(input(1, 10, 10, 10), [
      { serviceType: "REGULAR", ratePerKg: 12_000, estimatedDays: stored }
    ]);
    expect(result.services[0].estimatedDays).toBe(expected);
  });

  it("always returns REGULAR and VEHICLE services, both eligible", () => {
    const result = calculateRates(input(1, 10, 10, 10), storedRates);
    expect(result.services.map((service) => service.serviceType)).toEqual(["REGULAR", "VEHICLE"]);
    expect(result.services.every((service) => service.isEligible)).toBe(true);
  });
});

describe("rates: calculateRatesForRoute", () => {
  function db(rates: unknown[]) {
    const findMany = vi.fn().mockResolvedValue(rates);
    return {
      findMany,
      db: { priceRate: { findMany } } as unknown as Pick<PrismaClient, "priceRate">
    };
  }

  it.each(DESTINATION_CITIES.map((city) => [city]))(
    "calculates rates from Pontianak to %s",
    async (destinationCity) => {
      const mock = db(storedRates);
      const result = await calculateRatesForRoute(mock.db, {
        ...input(2, 10, 10, 10),
        destinationCity
      });
      expect(result.chargeableWeight).toBe(2);
      expect(mock.findMany).toHaveBeenCalledWith({
        where: { originCity: "Pontianak", destinationCity }
      });
    }
  );

  it.each([
    ["Jakarta", "Kubu Raya"],
    ["Pontianak", "Jakarta"],
    ["Seluas", "Pontianak"],
    ["pontianak", "Seluas"]
  ])("rejects unsupported route %s -> %s with HTTP 400", async (originCity, destinationCity) => {
    const mock = db(storedRates);
    await expect(
      calculateRatesForRoute(mock.db, { ...input(1, 10, 10, 10), originCity, destinationCity })
    ).rejects.toMatchObject({ StatusCode: 400 });
    expect(mock.findMany).not.toHaveBeenCalled();
  });

  it("returns HTTP 404 when the route has no tariff yet", async () => {
    const mock = db([]);
    await expect(
      calculateRatesForRoute(mock.db, input(1, 10, 10, 10))
    ).rejects.toMatchObject({ StatusCode: 404 });
  });
});
