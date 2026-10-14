"use client";

import { useState } from "react";
import Link from "next/link";
import {
  PackageCheck,
  Calculator,
  LayoutDashboard,
  Truck,
  ShieldCheck,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [portalDropdownOpen, setPortalDropdownOpen] = useState(false);

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
        <nav className="hidden md:flex items-center gap-7">
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
              onClick={() => setPortalDropdownOpen(!portalDropdownOpen)}
              onBlur={() => setTimeout(() => setPortalDropdownOpen(false), 200)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3.5 py-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <LayoutDashboard className="w-4 h-4 text-orange-600" />
              <span>Akses Portal</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {portalDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Pilih Akses Peran
                </div>
                <Link
                  href="/dashboard/customer"
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-orange-950/40 hover:text-orange-600 transition"
                >
                  <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-orange-600">
                    <PackageCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold leading-tight">Portal Pelanggan</div>
                    <div className="text-[11px] text-slate-500">Kirim & Cetak Label Thermal</div>
                  </div>
                </Link>
                <Link
                  href="/dashboard/courier"
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-orange-950/40 hover:text-orange-600 transition"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold leading-tight">Portal Kurir & Hub</div>
                    <div className="text-[11px] text-slate-500">Scanner & Update Status AWB</div>
                  </div>
                </Link>
                <Link
                  href="/dashboard/admin"
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-orange-950/40 hover:text-orange-600 transition"
                >
                  <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold leading-tight">Admin Dashboard</div>
                    <div className="text-[11px] text-slate-500">Metrik, Tarif & Master Data</div>
                  </div>
                </Link>
              </div>
            )}
          </div>
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
            <Link
              href="/dashboard/customer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-sm font-medium py-1.5 text-orange-600"
            >
              <PackageCheck className="w-4 h-4" /> Portal Pelanggan
            </Link>
            <Link
              href="/dashboard/courier"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-sm font-medium py-1.5 text-blue-600"
            >
              <Truck className="w-4 h-4" /> Portal Kurir & Hub
            </Link>
            <Link
              href="/dashboard/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-sm font-medium py-1.5 text-purple-600"
            >
              <ShieldCheck className="w-4 h-4" /> Admin Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
