import { describe, expect, it, vi } from "vitest";
import type { PrismaClient } from "@prisma/client";
import { DESTINATION_CITIES } from "../lib/locations.js";
import {
  createShipment,
  MAX_AWB_ATTEMPTS,
  type CreateShipmentInput
} from "../services/shipment.service.js";

const baseInput: CreateShipmentInput = {
  senderName: "Ayu",
  senderPhone: "081234567890",
  senderCity: "Pontianak",
  senderAddress: "Jl. Merdeka",
  receiverName: "Budi",
  receiverPhone: "081298765432",
  receiverCity: "Kubu Raya",
  receiverAddress: "Jl. Adisucipto",
  weight: 3,
  length: 10,
  width: 10,
  height: 10,
  serviceType: "REGULAR"
};

function mockDb(ratePerKg: number | null = 12_000) {
  const findFirst = vi.fn().mockResolvedValue(ratePerKg === null ? null : { ratePerKg });
  const create = vi.fn(async (args: { data: { trackingNumber: string } }) => ({
    trackingNumber: args.data.trackingNumber
  }));
  const db = {
    priceRate: { findFirst },
    shipment: { create }
  } as unknown as Pick<PrismaClient, "priceRate" | "shipment">;
  return { db, findFirst, create };
}

describe("shipment: cost per destination and service", () => {
  const cases = DESTINATION_CITIES.flatMap((city) => [
    [city, "REGULAR", 36_000],
    [city, "VEHICLE", 200_000]
  ]);

  it.each(cases)("Pontianak -> %s (%s) costs %d", async (receiverCity, serviceType, cost) => {
    const rate = serviceType === "REGULAR" ? 12_000 : 200_000;
    const { db, create } = mockDb(rate);
    await createShipment(db, { ...baseInput, receiverCity, serviceType }, null, () => "NEX-1");
    expect(create.mock.calls[0][0].data).toMatchObject({ totalCost: cost, receiverCity });
  });
});

describe("shipment: default rate is used when stored rate is not positive", () => {
  it.each([
    ["REGULAR", 0, 36_000],
    ["REGULAR", -500, 36_000],
    ["VEHICLE", 0, 200_000],
    ["VEHICLE", -1, 200_000]
  ])("%s with stored rate %d costs %d", async (serviceType, rate, cost) => {
    const { db, create } = mockDb(rate);
    await createShipment(db, { ...baseInput, serviceType }, null, () => "NEX-1");
    expect(create.mock.calls[0][0].data.totalCost).toBe(cost);
  });
});

describe("shipment: invalid input is rejected before DB access", () => {
  it.each([
    ["weight 0", { weight: 0 }],
    ["height NaN", { height: Number.NaN }],
    ["unknown service", { serviceType: "EXPRESS" }],
    ["lowercase service", { serviceType: "regular" }],
    ["origin not Pontianak", { senderCity: "Singkawang" }],
    ["unsupported destination", { receiverCity: "Jakarta" }]
  ])("%s -> HTTP 400", async (_label, override) => {
    const { db, findFirst } = mockDb();
    await expect(
      createShipment(db, { ...baseInput, ...override } as CreateShipmentInput)
    ).rejects.toMatchObject({ StatusCode: 400 });
    expect(findFirst).not.toHaveBeenCalled();
  });

  it("returns HTTP 404 when no tariff exists for the route", async () => {
    const { db, create } = mockDb(null);
    await expect(createShipment(db, baseInput)).rejects.toMatchObject({ StatusCode: 404 });
    expect(create).not.toHaveBeenCalled();
  });
});

describe("shipment: AWB collision retry (bugfix v1.0_dev)", () => {
  it("allows at least 3 AWB attempts", () => {
    expect(MAX_AWB_ATTEMPTS).toBeGreaterThanOrEqual(3);
  });

  it.each([
    [1, "NEX-ATTEMPT2"],
    [2, "NEX-ATTEMPT3"]
  ])(
    "succeeds after %d collision(s) using a freshly generated AWB",
    async (collisions, expectedAwb) => {
      const { db, create } = mockDb();
      for (let index = 0; index < collisions; index += 1) {
        create.mockRejectedValueOnce({ code: "P2002" });
      }
      const awbs = ["NEX-ATTEMPT1", "NEX-ATTEMPT2", "NEX-ATTEMPT3"];
      let call = 0;

      const result = await createShipment(db, baseInput, null, () => awbs[call++]);

      expect(result.trackingNumber).toBe(expectedAwb);
      expect(create).toHaveBeenCalledTimes(collisions + 1);
    }
  );

  it("does not retry on non-collision database errors", async () => {
    const { db, create } = mockDb();
    create.mockRejectedValueOnce(new Error("database offline"));
    await expect(createShipment(db, baseInput, null, () => "NEX-1")).rejects.toThrow(
      "database offline"
    );
    expect(create).toHaveBeenCalledTimes(1);
  });

  it("generates a new AWB for every attempt", async () => {
    const { db, create } = mockDb();
    create.mockRejectedValue({ code: "P2002" });
    const createAwb = vi.fn(() => "NEX-DUP");
    await expect(createShipment(db, baseInput, null, createAwb)).rejects.toMatchObject({
      StatusCode: 503
    });
    expect(createAwb).toHaveBeenCalledTimes(MAX_AWB_ATTEMPTS);
  });

  it("generates AWB in NEX-<year><6 chars> format by default", async () => {
    const { db } = mockDb();
    const result = await createShipment(db, baseInput);
    expect(result.trackingNumber).toMatch(
      new RegExp(`^NEX-${new Date().getFullYear()}[A-HJ-NP-Z2-9]{6}$`)
    );
  });
});
