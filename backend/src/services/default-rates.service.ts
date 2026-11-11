import type { PrismaClient } from "@prisma/client";
import { DESTINATION_CITIES, ORIGIN_CITY } from "../lib/locations.js";

const serviceTypes = ["REGULAR", "VEHICLE"] as const;

export async function ensureDefaultRates(
  db: Pick<PrismaClient, "priceRate">
): Promise<number> {
  const routes = DESTINATION_CITIES.flatMap((destinationCity) =>
    serviceTypes.map((serviceType) => ({
      originCity: ORIGIN_CITY,
      destinationCity,
      serviceType,
      ratePerKg: serviceType === "REGULAR" ? 12000 : 200000,
      estimatedDays: serviceType === "REGULAR" ? "2-3 Hari" : "Sesuai jadwal"
    }))
  );
  const existingRoutes = await db.priceRate.findMany({
    where: {
      originCity: ORIGIN_CITY,
      destinationCity: { in: [...DESTINATION_CITIES] }
    },
    select: {
      destinationCity: true,
      serviceType: true
    }
  });
  const existingKeys = new Set(
    existingRoutes.map(({ destinationCity, serviceType }) => `${destinationCity}:${serviceType}`)
  );
  const missingRoutes = routes.filter(
    ({ destinationCity, serviceType }) => !existingKeys.has(`${destinationCity}:${serviceType}`)
  );

  if (missingRoutes.length > 0) {
    await db.priceRate.createMany({ data: missingRoutes });
  }

  return missingRoutes.length;
}
