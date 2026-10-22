import { describe, expect, it, vi } from "vitest";
import type { PrismaClient } from "@prisma/client";
import { ApiError } from "../lib/errors.js";
import {
  recordCourierCheckpoint,
  type CourierCheckpointInput
} from "../services/courier.service.js";

const checkpoint: CourierCheckpointInput = {
  status: "IN_TRANSIT",
  location: "Hub Pontianak",
  description: "Paket diberangkatkan menuju hub tujuan."
};

function createDbMock(currentStatus = "AT_ORIGIN_HUB") {
  const transaction = {
    trackingEvent: {
      create: vi.fn(async (args: { data: { status: string } }) => ({
        id: "event-1",
        status: args.data.status
      }))
    },
    shipment: {
      findUnique: vi.fn().mockResolvedValue({ id: "shipment-1", status: currentStatus }),
      update: vi.fn().mockResolvedValue({})
    }
  };
  const db = {
    $transaction: vi.fn(
      (callback: (tx: typeof transaction) => Promise<unknown>) => callback(transaction)
    )
  };
  return {
    db: db as unknown as Pick<PrismaClient, "$transaction">,
    ...db,
    transaction
  };
}

describe("courier service", () => {
  it("adds an in-transit checkpoint and updates shipment status atomically", async () => {
    const { db, transaction } = createDbMock();

    await recordCourierCheckpoint(db, "nex-2026abc234", checkpoint);

    expect(transaction.trackingEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        shipmentId: "shipment-1",
        status: "IN_TRANSIT",
        location: "Hub Pontianak"
      })
    });
    expect(transaction.shipment.update).toHaveBeenCalledWith({
      where: { id: "shipment-1" },
      data: expect.objectContaining({ status: "IN_TRANSIT" })
    });
  });

  it("accepts delivery after out-for-delivery", async () => {
    const { db, transaction } = createDbMock("OUT_FOR_DELIVERY");

    await expect(
      recordCourierCheckpoint(db, "NEX-2026ABC234", {
        ...checkpoint,
        status: "DELIVERED"
      })
    ).resolves.toMatchObject({ status: "DELIVERED" });
    expect(transaction.shipment.update).toHaveBeenCalledWith({
      where: { id: "shipment-1" },
      data: expect.objectContaining({ status: "DELIVERED" })
    });
  });

  it("rejects skipped, regressive, and post-delivery status changes", async () => {
    const skipped = createDbMock("ORDER_CREATED");
    await expect(
      recordCourierCheckpoint(dbFor(skipped), "NEX-2026ABC234", checkpoint)
    ).rejects.toMatchObject({ StatusCode: 409 });
    expect(skipped.transaction.trackingEvent.create).not.toHaveBeenCalled();

    const regressive = createDbMock("IN_TRANSIT");
    await expect(
      recordCourierCheckpoint(dbFor(regressive), "NEX-2026ABC234", {
        ...checkpoint,
        status: "PICKED_UP"
      })
    ).rejects.toMatchObject({ StatusCode: 409 });

    const delivered = createDbMock("DELIVERED");
    await expect(
      recordCourierCheckpoint(dbFor(delivered), "NEX-2026ABC234", checkpoint)
    ).rejects.toThrow(ApiError);
  });
});

function dbFor(
  mock: ReturnType<typeof createDbMock>
): Pick<PrismaClient, "$transaction"> {
  return mock.db;
}
