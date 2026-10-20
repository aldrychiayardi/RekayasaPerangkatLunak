import { describe, expect, it, vi } from "vitest";
import type { PrismaClient } from "@prisma/client";
import { ApiError } from "../lib/errors.js";
import { calculateRates, calculateRatesForRoute } from "./rates.service.js";

const input = {
  originCity: "Pontianak",
  destinationCity: "Kubu Raya",
  weight: 2,
  length: 60,
  width: 50,
  height: 40
};

describe("rates service", () => {
  it("uses volumetric weight when it exceeds actual weight", () => {
    const result = calculateRates(input, [
      { serviceType: "REGULAR", ratePerKg: 10_000, estimatedDays: "2 Hari" },
      { serviceType: "VEHICLE", ratePerKg: 200_000, estimatedDays: "Sesuai jadwal" }
    ]);

    expect(result.volumetricWeight).toBe(20);
    expect(result.chargeableWeight).toBe(20);
    expect(result.services[0].totalCost).toBe(200_000);
  });

  it("uses actual weight when it exceeds volumetric weight", () => {
    const result = calculateRates(
      { ...input, weight: 25, length: 10, width: 10, height: 10 },
      [{ serviceType: "REGULAR", ratePerKg: 12_000, estimatedDays: "2-3 Hari" }]
    );

    expect(result.volumetricWeight).toBeCloseTo(0.17);
    expect(result.chargeableWeight).toBe(25);
    expect(result.services[0].totalCost).toBe(300_000);
  });

  it("charges vehicle service as a flat per-unit rate", () => {
    const result = calculateRates(input, [
      { serviceType: "REGULAR", ratePerKg: 12_000, estimatedDays: "2-3 Hari" },
      { serviceType: "VEHICLE", ratePerKg: 235_000, estimatedDays: "3-5 Hari" }
    ]);

    expect(result.services[1].rateUnit).toBe("unit");
    expect(result.services[1].totalCost).toBe(235_000);
  });

  it("rejects invalid dimensions and a route without configured rates", async () => {
    expect(() => calculateRates({ ...input, width: 0 }, [])).toThrow(ApiError);

    const db = {
      priceRate: { findMany: vi.fn().mockResolvedValue([]) }
    } as unknown as Pick<PrismaClient, "priceRate">;
    await expect(calculateRatesForRoute(db, input)).rejects.toMatchObject({
      StatusCode: 404
    });
  });
});
