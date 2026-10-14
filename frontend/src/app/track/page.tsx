"use client";

import { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TrackingWidget } from "@/components/TrackingWidget";
import { PackageCheck, ShieldCheck, MapPin, Truck } from "lucide-react";

export default function TrackPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />

      <main className="flex-1 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase">
              <PackageCheck className="w-3.5 h-3.5" />
              Live Tracking System
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Lacak Pengiriman Paket Anda
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Pantau lokasi paket Anda secara akurat dari titik penjemputan awal, hub sortir bandara, hingga tangan penerima.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 mb-12">
            <Suspense fallback={<div>Memuat widget...</div>}>
              <TrackingWidget />
            </Suspense>
          </div>

          {/* Logistics Guidance Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center sm:text-left">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-950 flex items-center justify-center text-orange-600 shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-900 dark:text-white">Update Setiap Hub</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Setiap perpindahan paket tercatat langsung melalui barcode scanner di seluruh checkpoint.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-900 dark:text-white">Akurasi Wilayah</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Informasi lokasi hub, sorting center, dan identitas kurir yang bertugas tercatat jelas.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-900 dark:text-white">Bukti Penerimaan Sah</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Status Terkirim dilengkapi nama penerima dan konfirmasi tanda terima resmi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
