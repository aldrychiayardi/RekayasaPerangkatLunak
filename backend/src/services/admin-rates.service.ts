import type { PrismaClient } from "@prisma/client";
import { ApiError } from "../lib/errors.js";

export interface UpdateRateInput {
  ratePerKg: number;
  estimatedDays: string;
}

function isRecordNotFoundError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error &&
    error.code === "P2025";
}

export async function updateAdminRate(
  db: Pick<PrismaClient, "priceRate">,
  id: string,
  input: UpdateRateInput
) {
  if (!id.trim()) {
    throw new ApiError(400, "ID tarif tidak valid.");
  }
  if (!Number.isFinite(input.ratePerKg) || input.ratePerKg <= 0) {
    throw new ApiError(400, "Tarif harus lebih besar dari 0.");
  }
  if (!input.estimatedDays.trim()) {
    throw new ApiError(400, "Estimasi waktu wajib diisi.");
  }

  try {
    return await db.priceRate.update({
      where: { id },
      data: {
        ratePerKg: input.ratePerKg,
        estimatedDays: input.estimatedDays.trim()
      }
    });
  } catch (error) {
    if (isRecordNotFoundError(error)) {
      throw new ApiError(404, "Data tarif tidak ditemukan.");
    }
    throw error;
  }
}
