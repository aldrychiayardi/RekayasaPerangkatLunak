"use client";

import { useState } from "react";
import { Search, Loader2, ArrowRight, MapPin, Clock } from "lucide-react";
import { getShipmentByAwb } from "@/actions/shipment-actions";
import { STATUS_MAP, formatIndonesianDate } from "@/lib/utils";
import Link from "next/link";

interface TrackingWidgetProps {
  initialAwb?: string;
  className?: string;
}

type ShipmentWithEvents = NonNullable<Awaited<ReturnType<typeof getShipmentByAwb>>>;

export function TrackingWidget({ initialAwb = "", className = "" }: TrackingWidgetProps) {
  const [awb, setAwb] = useState(initialAwb);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ShipmentWithEvents | null>(null);

  const handleTrack = async (targetAwb?: string) => {
    const queryAwb = (targetAwb || awb).trim().toUpperCase();
    if (!queryAwb) {
      setError("Silakan masukkan nomor resi AWB (contoh: NEX-882910)");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getShipmentByAwb(queryAwb);
      if (!data) {
        setError(`Nomor resi "${queryAwb}" tidak ditemukan di sistem. Pastikan nomor resi benar.`);
        setResult(null);
      } else {
        setResult(data);
        setError(null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal melacak paket. Coba beberapa saat lagi.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSampleClick = (sampleAwb: string) => {
    setAwb(sampleAwb);
    handleTrack(sampleAwb);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleTrack();
        }}
        className="flex flex-col sm:flex-row items-center gap-2"
      >
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={awb}
            onChange={(e) => setAwb(e.target.value.toUpperCase())}
            placeholder="Masukkan No. Resi (cth: NEX-882910)"
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition uppercase tracking-wider"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md shadow-orange-500/20 transition disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Memeriksa...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Lacak Paket</span>
            </>
          )}
        </button>
      </form>

      {/* Quick sample chips */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span className="font-semibold text-slate-600 dark:text-slate-400">Contoh Resi Uji Coba:</span>
        <button
          type="button"
          onClick={() => handleSampleClick("NEX-882910")}
          className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-orange-100 hover:text-orange-700 dark:hover:bg-orange-950/60 dark:hover:text-orange-400 text-slate-700 dark:text-slate-300 font-mono font-semibold rounded-md transition cursor-pointer border border-slate-200 dark:border-slate-700"
        >
          NEX-882910 (Diantar)
        </button>
        <button
          type="button"
          onClick={() => handleSampleClick("NEX-554201")}
          className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 hover:text-emerald-700 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-400 text-slate-700 dark:text-slate-300 font-mono font-semibold rounded-md transition cursor-pointer border border-slate-200 dark:border-slate-700"
        >
          NEX-554201 (Terkirim)
        </button>
        <button
          type="button"
          onClick={() => handleSampleClick("NEX-109283")}
          className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-950/60 dark:hover:text-blue-400 text-slate-700 dark:text-slate-300 font-mono font-semibold rounded-md transition cursor-pointer border border-slate-200 dark:border-slate-700"
        >
          NEX-109283 (Transit)
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-700 dark:text-red-300 font-medium">
          {error}
        </div>
      )}

      {/* Quick Result Summary Card */}
      {result && (
        <div className="p-4 bg-gradient-to-br from-orange-50/60 via-white to-amber-50/40 dark:from-slate-800 dark:to-slate-900 border border-orange-200 dark:border-slate-700 rounded-xl space-y-3 animate-in fade-in duration-200 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                {result.trackingNumber}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 rounded">
                {result.serviceType}
              </span>
            </div>
            {STATUS_MAP[result.status] && (
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_MAP[result.status].bg} ${STATUS_MAP[result.status].color} ${STATUS_MAP[result.status].border}`}
              >
                {STATUS_MAP[result.status].label}
              </span>
            )}
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-100">Rute:</span>
            <span>{result.senderCity}</span>
            <ArrowRight className="w-3.5 h-3.5 text-orange-600" />
            <span>{result.receiverCity}</span>
          </div>

          {result.events && result.events.length > 0 && (
            <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-orange-500" />
                  {result.events[0].location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatIndonesianDate(result.events[0].timestamp)}
                </span>
              </div>
              <p className="font-medium text-slate-800 dark:text-slate-200">
                {result.events[0].description}
              </p>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <Link
              href={`/track/${result.trackingNumber}`}
              className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline"
            >
              <span>Lihat Detail Timeline Lengkap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
