"use client";

import { useState, useEffect } from "react";
import {
  INDONESIAN_CITIES,
  formatIDR,
} from "@/lib/utils";
import { calculateShippingRates, RateCalculationResult } from "@/actions/shipment-actions";
import { Clock, Info, Loader2 } from "lucide-react";

interface RateCalculatorWidgetProps {
  className?: string;
  defaultOrigin?: string;
  defaultDestination?: string;
}

export function RateCalculatorWidget({
  className = "",
  defaultOrigin = "Jakarta",
  defaultDestination = "Surabaya",
}: RateCalculatorWidgetProps) {
  const [origin, setOrigin] = useState(defaultOrigin);
  const [destination, setDestination] = useState(defaultDestination);
  const [weight, setWeight] = useState(2);
  const [length, setLength] = useState(25);
  const [width, setWidth] = useState(20);
  const [height, setHeight] = useState(15);
  const [loading, setLoading] = useState(false);
  const [rateResult, setRateResult] = useState<RateCalculationResult | null>(null);

  useEffect(() => {
    let isCancelled = false;
    async function runCalculation() {
      setLoading(true);
      try {
        const res = await calculateShippingRates(
          origin,
          destination,
          weight,
          length,
          width,
          height
        );
        if (!isCancelled) {
          setRateResult(res);
        }
      } catch (err) {
        console.error("Failed to calculate rate:", err);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    runCalculation();
    return () => {
      isCancelled = true;
    };
  }, [origin, destination, weight, length, width, height]);

  const swapCities = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  return (
    <div className={`space-y-5 ${className}`}>
      {/* City Pickers */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        <div className="sm:col-span-5">
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1.5">
            <span>Kota Asal (Origin)</span>
            {loading && <Loader2 className="w-3 h-3 animate-spin text-orange-600" />}
          </label>
          <select
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {INDONESIAN_CITIES.map((c) => (
              <option key={`orig-${c}`} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2 flex justify-center pt-2 sm:pt-6">
          <button
            type="button"
            onClick={swapCities}
            title="Tukar Kota"
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-orange-100 hover:text-orange-600 dark:hover:bg-orange-950/60 dark:hover:text-orange-400 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 transition cursor-pointer"
          >
            ⇄
          </button>
        </div>

        <div className="sm:col-span-5">
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1.5">
            Kota Tujuan (Destination)
          </label>
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {INDONESIAN_CITIES.map((c) => (
              <option key={`dest-${c}`} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Package Specs Inputs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
            Berat Asli (Kg)
          </label>
          <div className="relative">
            <input
              type="number"
              min="0.1"
              step="0.5"
              value={weight}
              onChange={(e) => setWeight(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">Kg</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
            Panjang (cm)
          </label>
          <input
            type="number"
            min="1"
            value={length}
            onChange={(e) => setLength(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
            Lebar (cm)
          </label>
          <input
            type="number"
            min="1"
            value={width}
            onChange={(e) => setWidth(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
            Tinggi (cm)
          </label>
          <input
            type="number"
            min="1"
            value={height}
            onChange={(e) => setHeight(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Volumetric Weight Formula Badge */}
      {rateResult && (
        <div className="bg-slate-100 dark:bg-slate-800/80 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Info className="w-4 h-4 text-orange-500 shrink-0" />
            <span>
              Volumetrik: <strong>{rateResult.volumetricWeight} Kg</strong> [(P×L×T)/6000] vs Asli: <strong>{rateResult.actualWeight} Kg</strong>
            </span>
          </div>
          <div className="bg-white dark:bg-slate-900 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white">
            Berat Dikenakan Tarif: <span className="text-orange-600">{rateResult.chargeableWeight} Kg</span>
          </div>
        </div>
      )}

      {/* Service Rate Cards Comparison */}
      {rateResult && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {rateResult.services.map((srv) => {
            const isExpress = srv.serviceType === "EXPRESS";
            const isCargo = srv.serviceType === "CARGO";

            return (
              <div
                key={srv.serviceType}
                className={`p-4 rounded-xl border relative transition-all duration-200 flex flex-col justify-between ${
                  isExpress
                    ? "bg-gradient-to-b from-orange-50/70 to-white dark:from-orange-950/20 dark:to-slate-900 border-orange-300 dark:border-orange-800 shadow-sm ring-1 ring-orange-400/20"
                    : isCargo
                    ? "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                }`}
              >
                {isExpress && (
                  <span className="absolute -top-2.5 right-3 text-[10px] font-black uppercase tracking-wider bg-orange-600 text-white px-2 py-0.5 rounded-full shadow-xs">
                    Paling Cepat
                  </span>
                )}
                {isCargo && (
                  <span className="absolute -top-2.5 right-3 text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white px-2 py-0.5 rounded-full shadow-xs">
                    Hemat Kargo
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {srv.serviceName}
                    </h5>
                    <span className="text-xs font-semibold text-slate-500">
                      @{formatIDR(srv.ratePerKg)}/Kg
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 leading-tight">
                    {srv.description}
                  </p>

                  <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold mb-3">
                    <Clock className="w-3.5 h-3.5 text-orange-500" />
                    <span>Estimasi: {srv.estimatedDays}</span>
                  </div>

                  {srv.notice && (
                    <div className="text-[10px] text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 p-1.5 rounded-md mb-2 font-medium">
                      {srv.notice}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Total Ongkos Kirim:
                  </span>
                  <div className="text-lg font-black text-orange-600 dark:text-orange-500">
                    {formatIDR(srv.totalCost)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
