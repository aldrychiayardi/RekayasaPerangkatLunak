import { describe, expect, it, vi } from "vitest";
import type { PrismaClient } from "@prisma/client";
import { bootstrapOwner } from "../services/owner-bootstrap.service.js";

function createDb(existingOwner: { id: string } | null = null, existingUser: { id: string } | null = null) {
  const findFirst = vi.fn().mockResolvedValue(existingOwner);
  const findUnique = vi.fn().mockResolvedValue(existingUser);
  const create = vi.fn().mockResolvedValue({ id: "owner-id" });
  const db = {
    user: { findFirst, findUnique, create }
  } as unknown as Pick<PrismaClient, "user">;

  return { db, findFirst, findUnique, create };
}

const config = {
  name: "Initial Owner",
  email: "OWNER@example.com",
  password: "a-strong-password"
};

describe("bootstrapOwner", () => {
  it("does nothing when bootstrap variables are absent", async () => {
    const { db, findFirst, create } = createDb();

    await expect(bootstrapOwner(db, {})).resolves.toBe(false);
    expect(findFirst).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it("creates a hashed OWNER account when no owner exists", async () => {
    const { db, create } = createDb();

    await expect(bootstrapOwner(db, config)).resolves.toBe(true);
    expect(create).toHaveBeenCalledOnce();
    expect(create.mock.calls[0][0].data).toMatchObject({
      name: "Initial Owner",
      email: "owner@example.com",
      role: "OWNER"
    });
    expect(create.mock.calls[0][0].data.password).not.toBe(config.password);
  });

  it("does not alter an existing OWNER", async () => {
    const { db, findUnique, create } = createDb({ id: "existing-owner" });

    await expect(bootstrapOwner(db, config)).resolves.toBe(false);
    expect(findUnique).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it("rejects partial configuration and weak passwords", async () => {
    const { db, create } = createDb();

    await expect(bootstrapOwner(db, { name: config.name })).rejects.toThrow(
      "harus diisi bersama"
    );
    await expect(bootstrapOwner(db, { ...config, password: "short" })).rejects.toThrow(
      "minimal harus 12 karakter"
    );
    expect(create).not.toHaveBeenCalled();
  });

  it("does not turn an existing non-owner account into an OWNER", async () => {
    const { db, create } = createDb(null, { id: "customer-id" });

    await expect(bootstrapOwner(db, config)).rejects.toThrow(
      "sudah digunakan akun lain"
    );
    expect(create).not.toHaveBeenCalled();
  });
});
