import { describe, expect, it, vi } from "vitest";
import type { PrismaClient } from "@prisma/client";
import { updateAdminRate } from "../services/admin-rates.service.js";

describe("admin rates: validation table", () => {
  function mockDb() {
    const update = vi.fn().mockResolvedValue({ id: "rate-1" });
    return {
      update,
      db: { priceRate: { update } } as unknown as Pick<PrismaClient, "priceRate">
    };
  }

  it.each([
    ["empty id", "", 10_000, "2 Hari"],
    ["blank id", "   ", 10_000, "2 Hari"],
    ["zero rate", "rate-1", 0, "2 Hari"],
    ["negative rate", "rate-1", -100, "2 Hari"],
    ["NaN rate", "rate-1", Number.NaN, "2 Hari"],
    ["Infinity rate", "rate-1", Number.POSITIVE_INFINITY, "2 Hari"],
    ["empty estimate", "rate-1", 10_000, ""],
    ["blank estimate", "rate-1", 10_000, "   "]
  ])("rejects %s with HTTP 400", async (_label, id, ratePerKg, estimatedDays) => {
    const { db, update } = mockDb();
    await expect(
      updateAdminRate(db, id, { ratePerKg, estimatedDays })
    ).rejects.toMatchObject({ StatusCode: 400 });
    expect(update).not.toHaveBeenCalled();
  });

  it.each([
    [1, "1 Hari"],
    [12_000, " 2-3 Hari "],
    [250_000, "Sesuai jadwal"]
  ])("accepts rate %d with estimate %j", async (ratePerKg, estimatedDays) => {
    const { db, update } = mockDb();
    await updateAdminRate(db, "rate-1", { ratePerKg, estimatedDays });
    expect(update).toHaveBeenCalledWith({
      where: { id: "rate-1" },
      data: { ratePerKg, estimatedDays: estimatedDays.trim() }
    });
  });

  it("maps Prisma P2025 to HTTP 404", async () => {
    const { db, update } = mockDb();
    update.mockRejectedValueOnce({ code: "P2025" });
    await expect(
      updateAdminRate(db, "missing", { ratePerKg: 1, estimatedDays: "1 Hari" })
    ).rejects.toMatchObject({ StatusCode: 404 });
  });
});
