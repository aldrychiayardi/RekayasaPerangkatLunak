import { Router } from "express";
import bcrypt from "bcryptjs";
import { ApiError } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import { signToken } from "../lib/jwt.js";
import { authenticate, requireRole } from "../lib/auth-middleware.js";

export const authRouter = Router();

function requireString(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new ApiError(400, `${label} wajib diisi.`);
  }
  return value.trim();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Register user baru (default role: CUSTOMER)
authRouter.post("/register", async (req, res) => {
  const body = req.body as Record<string, unknown>;
  const name = requireString(body?.name, "Nama lengkap");
  const email = requireString(body?.email, "Email").toLowerCase();
  const password = requireString(body?.password, "Kata sandi");

  if (!isValidEmail(email)) {
    throw new ApiError(400, "Format email tidak valid.");
  }

  if (password.length < 6) {
    throw new ApiError(400, "Kata sandi minimal harus 6 karakter.");
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new ApiError(409, "Email sudah terdaftar. Silakan gunakan email lain atau login.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "CUSTOMER",
    },
  });

  const token = signToken({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  res.status(201).json({
    message: "Registrasi berhasil.",
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// Login akun
authRouter.post("/login", async (req, res) => {
  const body = req.body as Record<string, unknown>;
  const email = requireString(body?.email, "Email").toLowerCase();
  const password = requireString(body?.password, "Kata sandi");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError(401, "Email atau kata sandi tidak sesuai.");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Email atau kata sandi tidak sesuai.");
  }

  const token = signToken({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  res.json({
    message: "Login berhasil.",
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// Profil akun yang sedang login
authRouter.get("/me", authenticate(), async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new ApiError(404, "Data pengguna tidak ditemukan.");
  }

  res.json({ user });
});

// Kelola data pengguna (hanya bisa diakses oleh OWNER)
authRouter.get("/users", authenticate(), requireRole("OWNER"), async (_req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: { shipments: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ users });
});

