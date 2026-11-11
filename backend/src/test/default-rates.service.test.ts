import { describe, expect, it, vi } from "vitest";
import type { PrismaClient } from "@prisma/client";
import { ensureDefaultRates } from "../services/default-rates.service.js";

function createDb(existingRoutes: Array<{ destinationCity: string; serviceType: string }> = []) {
  const findMany = vi.fn().mockResolvedValue(existingRoutes);
  const createMany = vi.fn().mockResolvedValue({ count: 0 });
  const db = {
    priceRate: { findMany, createMany }
  } as unknown as Pick<PrismaClient, "priceRate">;

  return { db, findMany, createMany };
}

describe("ensureDefaultRates", () => {
  it("adds default rates for all supported routes when none exist", async () => {
    const { db, createMany } = createDb();

    await expect(ensureDefaultRates(db)).resolves.toBe(14);
    expect(createMany).toHaveBeenCalledOnce();
    expect(createMany.mock.calls[0][0].data).toHaveLength(14);
  });

  it("only adds missing rates and leaves existing route rates untouched", async () => {
    const { db, createMany } = createDb([
      { destinationCity: "Kubu Raya", serviceType: "REGULAR" }
    ]);

    await expect(ensureDefaultRates(db)).resolves.toBe(13);

    const insertedRoutes = createMany.mock.calls[0][0].data;
    expect(insertedRoutes).toHaveLength(13);
    expect(insertedRoutes).not.toContainEqual(
      expect.objectContaining({ destinationCity: "Kubu Raya", serviceType: "REGULAR" })
    );
  });

  it("does not write when all supported rates already exist", async () => {
    const destinations = ["Kubu Raya", "Sungai Pinyuh", "Anjongan", "Toho", "Menjalin", "Karangan", "Seluas"];
    const existingRoutes = destinations.flatMap((destinationCity) => [
      { destinationCity, serviceType: "REGULAR" },
      { destinationCity, serviceType: "VEHICLE" }
    ]);
    const { db, createMany } = createDb(existingRoutes);

    await expect(ensureDefaultRates(db)).resolves.toBe(0);
    expect(createMany).not.toHaveBeenCalled();
  });
});
