import { describe, expect, it, vi } from "vitest";
import type { PrismaClient } from "@prisma/client";
import { ApiError } from "../lib/errors.js";
import { DESTINATION_CITIES, ORIGIN_CITY, isSupportedDestination } from "../lib/locations.js";
import { getShipmentByAwb, normalizeAwb } from "../services/tracking.service.js";

describe("locations: supported destinations", () => {
  it("uses Pontianak as the only origin city", () => {
    expect(ORIGIN_CITY).toBe("Pontianak");
  });

  it.each(DESTINATION_CITIES.map((city) => [city]))(
    "accepts %s as a destination on the Seluas route",
    (city) => {
      expect(isSupportedDestination(city)).toBe(true);
    }
  );

  it.each([
    ["Pontianak"],
    ["Jakarta"],
    ["seluas"],
    [" Toho"]
  ])("rejects %j as an unsupported destination", (city) => {
    expect(isSupportedDestination(city)).toBe(false);
  });
});

describe("tracking: normalizeAwb", () => {
  it.each([
    ["nex-2026abc234", "NEX-2026ABC234"],
    ["  NEX-2026ABC234  ", "NEX-2026ABC234"],
    ["Nex-882910", "NEX-882910"],
    ["\tnex-554201\n", "NEX-554201"],
    ["nex-109283", "NEX-109283"],
    ["NEX-2026ZZZ999", "NEX-2026ZZZ999"],
    ["a", "A"]
  ])("normalizes %j to %s", (raw, expected) => {
    expect(normalizeAwb(raw)).toBe(expected);
  });

  it.each([
    [""],
    ["   "],
    [null],
    [undefined],
    [12345],
    [{ awb: "NEX-1" }]
  ])("rejects invalid AWB value %j with HTTP 400", (value) => {
    expect(() => normalizeAwb(value)).toThrow(ApiError);
    try {
      normalizeAwb(value);
    } catch (error) {
      expect((error as ApiError).StatusCode).toBe(400);
    }
  });
});

describe("tracking: getShipmentByAwb", () => {
  function dbWith(result: unknown) {
    const findUnique = vi.fn().mockResolvedValue(result);
    return {
      findUnique,
      db: { shipment: { findUnique } } as unknown as Pick<PrismaClient, "shipment">
    };
  }

  it.each([
    ["NEX-882910"],
    ["NEX-554201"],
    ["NEX-109283"]
  ])("returns shipment %s from the database", async (awb) => {
    const shipment = { trackingNumber: awb, events: [] };
    const { db, findUnique } = dbWith(shipment);

    await expect(getShipmentByAwb(db, awb.toLowerCase())).resolves.toBe(shipment);
    expect(findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { trackingNumber: awb } })
    );
  });

  it.each([
    ["NEX-404404"],
    ["NEX-000000"]
  ])("returns HTTP 404 when %s is not found", async (awb) => {
    const { db } = dbWith(null);
    await expect(getShipmentByAwb(db, awb)).rejects.toMatchObject({ StatusCode: 404 });
  });
});
