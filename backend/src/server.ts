import "./lib/environment.js";
import { app } from "./app.js";
import { prisma } from "./lib/prisma.js";
import { ensureDefaultRates } from "./services/default-rates.service.js";
import { bootstrapOwner } from "./services/owner-bootstrap.service.js";

const port = Number(process.env.PORT ?? process.env.API_PORT ?? 4000);

async function startServer(): Promise<void> {
  const ownerCreated = await bootstrapOwner(prisma, {
    name: process.env.OWNER_BOOTSTRAP_NAME,
    email: process.env.OWNER_BOOTSTRAP_EMAIL,
    password: process.env.OWNER_BOOTSTRAP_PASSWORD
  });
  if (ownerCreated) {
    console.log("Initial OWNER account provisioned.");
  }

  const createdRates = await ensureDefaultRates(prisma);
  console.log(`Rute tarif tersedia: ${createdRates} tarif baru ditambahkan.`);

  const server = app.listen(port, () => {
    console.log(`NusantaraExpress API berjalan di http://localhost:${port}`);
  });

  function shutdown(): void {
    server.close((error) => {
      if (error) {
        console.error("Gagal menutup server:", error);
        process.exitCode = 1;
      }
      void prisma.$disconnect();
    });
  }

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

void startServer().catch((error: unknown) => {
  console.error("Gagal menyiapkan database API:", error);
  void prisma.$disconnect().finally(() => {
    process.exitCode = 1;
  });
});
