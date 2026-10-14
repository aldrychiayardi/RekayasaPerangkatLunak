import "./lib/environment.js";
import { app } from "./app.js";
import { prisma } from "./lib/prisma.js";

const port = Number(process.env.API_PORT ?? 4000);
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
