"use client";

import { useState } from "react";
import { createAdminAction, type AuthUser } from "@/actions/auth-actions";
import { Loader2 } from "lucide-react";

export function AdminAccountsPanel({ initialUsers }: { initialUsers: AuthUser[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      const result = await createAdminAction({ name, email, password });
      const createdUser = result.user;
      if (!result.success || !createdUser) {
        setMessageIsError(true);
        setMessage(result.error ?? "Gagal membuat akun admin.");
        return;
      }

      setUsers((currentUsers) => [createdUser, ...currentUsers]);
      setName("");
      setEmail("");
      setPassword("");
      setMessageIsError(false);
      setMessage("Akun admin berhasil dibuat. Sampaikan kata sandi melalui jalur aman.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900"
      >
        <div>
          <h3 className="text-base font-black">Buat akun Admin</h3>
          <p className="mt-1 text-xs text-slate-500">
            Akun ini mendapat akses operasional. Gunakan kata sandi unik minimal 12 karakter.
          </p>
        </div>
        <label className="block space-y-1 text-xs font-bold">
          Nama
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
        </label>
        <label className="block space-y-1 text-xs font-bold">
          Email
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
        </label>
        <label className="block space-y-1 text-xs font-bold">
          Kata sandi awal
          <input
            required
            type="password"
            minLength={12}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-xl bg-purple-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Buat Admin
        </button>
        {message && (
          <p
            aria-live="polite"
            className={`text-sm font-semibold ${messageIsError ? "text-red-600" : "text-slate-600 dark:text-slate-300"}`}
          >
            {message}
          </p>
        )}
      </form>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h3 className="font-black">Akun terdaftar</h3>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between gap-4 px-6 py-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{user.name}</p>
                <p className="truncate text-xs text-slate-500">{user.email}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black dark:bg-slate-800">
                {user.role}
              </span>
            </div>
          ))}
          {users.length === 0 && (
            <p className="px-6 py-8 text-center text-sm text-slate-500">Belum ada akun.</p>
          )}
        </div>
      </div>
    </div>
  );
}
