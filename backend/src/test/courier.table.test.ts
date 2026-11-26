import { describe, expect, it, vi } from "vitest";
import type { PrismaClient } from "@prisma/client";
import { recordCourierCheckpoint } from "../services/courier.service.js";

const sequence = [
  "ORDER_CREATED",
  "PICKED_UP",
  "AT_ORIGIN_HUB",
  "IN_TRANSIT",
  "AT_DESTINATION_HUB",
  "OUT_FOR_DELIVERY",
  "DELIVERED"
];
const nonTerminal = sequence.slice(0, -1);
const allStatuses = [...sequence, "FAILED"];

function mockDb(currentStatus: string | null) {
  const transaction = {
    trackingEvent: {
      create: vi.fn(async (args: { data: { status: string } }) => ({
        id: "event-1",
        status: args.data.status
      }))
    },
    shipment: {
      findUnique: vi.fn().mockResolvedValue(
        currentStatus ? { id: "shipment-1", status: currentStatus } : null
      ),
      update: vi.fn().mockResolvedValue({})
    }
  };
  const db = {
    $transaction: vi.fn(
      (callback: (tx: typeof transaction) => Promise<unknown>) => callback(transaction)
    )
  } as unknown as Pick<PrismaClient, "$transaction">;
  return { db, transaction };
}

function checkpoint(status: string) {
  return { status, location: "Hub Pontianak", description: "Update checkpoint." };
}

describe("courier: valid next-step transitions", () => {
  it.each(nonTerminal.map((status, index) => [status, sequence[index + 1]]))(
    "%s -> %s is accepted",
    async (current, next) => {
      const { db, transaction } = mockDb(current);
      await expect(
        recordCourierCheckpoint(db, "NEX-2026ABC234", checkpoint(next))
      ).resolves.toMatchObject({ status: next });
      expect(transaction.shipment.update).toHaveBeenCalledTimes(1);
    }
  );
});

describe("courier: FAILED can be recorded from any non-terminal status", () => {
  it.each(nonTerminal.map((status) => [status]))("%s -> FAILED is accepted", async (current) => {
    const { db } = mockDb(current);
    await expect(
      recordCourierCheckpoint(db, "NEX-2026ABC234", checkpoint("FAILED"))
    ).resolves.toMatchObject({ status: "FAILED" });
  });
});

describe("courier: terminal shipments cannot change", () => {
  const cases = ["DELIVERED", "FAILED"].flatMap((terminal) =>
    allStatuses.map((next) => [terminal, next])
  );

  it.each(cases)("%s -> %s is rejected with HTTP 409", async (current, next) => {
    const { db, transaction } = mockDb(current);
    await expect(
      recordCourierCheckpoint(db, "NEX-2026ABC234", checkpoint(next))
    ).rejects.toMatchObject({ StatusCode: 409 });
    expect(transaction.trackingEvent.create).not.toHaveBeenCalled();
  });
});

describe("courier: skipped or backward transitions are rejected", () => {
  it.each([
    ["ORDER_CREATED", "AT_ORIGIN_HUB"],
    ["ORDER_CREATED", "DELIVERED"],
    ["PICKED_UP", "IN_TRANSIT"],
    ["AT_ORIGIN_HUB", "OUT_FOR_DELIVERY"],
    ["IN_TRANSIT", "DELIVERED"],
    ["IN_TRANSIT", "IN_TRANSIT"],
    ["AT_DESTINATION_HUB", "PICKED_UP"],
    ["OUT_FOR_DELIVERY", "ORDER_CREATED"],
    ["PICKED_UP", "ORDER_CREATED"]
  ])("%s -> %s is rejected with HTTP 409", async (current, next) => {
    const { db, transaction } = mockDb(current);
    await expect(
      recordCourierCheckpoint(db, "NEX-2026ABC234", checkpoint(next))
    ).rejects.toMatchObject({ StatusCode: 409 });
    expect(transaction.shipment.update).not.toHaveBeenCalled();
  });
});

describe("courier: input validation", () => {
  it.each([
    ["empty status", { status: " ", location: "Hub", description: "x" }],
    ["empty location", { status: "PICKED_UP", location: "", description: "x" }],
    ["empty description", { status: "PICKED_UP", location: "Hub", description: "  " }],
    ["unknown status", { status: "LOST", location: "Hub", description: "x" }],
    ["lowercase status", { status: "picked_up", location: "Hub", description: "x" }],
    ["status typo", { status: "DELIVERD", location: "Hub", description: "x" }]
  ])("rejects %s with HTTP 400 before opening a transaction", async (_label, value) => {
    const { db } = mockDb("ORDER_CREATED");
    await expect(
      recordCourierCheckpoint(db, "NEX-2026ABC234", value)
    ).rejects.toMatchObject({ StatusCode: 400 });
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it.each([[""], ["   "], [null]])("rejects invalid AWB %j with HTTP 400", async (awb) => {
    const { db } = mockDb("ORDER_CREATED");
    await expect(
      recordCourierCheckpoint(db, awb, checkpoint("PICKED_UP"))
    ).rejects.toMatchObject({ StatusCode: 400 });
  });

  it("returns HTTP 404 for an unknown AWB", async () => {
    const { db } = mockDb(null);
    await expect(
      recordCourierCheckpoint(db, "NEX-UNKNOWN", checkpoint("PICKED_UP"))
    ).rejects.toMatchObject({ StatusCode: 404 });
  });

  it("trims location and description before saving the event", async () => {
    const { db, transaction } = mockDb("ORDER_CREATED");
    await recordCourierCheckpoint(db, "NEX-2026ABC234", {
      status: " PICKED_UP ",
      location: "  Gudang Pontianak  ",
      description: "  Paket diambil kurir.  "
    });
    expect(transaction.trackingEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        status: "PICKED_UP",
        location: "Gudang Pontianak",
        description: "Paket diambil kurir."
      })
    });
  });
});
