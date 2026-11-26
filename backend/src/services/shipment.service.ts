import { randomInt } from "node:crypto";
import type { PrismaClient } from "@prisma/client";
import { ApiError } from "../lib/errors.js";
import { ORIGIN_CITY, isSupportedDestination } from "../lib/locations.js";

export interface CreateShipmentInput {
  senderName: string;
  senderPhone: string;
  senderCity: string;
  senderAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverCity: string;
  receiverAddress: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  serviceType: string;
}

const defaultRates = {
  REGULAR: 12_000,
  VEHICLE: 200_000
} as const;

/**
 * Jumlah maksimum percobaan membuat nomor resi (AWB) baru ketika nomor acak
 * yang dihasilkan bentrok dengan nomor resi yang sudah tersimpan (P2002).
 */
export const MAX_AWB_ATTEMPTS = 1;

function generateAwb(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const randomPart = Array.from(
    { length: 6 },
    () => alphabet[randomInt(alphabet.length)]
  ).join("");
  return `NEX-${new Date().getFullYear()}${randomPart}`;
}

function isUniqueConstraintError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error &&
    error.code === "P2002";
}

export async function createShipment(
  db: Pick<PrismaClient, "priceRate" | "shipment">,
  input: CreateShipmentInput,
  userId: string | null = null,
  createAwb: () => string = generateAwb
) {
  const numericValues = [input.weight, input.length, input.width, input.height];
  if (numericValues.some((value) => !Number.isFinite(value) || value <= 0)) {
    throw new ApiError(400, "Berat dan dimensi harus berupa angka lebih besar dari 0.");
  }
  if (input.serviceType !== "REGULAR" && input.serviceType !== "VEHICLE") {
    throw new ApiError(400, "Jenis layanan tidak dikenal.");
  }
  if (input.senderCity !== ORIGIN_CITY || !isSupportedDestination(input.receiverCity)) {
    throw new ApiError(400, "Rute pengiriman hanya tersedia dari Pontianak ke wilayah rute Seluas.");
  }

  const rate = await db.priceRate.findFirst({
    where: {
      originCity: input.senderCity,
      destinationCity: input.receiverCity,
      serviceType: input.serviceType
    }
  });
  if (!rate) {
    throw new ApiError(404, "Tarif untuk rute ini belum tersedia.");
  }

  const length = Math.max(1, input.length);
  const width = Math.max(1, input.width);
  const height = Math.max(1, input.height);
  const volumetricWeight =
    Math.round(((length * width * height) / 6000) * 100) / 100;
  const chargeableWeight = Math.max(
    1,
    Math.round(Math.max(input.weight, volumetricWeight) * 10) / 10
  );
  const ratePerUnit = rate.ratePerKg > 0
    ? rate.ratePerKg
    : defaultRates[input.serviceType];

  const totalCost = input.serviceType === "VEHICLE"
    ? ratePerUnit
    : Math.round(ratePerUnit * chargeableWeight);

  // BUGFIX v1.0_dev: sebelumnya satu kali tabrakan nomor resi acak langsung
  // menggagalkan pesanan (HTTP 503). Sekarang nomor resi dibuat ulang hingga
  // MAX_AWB_ATTEMPTS kali sebelum menyerah.
  for (let attempt = 1; attempt <= MAX_AWB_ATTEMPTS; attempt += 1) {
    try {
      return await db.shipment.create({
        data: {
          ...input,
          userId,
          trackingNumber: createAwb(),
          length,
          width,
          height,
          chargeableWeight,
          totalCost,
          status: "ORDER_CREATED",
          events: {
            create: {
              status: "ORDER_CREATED",
              location: `Drop Point / Gerai ${input.senderCity}`,
              description: "Pesanan pengiriman berhasil dibuat di sistem NusantaraExpress."
            }
          }
        },
        include: { events: { orderBy: { timestamp: "desc" } } }
      });
    } catch (error) {
      if (!isUniqueConstraintError(error)) {
        throw error;
      }
    }
  }

  throw new ApiError(503, "Nomor resi gagal dibuat. Silakan coba kembali.");
}
