import { describe, expect, it, vi } from "vitest";
import type { PrismaClient } from "@prisma/client";
import { ApiError } from "../lib/errors.js";
import { createShipment, type CreateShipmentInput } from "../services/shipment.service.js";

const shipmentInput: CreateShipmentInput = {
  senderName: "Ayu",
  senderPhone: "081234567890",
  senderCity: "Pontianak",
  senderAddress: "Jl. Merdeka",
  receiverName: "Budi",
  receiverPhone: "081298765432",
  receiverCity: "Kubu Raya",
  receiverAddress: "Jl. Adisucipto",
  weight: 2,
  length: 60,
  width: 50,
  height: 40,
  serviceType: "REGULAR"
};

function createDbMock(ratePerKg = 12_000) {
  const db = {
    priceRate: {
      findFirst: vi.fn().mockResolvedValue({ ratePerKg })
    },
    shipment: {
      create: vi.fn().mockResolvedValue({ trackingNumber: "NEX-2026ABC234" })
    }
  };
  return {
    db: db as unknown as Pick<PrismaClient, "priceRate" | "shipment">,
    ...db
  };
}

describe("shipment service", () => {
  it("creates a unique-format AWB with calculated cost and initial checkpoint", async () => {
    const { db, shipment } = createDbMock();
    const result = await createShipment(
      db,
      shipmentInput,
      "customer-1",
      () => "NEX-2026ABC234"
    );

    expect(result.trackingNumber).toBe("NEX-2026ABC234");
    expect(result.trackingNumber).toMatch(/^NEX-\d{4}[A-HJ-NP-Z2-9]{6}$/);
    const createArgs = shipment.create.mock.calls[0][0];
    expect(createArgs.data).toMatchObject({
      userId: "customer-1",
      trackingNumber: "NEX-2026ABC234",
      chargeableWeight: 20,
      totalCost: 240_000,
      status: "ORDER_CREATED",
      events: {
        create: {
          status: "ORDER_CREATED",
          location: "Drop Point / Gerai Pontianak"
        }
      }
    });
  });

  it("uses the vehicle rate as a flat unit amount", async () => {
    const { db, shipment } = createDbMock(225_000);
    await createShipment(
      db,
      { ...shipmentInput, serviceType: "VEHICLE" },
      null,
      () => "NEX-2026VEH234"
    );

    expect(shipment.create.mock.calls[0][0].data.totalCost).toBe(225_000);
  });

  it("rejects invalid weight and reports a missing route rate", async () => {
    const { db, priceRate } = createDbMock();
    await expect(
      createShipment(db, { ...shipmentInput, weight: 0 })
    ).rejects.toThrow(ApiError);
    expect(priceRate.findFirst).not.toHaveBeenCalled();

    priceRate.findFirst.mockResolvedValueOnce(null);
    await expect(createShipment(db, shipmentInput)).rejects.toMatchObject({
      StatusCode: 404
    });
  });

  it("returns a service error if the generated AWB collides", async () => {
    const { db, shipment } = createDbMock();
    shipment.create.mockRejectedValueOnce({ code: "P2002" });

    await expect(
      createShipment(db, shipmentInput, null, () => "NEX-DUPLICATE")
    ).rejects.toMatchObject({ StatusCode: 503 });
  });
});
