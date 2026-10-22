import { describe, expect, it, vi } from "vitest";
import type { PrismaClient } from "@prisma/client";
import { ApiError } from "../lib/errors.js";
import { getShipmentByAwb, normalizeAwb } from "../services/tracking.service.js";

describe("tracking service", () => {
  it("normalizes AWB and returns the shipment with newest checkpoints first", async () => {
    const shipment = {
      trackingNumber: "NEX-2026ABC234",
      events: [{ status: "IN_TRANSIT" }, { status: "ORDER_CREATED" }]
    };
    const findUnique = vi.fn().mockResolvedValue(shipment);
    const db = {
      shipment: { findUnique }
    } as unknown as Pick<PrismaClient, "shipment">;

    await expect(getShipmentByAwb(db, "  nex-2026abc234 ")).resolves.toBe(shipment);
    expect(findUnique).toHaveBeenCalledWith({
      where: { trackingNumber: "NEX-2026ABC234" },
      include: { events: { orderBy: { timestamp: "desc" } } }
    });
  });

  it("rejects an empty AWB without querying Prisma", async () => {
    const findUnique = vi.fn();
    const db = {
      shipment: { findUnique }
    } as unknown as Pick<PrismaClient, "shipment">;

    expect(() => normalizeAwb("  ")).toThrow(ApiError);
    await expect(getShipmentByAwb(db, undefined)).rejects.toMatchObject({
      StatusCode: 400
    });
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("returns not found for an unknown AWB", async () => {
    const db = {
      shipment: { findUnique: vi.fn().mockResolvedValue(null) }
    } as unknown as Pick<PrismaClient, "shipment">;

    await expect(getShipmentByAwb(db, "NEX-UNKNOWN")).rejects.toMatchObject({
      StatusCode: 404
    });
  });
});
