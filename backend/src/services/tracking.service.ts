import type { PrismaClient } from "@prisma/client";
import { ApiError } from "../lib/errors.js";

export function normalizeAwb(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new ApiError(400, "Nomor resi tidak valid.");
  }
  return value.trim().toUpperCase();
}

export async function getShipmentByAwb(
  db: Pick<PrismaClient, "shipment">,
  value: unknown
) {
  const trackingNumber = normalizeAwb(value);
  const shipment = await db.shipment.findUnique({
    where: { trackingNumber },
    include: { events: { orderBy: { timestamp: "desc" } } }
  });
  if (!shipment) {
    throw new ApiError(404, `Paket dengan nomor resi ${trackingNumber} tidak ditemukan.`);
  }
  return shipment;
}
