"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TrackingWidget } from "@/components/TrackingWidget";
import { RateCalculatorWidget } from "@/components/RateCalculatorWidget";
import {
  Truck,
  PackageCheck,
  Calculator,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Zap,
  Boxes,
} from "lucide-react";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"track" | "rates">("track");

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />

      {/* Hero Section with Integrated Tools Widget */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-12 pb-24 sm:pt-16 sm:pb-32">
        {/* Background glow graphics */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-orange-600 blur-[130px]" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-600 blur-[140px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Solusi Ekspedisi & Kargo Terpercaya se-Nusantara
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Kirim Paket Cepat & Terlacak Presisi{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">
                Hingga Pelosok Negeri
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Didukung armada multi-modal darat, laut, dan kargo udara yang menghubungkan 500+ kota di Indonesia dengan status tracking real-time dan tarif transparan.
            </p>
          </div>

          {/* Core Interactive Tool Card (Cek Resi & Cek Ongkir Tabs) */}
          <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-7 text-slate-900 dark:text-slate-100">
            {/* Tabs Header */}
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
              <button
                type="button"
                onClick={() => setActiveTab("track")}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition cursor-pointer ${
                  activeTab === "track"
                    ? "bg-orange-600 text-white shadow-md shadow-orange-600/30"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <PackageCheck className="w-4 h-4" />
                <span>Cek Resi (Lacak Paket)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("rates")}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition cursor-pointer ${
                  activeTab === "rates"
                    ? "bg-orange-600 text-white shadow-md shadow-orange-600/30"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <Calculator className="w-4 h-4" />
                <span>Cek Ongkir (Hitung Tarif)</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div>
              {activeTab === "track" ? (
                <TrackingWidget />
              ) : (
                <RateCalculatorWidget />
              )}
            </div>
          </div>

          {/* Quick Statistics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto mt-14 pt-8 border-t border-slate-800/80 text-center">
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-black text-orange-400">500+</div>
              <div className="text-xs sm:text-sm text-slate-400 font-medium mt-1">Hub & Drop Point Nusantara</div>
            </div>
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">99.4%</div>
              <div className="text-xs sm:text-sm text-slate-400 font-medium mt-1">Ketepatan Waktu Pengiriman</div>
            </div>
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-black text-amber-400">2.5 Juta+</div>
              <div className="text-xs sm:text-sm text-slate-400 font-medium mt-1">Paket Berhasil Terkirim</div>
            </div>
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-black text-cyan-400">24/7</div>
              <div className="text-xs sm:text-sm text-slate-400 font-medium mt-1">Monitoring & Layanan CS</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-orange-600">
              Pilihan Layanan Ekspedisi
            </h2>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Sesuaikan dengan Kebutuhan & Kecepatan Pengiriman Anda
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Mulai dari paket kilat dokumen harian hingga distribusi kargo berton-ton, NusantaraExpress memberikan solusi terbaik.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Service 1: Express */}
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-7 hover:border-orange-500/50 transition duration-200 group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950 flex items-center justify-center text-orange-600 mb-5 group-hover:scale-110 transition">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-black text-slate-900 dark:text-white">NEX EXPRESS</h4>
                  <span className="text-[11px] font-bold bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400 px-2.5 py-0.5 rounded-full">
                    1-2 Hari
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  Layanan pengiriman prioritas menggunakan jalur udara tercepat. Ideal untuk dokumen penting, makanan segar, dan paket darurat.
                </p>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Garansi uang kembali bila terlambat</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Prioritas pemrosesan di setiap hub sortir</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/rates"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700"
              >
                <span>Cek Tarif Express</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Service 2: Regular */}
            <div className="bg-slate-50 dark:bg-slate-800/60 border-2 border-orange-500/40 rounded-2xl p-7 shadow-sm relative group flex flex-col justify-between">
              <span className="absolute -top-3 right-6 bg-orange-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full">
                Paling Favorit
              </span>
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 mb-5 group-hover:scale-110 transition">
                  <Truck className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-black text-slate-900 dark:text-white">NEX REGULAR</h4>
                  <span className="text-[11px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 px-2.5 py-0.5 rounded-full">
                    2-3 Hari
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  Solusi pengiriman andalan belanja online (E-commerce) dan UMKM. Menjangkau seluruh kecamatan di Indonesia dengan ongkir hemat.
                </p>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Layanan jemput paket (Free Pickup)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Integrasi cetak label thermal otomatis</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/dashboard/customer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700"
              >
                <span>Mulai Kirim Sekarang</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Service 3: Cargo */}
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-7 hover:border-blue-500/50 transition duration-200 group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600 mb-5 group-hover:scale-110 transition">
                  <Boxes className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-black text-slate-900 dark:text-white">NEX CARGO</h4>
                  <span className="text-[11px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400 px-2.5 py-0.5 rounded-full">
                    3-5 Hari
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  Tarif super hemat khusus muatan besar di atas 10 Kg, pallet mesin, furniture, barang pindahan, hingga distribusi logistik B2B.
                </p>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Tarif per-kg hemat mulai Rp 8.000</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Armada truk Fuso, Wingbox & Kontainer</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/rates"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700"
              >
                <span>Hitung Tarif Kargo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Portal Switcher Showcase */}
      <section className="py-16 bg-slate-100 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 sm:p-12 text-white border border-slate-700">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              <div className="lg:col-span-1 space-y-3">
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                  Akses Sistem NusantaraExpress
                </span>
                <h3 className="text-2xl font-black">
                  Dirancang untuk Semua Kebutuhan Logistik
                </h3>
                <p className="text-sm text-slate-300">
                  Nikmati pengalaman terintegrasi dari pengirim paket perorangan, kurir lapangan, hingga manajemen admin ekspedisi.
                </p>
              </div>

              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Card Customer */}
                <Link
                  href="/dashboard/customer"
                  className="bg-white/10 hover:bg-white/15 backdrop-blur border border-white/10 p-5 rounded-2xl transition group"
                >
                  <PackageCheck className="w-8 h-8 text-orange-400 mb-3 group-hover:scale-110 transition" />
                  <h4 className="font-bold text-sm text-white mb-1">Customer Portal</h4>
                  <p className="text-xs text-slate-300 mb-4">
                    Buat order baru & cetak label thermal waybill standard.
                  </p>
                  <span className="text-xs font-bold text-orange-400 flex items-center gap-1">
                    Buka Portal <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>

                {/* Card Courier */}
                <Link
                  href="/dashboard/courier"
                  className="bg-white/10 hover:bg-white/15 backdrop-blur border border-white/10 p-5 rounded-2xl transition group"
                >
                  <Truck className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition" />
                  <h4 className="font-bold text-sm text-white mb-1">Courier & Hub Scanner</h4>
                  <p className="text-xs text-slate-300 mb-4">
                    Simulator scanner AWB & pembaruan status event perjalanan.
                  </p>
                  <span className="text-xs font-bold text-blue-400 flex items-center gap-1">
                    Buka Scanner <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>

                {/* Card Admin */}
                <Link
                  href="/dashboard/admin"
                  className="bg-white/10 hover:bg-white/15 backdrop-blur border border-white/10 p-5 rounded-2xl transition group"
                >
                  <ShieldCheck className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition" />
                  <h4 className="font-bold text-sm text-white mb-1">Admin Dashboard</h4>
                  <p className="text-xs text-slate-300 mb-4">
                    Pantau KPI logistik, master pengiriman & edit matriks ongkir.
                  </p>
                  <span className="text-xs font-bold text-purple-400 flex items-center gap-1">
                    Buka Admin <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
