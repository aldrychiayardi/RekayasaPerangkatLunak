"use client";

import { useState } from "react";
import { INDONESIAN_CITIES, formatIDR } from "@/lib/utils";
import { RateCalculatorWidget } from "@/components/RateCalculatorWidget";
import { Calculator, Layers } from "lucide-react";

export interface RateItem {
  id: string;
  originCity: string;
  destinationCity: string;
  serviceType: string;
  ratePerKg: number;
  estimatedDays: string;
}

interface RatesClientProps {
  initialRates: RateItem[];
}

export function RatesClient({ initialRates }: RatesClientProps) {
  const [filterOrigin, setFilterOrigin] = useState("ALL");
  const [filterDest, setFilterDest] = useState("ALL");
  const [filterService, setFilterService] = useState("ALL");

  const filteredRates = initialRates.filter((rate) => {
    if (filterOrigin !== "ALL" && rate.originCity !== filterOrigin) return false;
    if (filterDest !== "ALL" && rate.destinationCity !== filterDest) return false;
    if (filterService !== "ALL" && rate.serviceType !== filterService) return false;
    return true;
  });

  return (
    <div className="space-y-12">
      {/* Rate Calculator Section */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-9 shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <Calculator className="w-5 h-5 text-orange-600" />
          <h2 className="text-base font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
            Kalkulator Ongkir Otomatis (Volumetrik & Berat Asli)
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Sistem otomatis membandingkan berat asli dan berat volumetrik paket (P × L × T cm / 6000) untuk memberikan tarif terbaik.
        </p>

        <RateCalculatorWidget />
      </section>

      {/* Master Rates Matrix Table Section */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-9 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Layers className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Matriks Tarif Resmi Antar Kota (Rate Matrix)
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Daftar tarif dasar per kilogram untuk seluruh rute kota besar di Indonesia.
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={filterOrigin}
              onChange={(e) => setFilterOrigin(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="ALL">Semua Kota Asal</option>
              {INDONESIAN_CITIES.map((c) => (
                <option key={`orig-${c}`} value={c}>
                  Asal: {c}
                </option>
              ))}
            </select>

            <select
              value={filterDest}
              onChange={(e) => setFilterDest(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="ALL">Semua Kota Tujuan</option>
              {INDONESIAN_CITIES.map((c) => (
                <option key={`dest-${c}`} value={c}>
                  Tujuan: {c}
                </option>
              ))}
            </select>

            <select
              value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="ALL">Semua Layanan</option>
              <option value="EXPRESS">EXPRESS</option>
              <option value="REGULAR">REGULAR</option>
              <option value="CARGO">CARGO</option>
            </select>
          </div>
        </div>

        {/* Rates Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-bold uppercase border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Kota Asal</th>
                <th className="px-4 py-3">Kota Tujuan</th>
                <th className="px-4 py-3">Layanan</th>
                <th className="px-4 py-3 text-right">Tarif / Kg</th>
                <th className="px-4 py-3">Estimasi Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {filteredRates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400 font-medium">
                    Tidak ada data tarif yang sesuai dengan filter yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredRates.slice(0, 50).map((rate) => {
                  const isExpress = rate.serviceType === "EXPRESS";
                  const isCargo = rate.serviceType === "CARGO";

                  return (
                    <tr
                      key={rate.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition duration-150"
                    >
                      <td className="px-4 py-3 font-bold">{rate.originCity}</td>
                      <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">
                        {rate.destinationCity}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            isExpress
                              ? "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400"
                              : isCargo
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                          }`}
                        >
                          {rate.serviceType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-orange-600 dark:text-orange-400">
                        {formatIDR(rate.ratePerKg)}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">
                        {rate.estimatedDays}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filteredRates.length > 50 && (
          <p className="text-center text-xs text-slate-400 mt-4">
            Menampilkan 50 dari {filteredRates.length} kombinasi rute. Gunakan filter kota di atas untuk mempersempit pencarian.
          </p>
        )}
      </section>
    </div>
  );
}
