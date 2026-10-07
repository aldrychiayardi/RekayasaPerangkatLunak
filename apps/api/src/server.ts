import "./lib/environment.js";
import { app } from "./app.js";
import { prisma } from "./lib/prisma.js";

const port = Number(process.env.API_PORT ?? 4000);
const server = app.listen(port, () => {
  console.log(`Lecturer GitHub Tracker API berjalan di http://localhost:${port}`);
});

async function shutdown(): Promise<void> {
  server.close(async (error) => {
    if (error) {
      console.error("Gagal menutup server API dengan bersih:", error);
      process.exitCode = 1;
    }
    await prisma.$disconnect();
  });
}

process.on("SIGINT", () => void shutdown());
process.on("SIGTERM", () => void shutdown());
