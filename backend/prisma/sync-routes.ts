import { PrismaClient } from "@prisma/client";
import { config as loadEnvironment } from "dotenv";
import { resolve } from "node:path";
import { DESTINATION_CITIES, ORIGIN_CITY } from "../src/lib/locations.js";

loadEnvironment({ path: resolve(process.cwd(), "../.env") });

const prisma = new PrismaClient();
const serviceTypes = ["REGULAR", "VEHICLE"] as const;

async function main() {
  const routes = DESTINATION_CITIES.flatMap((destinationCity) =>
    serviceTypes.map((serviceType) => ({
      originCity: ORIGIN_CITY,
      destinationCity,
      serviceType,
      ratePerKg: serviceType === "REGULAR" ? 12000 : 200000,
      estimatedDays: serviceType === "REGULAR" ? "2-3 Hari" : "Sesuai jadwal"
    }))
  );

  const createdCount = await prisma.$transaction(async (transaction) => {
    const existingRoutes = await transaction.priceRate.findMany({
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
      await transaction.priceRate.createMany({ data: missingRoutes });
    }
    return missingRoutes.length;
  });

  console.log(
    `Rute Pontianak disiapkan: ${createdCount} tarif baru ditambahkan. Tarif yang sudah ada tetap dipertahankan.`
  );
}

main()
  .catch((error: unknown) => {
    console.error("Gagal memperbarui rute:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
