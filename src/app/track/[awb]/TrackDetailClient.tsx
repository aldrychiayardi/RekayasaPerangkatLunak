"use client";

import { useState } from "react";
import Link from "next/link";
import {
  STATUS_MAP,
  formatIDR,
  formatIndonesianDate,
  getCityHubCode,
} from "@/lib/utils";
import { TrackingTimeline, TrackingEventItem } from "@/components/TrackingTimeline";
import { ThermalShippingLabel, ShipmentLabelData } from "@/components/ThermalShippingLabel";
import {
  ArrowLeft,
  Printer,
  Copy,
  Check,
  Phone,
} from "lucide-react";

type ShipmentDetail = ShipmentLabelData & {
  id: string;
  status: string;
  events: TrackingEventItem[];
};

interface TrackDetailClientProps {
  shipment: ShipmentDetail;
}

export function TrackDetailClient({ shipment }: TrackDetailClientProps) {
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const statusConfig = STATUS_MAP[shipment.status] || {
    label: shipment.status,
    color: "text-slate-700",
    bg: "bg-slate-100",
    border: "border-slate-200",
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const originHub = getCityHubCode(shipment.senderCity);
  const destHub = getCityHubCode(shipment.receiverCity);

  return (
    <div className="space-y-6">
      {/* Top Navigation & Action Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              href="/track"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-orange-600 transition mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali ke Pencarian
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
                {shipment.trackingNumber}
              </h1>
              <span className="text-xs font-extrabold uppercase px-2.5 py-1 rounded bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400">
                {shipment.serviceType}
              </span>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}
              >
                {statusConfig.label}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Didaftarkan pada: {formatIndonesianDate(shipment.createdAt)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Tautan</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowLabelModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-sm transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Surat Jalan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Timeline + Details Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Timeline */}
        <div className="lg:col-span-8">
          <TrackingTimeline
            currentStatus={shipment.status}
            events={shipment.events || []}
          />
        </div>

        {/* Right Column: Package Specs Card */}
        <div className="lg:col-span-4 space-y-6">
          {/* Route Hub Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Jalur Ekspedisi Hub
            </h4>
            <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between">
              <div className="text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Asal</span>
                <span className="text-lg font-black">{originHub}</span>
                <span className="text-xs text-slate-300 block">{shipment.senderCity}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-orange-400 font-bold">➔ ➔ ➔</span>
                <span className="text-[10px] text-slate-400 uppercase font-medium mt-1">Multi-Modal</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Tujuan</span>
                <span className="text-lg font-black text-orange-400">{destHub}</span>
                <span className="text-xs text-slate-300 block">{shipment.receiverCity}</span>
              </div>
            </div>
          </div>

          {/* Parties Info */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
              Detail Pengirim & Penerima
            </h4>

            {/* Penerima */}
            <div>
              <span className="text-[10px] font-bold uppercase text-orange-600 tracking-wider block">
                Penerima (Destination)
              </span>
              <div className="font-bold text-sm text-slate-900 dark:text-white">
                {shipment.receiverName}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{shipment.receiverPhone}</span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                {shipment.receiverAddress}, <strong>{shipment.receiverCity}</strong>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">
                Pengirim (Origin)
              </span>
              <div className="font-bold text-sm text-slate-900 dark:text-white">
                {shipment.senderName}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{shipment.senderPhone}</span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                {shipment.senderAddress}, <strong>{shipment.senderCity}</strong>
              </div>
            </div>
          </div>

          {/* Package Dimensions & Costs */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
              Spesifikasi Paket
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Berat Asli</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{shipment.weight} Kg</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Dimensi (P×L×T)</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {shipment.length}×{shipment.width}×{shipment.height} cm
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Berat Volumetrik</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {Math.round(((shipment.length * shipment.width * shipment.height) / 6000) * 10) / 10} Kg
                </span>
              </div>
              <div className="bg-orange-50 dark:bg-orange-950/40 p-2 rounded-lg border border-orange-200 dark:border-orange-900">
                <span className="text-orange-700 dark:text-orange-400 block text-[10px] font-bold">
                  Berat Tagihan
                </span>
                <span className="font-black text-orange-600 dark:text-orange-300">
                  {shipment.chargeableWeight} Kg
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500">Total Ongkos Kirim:</span>
              <span className="font-black text-sm text-slate-900 dark:text-white">
                {formatIDR(shipment.totalCost)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Thermal Label Modal */}
      {showLabelModal && (
        <ThermalShippingLabel
          shipment={shipment}
          onClose={() => setShowLabelModal(false)}
        />
      )}
    </div>
  );
}
