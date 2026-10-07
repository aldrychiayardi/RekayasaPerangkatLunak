import { PrismaClient } from "../generated/prisma/index.js";

const globalForPrisma = globalThis as typeof globalThis & {
  TrackerPrisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.TrackerPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.TrackerPrisma = prisma;
}
