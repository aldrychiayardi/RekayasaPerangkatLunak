import type { PrismaClient } from "@prisma/client";
import { ApiError } from "../lib/errors.js";
import { DESTINATION_CITIES, ORIGIN_CITY } from "../lib/locations.js";

export interface RateCalculationInput {
  originCity: string;
  destinationCity: string;
  weight: number;
  length: number;
  width: number;
  height: number;
}

export interface StoredRate {
  serviceType: string;
  ratePerKg: number;
  estimatedDays: string;
}

const defaultRates = {
  REGULAR: { rate: 12_000, estimatedDays: "2-3 Hari" },
  VEHICLE: { rate: 200_000, estimatedDays: "Sesuai jadwal" }
} as const;

export function calculateRates(
  input: RateCalculationInput,
  storedRates: StoredRate[]
) {
  const values = [input.weight, input.length, input.width, input.height];
  if (values.some((value) => !Number.isFinite(value) || value <= 0)) {
    throw new ApiError(400, "Berat dan dimensi harus berupa angka lebih besar dari 0.");
  }

  const actualWeight = Math.max(0.1, input.weight);
  const length = Math.max(1, input.length);
  const width = Math.max(1, input.width);
  const height = Math.max(1, input.height);
  const volumetricWeight =
    Math.round(((length * width * height) / 6000) * 100) / 100;
  const chargeableWeight = Math.max(
    1,
    Math.round(Math.max(actualWeight, volumetricWeight) * 10) / 10
  );
  const regular = storedRates.find((rate) => rate.serviceType === "REGULAR");
  const vehicle = storedRates.find((rate) => rate.serviceType === "VEHICLE");
  const regularRate = regular && regular.ratePerKg > 0
    ? regular.ratePerKg
    : defaultRates.REGULAR.rate;
  const vehicleRate = vehicle && vehicle.ratePerKg > 0
    ? vehicle.ratePerKg
    : defaultRates.VEHICLE.rate;

  return {
    volumetricWeight,
    actualWeight,
    chargeableWeight,
    services: [
      {
        serviceType: "REGULAR",
        serviceName: "Reguler",
        rateAmount: regularRate,
        rateUnit: "kg",
        totalCost: Math.round(regularRate * chargeableWeight),
        estimatedDays: regular?.estimatedDays && regular.estimatedDays !== "Belum ditentukan"
          ? regular.estimatedDays
          : defaultRates.REGULAR.estimatedDays,
        description: "Pengiriman reguler dengan tarif berdasarkan berat tagihan.",
        isEligible: true
      },
      {
        serviceType: "VEHICLE",
        serviceName: "Kendaraan",
        rateAmount: vehicleRate,
        rateUnit: "unit",
        totalCost: vehicleRate,
        estimatedDays: vehicle?.estimatedDays && vehicle.estimatedDays !== "Belum ditentukan"
          ? vehicle.estimatedDays
          : defaultRates.VEHICLE.estimatedDays,
        description: "Jasa pengiriman kendaraan dengan tarif per unit.",
        isEligible: true
      }
    ]
  };
}

export async function calculateRatesForRoute(
  db: Pick<PrismaClient, "priceRate">,
  input: RateCalculationInput
) {
  if (
    input.originCity !== ORIGIN_CITY ||
    !DESTINATION_CITIES.some((city) => city === input.destinationCity)
  ) {
    throw new ApiError(400, "Rute hanya tersedia dari Pontianak ke wilayah rute Seluas.");
  }

  const storedRates = await db.priceRate.findMany({
    where: {
      originCity: input.originCity,
      destinationCity: input.destinationCity
    }
  });
  if (storedRates.length === 0) {
    throw new ApiError(
      404,
      `Tarif untuk rute ${input.originCity} ke ${input.destinationCity} belum tersedia.`
    );
  }

  return calculateRates(input, storedRates);
}
