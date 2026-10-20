"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "ADMIN" | "COURIER" | "CUSTOMER";
  createdAt?: string;
  _count?: {
    shipments: number;
  };
}

interface AuthResponse {
  message?: string;
  token?: string;
  user?: AuthUser;
}

const baseUrl = (process.env.API_BASE_URL ?? "http://localhost:4000").replace(/\/+$/, "");

export async function loginAction(formData: {
  email: string;
  password: string;
}): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
      cache: "no-store",
    });

    const data = (await response.json()) as AuthResponse & { message?: string };

    if (!response.ok || !data.token || !data.user) {
      return {
        success: false,
        error: data.message || "Gagal masuk. Periksa kembali email dan kata sandi Anda.",
      };
    }

    const cookieStore = await cookies();
    cookieStore.set("auth_token", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    revalidatePath("/", "layout");
    return { success: true, user: data.user };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Tidak dapat terhubung ke server.";
    return { success: false, error: msg };
  }
}

export async function registerAction(formData: {
  name: string;
  email: string;
  password: string;
}): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
      cache: "no-store",
    });

    const data = (await response.json()) as AuthResponse & { message?: string };

    if (!response.ok || !data.token || !data.user) {
      return {
        success: false,
        error: data.message || "Registrasi gagal. Silakan coba lagi.",
      };
    }

    const cookieStore = await cookies();
    cookieStore.set("auth_token", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    revalidatePath("/", "layout");
    return { success: true, user: data.user };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Tidak dapat terhubung ke server.";
    return { success: false, error: msg };
  }
}

export async function logoutAction(): Promise<{ success: boolean }> {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) {
      return null;
    }

    const response = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { user: AuthUser };
    return data.user ?? null;
  } catch {
    return null;
  }
}

export async function getAllUsersAction(): Promise<AuthUser[]> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return [];

    const response = await fetch(`${baseUrl}/api/auth/users`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!response.ok) return [];

    const data = (await response.json()) as { users: AuthUser[] };
    return data.users ?? [];
  } catch {
    return [];
  }
}

