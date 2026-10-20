import type { PrismaClient } from "@prisma/client";
import { ApiError } from "../lib/errors.js";
import { normalizeAwb } from "./tracking.service.js";

const statusSequence = [
  "ORDER_CREATED",
  "PICKED_UP",
  "AT_ORIGIN_HUB",
  "IN_TRANSIT",
  "AT_DESTINATION_HUB",
  "OUT_FOR_DELIVERY",
  "DELIVERED"
] as const;

export interface CourierCheckpointInput {
  status: string;
  location: string;
  description: string;
}

export async function recordCourierCheckpoint(
  db: Pick<PrismaClient, "$transaction">,
  awb: unknown,
  input: CourierCheckpointInput
) {
  const trackingNumber = normalizeAwb(awb);
  const status = input.status.trim();
  const location = input.location.trim();
  const description = input.description.trim();

  if (!status || !location || !description) {
    throw new ApiError(400, "Status, lokasi, dan keterangan checkpoint wajib diisi.");
  }
  if (!statusSequence.includes(status as (typeof statusSequence)[number]) && status !== "FAILED") {
    throw new ApiError(400, "Status pengiriman tidak dikenal.");
  }

  return db.$transaction(async (transaction) => {
    const shipment = await transaction.shipment.findUnique({
      where: { trackingNumber }
    });
    if (!shipment) {
      throw new ApiError(404, `Paket dengan nomor resi ${trackingNumber} tidak ditemukan.`);
    }

    const currentIndex = statusSequence.indexOf(
      shipment.status as (typeof statusSequence)[number]
    );
    const nextIndex = statusSequence.indexOf(status as (typeof statusSequence)[number]);
    const alreadyTerminal = shipment.status === "DELIVERED" || shipment.status === "FAILED";
    const isAllowedFailure = status === "FAILED" && !alreadyTerminal;
    const isNextStatus = currentIndex >= 0 && nextIndex === currentIndex + 1;
    if (alreadyTerminal || (!isAllowedFailure && !isNextStatus)) {
      throw new ApiError(
        409,
        `Urutan status tidak valid: ${shipment.status} tidak dapat diperbarui menjadi ${status}.`
      );
    }

    const event = await transaction.trackingEvent.create({
      data: {
        shipmentId: shipment.id,
        status,
        location,
        description,
        timestamp: new Date()
      }
    });
    await transaction.shipment.update({
      where: { id: shipment.id },
      data: { status, updatedAt: new Date() }
    });
    return event;
  });
}
