import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
  NusantaraPrisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.NusantaraPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.NusantaraPrisma = prisma;
}
