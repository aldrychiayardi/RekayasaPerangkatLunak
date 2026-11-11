import type { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

export interface OwnerBootstrapConfig {
  name?: string;
  email?: string;
  password?: string;
}

export async function bootstrapOwner(
  db: Pick<PrismaClient, "user">,
  config: OwnerBootstrapConfig
): Promise<boolean> {
  const { name, email, password } = config;
  const configuredValues = [name, email, password].filter((value) => value !== undefined);
  if (configuredValues.length === 0) {
    return false;
  }

  if (!name?.trim() || !email?.trim() || !password) {
    throw new Error(
      "OWNER_BOOTSTRAP_NAME, OWNER_BOOTSTRAP_EMAIL, dan OWNER_BOOTSTRAP_PASSWORD harus diisi bersama."
    );
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new Error("OWNER_BOOTSTRAP_EMAIL harus berisi alamat email yang valid.");
  }
  if (password.length < 12) {
    throw new Error("OWNER_BOOTSTRAP_PASSWORD minimal harus 12 karakter.");
  }

  const existingOwner = await db.user.findFirst({
    where: { role: "OWNER" },
    select: { id: true }
  });
  if (existingOwner) {
    return false;
  }

  const existingUser = await db.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true }
  });
  if (existingUser) {
    throw new Error(
      "Email OWNER_BOOTSTRAP_EMAIL sudah digunakan akun lain; bootstrap OWNER dibatalkan."
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  await db.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "OWNER"
    }
  });

  return true;
}
