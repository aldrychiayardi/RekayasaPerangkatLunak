import { PrismaClient } from "@prisma/client";
import { config as loadEnvironment } from "dotenv";
import { resolve } from "node:path";
import { ensureDefaultRates } from "../src/services/default-rates.service.js";

loadEnvironment({ path: resolve(process.cwd(), "../.env") });

const prisma = new PrismaClient();

async function main() {
  const createdCount = await ensureDefaultRates(prisma);

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
