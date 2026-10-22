import { describe, expect, it, vi } from "vitest";
import type { PrismaClient } from "@prisma/client";
import { ApiError } from "../lib/errors.js";
import { updateAdminRate } from "../services/admin-rates.service.js";

describe("admin rates service", () => {
  it("updates the stored base rate and estimated delivery time", async () => {
    const updatedRate = {
      id: "rate-1",
      ratePerKg: 225_000,
      estimatedDays: "3-5 Hari"
    };
    const update = vi.fn().mockResolvedValue(updatedRate);
    const db = {
      priceRate: { update }
    } as unknown as Pick<PrismaClient, "priceRate">;

    await expect(
      updateAdminRate(db, "rate-1", {
        ratePerKg: 225_000,
        estimatedDays: "  3-5 Hari  "
      })
    ).resolves.toBe(updatedRate);
    expect(update).toHaveBeenCalledWith({
      where: { id: "rate-1" },
      data: { ratePerKg: 225_000, estimatedDays: "3-5 Hari" }
    });
  });

  it("rejects zero/negative rates and an empty estimate without updating", async () => {
    const update = vi.fn();
    const db = {
      priceRate: { update }
    } as unknown as Pick<PrismaClient, "priceRate">;

    await expect(
      updateAdminRate(db, "rate-1", { ratePerKg: 0, estimatedDays: "2 Hari" })
    ).rejects.toThrow(ApiError);
    await expect(
      updateAdminRate(db, "rate-1", { ratePerKg: 12_000, estimatedDays: " " })
    ).rejects.toThrow(ApiError);
    expect(update).not.toHaveBeenCalled();
  });

  it("maps an unknown rate ID to a not-found API error", async () => {
    const db = {
      priceRate: {
        update: vi.fn().mockRejectedValue({ code: "P2025" })
      }
    } as unknown as Pick<PrismaClient, "priceRate">;

    await expect(
      updateAdminRate(db, "missing", { ratePerKg: 12_000, estimatedDays: "2 Hari" })
    ).rejects.toMatchObject({ StatusCode: 404 });
  });
});
