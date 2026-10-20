"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PackageCheck,
  Calculator,
  LayoutDashboard,
  Truck,
  ShieldCheck,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
  Shield,
  LogIn,
} from "lucide-react";
import { getCurrentUser, logoutAction, type AuthUser } from "@/actions/auth-actions";

export function Navbar() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [portalDropdownOpen, setPortalDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getCurrentUser()
      .then((u) => {
        if (isMounted) setUser(u);
      })
      .finally(() => {
        if (isMounted) setLoadingUser(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    await logoutAction();
    setUser(null);
    setUserDropdownOpen(false);
    router.push("/");
    router.refresh();
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "OWNER":
        return {
          label: "OWNER",
          badgeClass: "bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
          icon: Shield,
        };
      case "ADMIN":
        return {
          label: "ADMIN",
          badgeClass: "bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
          icon: ShieldCheck,
        };
      case "COURIER":
        return {
          label: "KURIR",
          badgeClass: "bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800",
          icon: Truck,
        };
      default:
        return {
          label: "PELANGGAN",
          badgeClass: "bg-orange-100 dark:bg-orange-950/70 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800",
          icon: User,
        };
    }
  };

  const roleInfo = user ? getRoleBadge(user.role) : null;
  const RoleIcon = roleInfo?.icon;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/75 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition duration-200">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white leading-none">
              Nusantara<span className="text-orange-600">Express</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400 mt-0.5">
              Ekspedisi Logistik Terpadu
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-5">
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-500 transition"
          >
            Beranda
          </Link>
          <Link
            href="/track"
            className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-500 transition flex items-center gap-1.5"
          >
            <PackageCheck className="w-4 h-4 text-orange-600" />
            Lacak Resi
          </Link>
          <Link
            href="/rates"
            className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-500 transition flex items-center gap-1.5"
          >
            <Calculator className="w-4 h-4 text-orange-600" />
            Cek Ongkir
          </Link>

          {/* Portal Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setPortalDropdownOpen(!portalDropdownOpen);
                setUserDropdownOpen(false);
              }}
              className="inline-flex items-center gap-1.5 text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4 text-orange-600" />
              <span>Akses Portal</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {portalDropdownOpen && (
              <div
                onMouseLeave={() => setPortalDropdownOpen(false)}
                className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
              >
                <div className="px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {user ? `Portal Sesuai Hak Akses (${user.role})` : "Pilih Akses Portal"}
                </div>

                {/* Role: Customer or Owner */}
                {(!user || user.role === "CUSTOMER" || user.role === "OWNER") && (
                  <Link
                    href="/dashboard/customer"
                    onClick={() => setPortalDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-orange-950/40 hover:text-orange-600 transition"
                  >
                    <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-orange-600 shrink-0">
                      <PackageCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold leading-tight">Portal Pelanggan</div>
                      <div className="text-[11px] text-slate-500">Kirim & Cetak Label Thermal</div>
                    </div>
                  </Link>
                )}

                {/* Role: Courier, Admin, or Owner */}
                {(!user || user.role === "COURIER" || user.role === "ADMIN" || user.role === "OWNER") && (
                  <Link
                    href="/dashboard/courier"
                    onClick={() => setPortalDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-orange-950/40 hover:text-orange-600 transition"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 shrink-0">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold leading-tight">Portal Kurir & Hub</div>
                      <div className="text-[11px] text-slate-500">Scanner & Checkpoint AWB</div>
                    </div>
                  </Link>
                )}

                {/* Role: Admin or Owner */}
                {(!user || user.role === "ADMIN" || user.role === "OWNER") && (
                  <Link
                    href="/dashboard/admin"
                    onClick={() => setPortalDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-orange-950/40 hover:text-orange-600 transition"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold leading-tight">
                        {user?.role === "OWNER" ? "Owner Dashboard" : "Admin Dashboard"}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {user?.role === "OWNER" ? "Tarif, Omset & Master Data" : "Operasional Pengiriman"}
                      </div>
                    </div>
                  </Link>
                )}

                {!user && (
                  <div className="px-3.5 pt-2 pb-1 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                    💡 Masuk akun untuk membatasi aksi sesuai hak akses.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Account / Auth Buttons */}
          {loadingUser ? (
            <div className="w-20 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                  setPortalDropdownOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-orange-300 dark:hover:border-slate-700 transition cursor-pointer shadow-xs"
              >
                <div className="w-6 h-6 rounded-lg bg-orange-600 text-white flex items-center justify-center text-xs font-black">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left flex flex-col">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight max-w-[110px] truncate">
                    {user.name}
                  </span>
                  {roleInfo && (
                    <span className="text-[9px] font-extrabold text-orange-600 leading-none">
                      {roleInfo.label}
                    </span>
                  )}
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div
                  onMouseLeave={() => setUserDropdownOpen(false)}
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                >
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    {roleInfo && (
                      <div className="mt-1.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${roleInfo.badgeClass}`}
                        >
                          {RoleIcon && <RoleIcon className="w-3 h-3" />}
                          {roleInfo.label}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar Akun (Logout)</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-orange-600 dark:hover:text-orange-500 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk</span>
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 px-3.5 py-1.5 rounded-lg shadow-sm transition"
              >
                Daftar
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pt-2 pb-6 space-y-3">
          {user ? (
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
                {roleInfo && (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold border mt-1.5 ${roleInfo.badgeClass}`}
                  >
                    {RoleIcon && <RoleIcon className="w-3 h-3" />}
                    {roleInfo.label}
                  </span>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2 pb-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center py-2 text-center text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center py-2 text-center text-xs font-bold rounded-xl bg-orange-600 text-white"
              >
                Daftar
              </Link>
            </div>
          )}

          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold py-2 text-slate-800 dark:text-slate-200"
          >
            Beranda
          </Link>
          <Link
            href="/track"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold py-2 text-slate-800 dark:text-slate-200"
          >
            Lacak Resi (Cek Resi)
          </Link>
          <Link
            href="/rates"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold py-2 text-slate-800 dark:text-slate-200"
          >
            Cek Ongkir (Kalkulator Tarif)
          </Link>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase">Pilih Portal Akses</div>
            {(!user || user.role === "CUSTOMER" || user.role === "OWNER") && (
              <Link
                href="/dashboard/customer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm font-medium py-1.5 text-orange-600"
              >
                <PackageCheck className="w-4 h-4" /> Portal Pelanggan
              </Link>
            )}
            {(!user || user.role === "COURIER" || user.role === "ADMIN" || user.role === "OWNER") && (
              <Link
                href="/dashboard/courier"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm font-medium py-1.5 text-blue-600"
              >
                <Truck className="w-4 h-4" /> Portal Kurir & Hub
              </Link>
            )}
            {(!user || user.role === "ADMIN" || user.role === "OWNER") && (
              <Link
                href="/dashboard/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm font-medium py-1.5 text-purple-600"
              >
                <ShieldCheck className="w-4 h-4" />{" "}
                {user?.role === "OWNER" ? "Owner Dashboard" : "Admin Dashboard"}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
