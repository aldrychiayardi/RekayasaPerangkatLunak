"use client";

import { useState, useEffect } from "react";
import {
  INDONESIAN_CITIES,
  STATUS_MAP,
  formatIDR,
} from "@/lib/utils";
import {
  createShipmentOrder,
  calculateShippingRates,
  CreateShipmentInput,
} from "@/actions/shipment-actions";
import { ThermalShippingLabel, ShipmentLabelData } from "@/components/ThermalShippingLabel";
import Link from "next/link";
import {
  PackagePlus,
  Printer,
  Search,
  Truck,
  Box,
  CheckCircle2,
  ArrowRight,
  Loader2,
  AlertCircle,
  PlusCircle,
  FileText,
} from "lucide-react";

export type CustomerShipment = ShipmentLabelData & {
  id: string;
  status: string;
};

interface CustomerClientProps {
  initialShipments: CustomerShipment[];
}

export function CustomerClient({ initialShipments }: CustomerClientProps) {
  const [shipments, setShipments] = useState(initialShipments);
  const [activeTab, setActiveTab] = useState<"history" | "new">("history");

  // Form states
  const [senderName, setSenderName] = useState("Budi Santoso");
  const [senderPhone, setSenderPhone] = useState("081288990011");
  const [senderCity, setSenderCity] = useState("Jakarta");
  const [senderAddress, setSenderAddress] = useState("Jl. Kebon Jeruk Raya No. 15, Jakarta Barat");

  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [receiverCity, setReceiverCity] = useState("Surabaya");
  const [receiverAddress, setReceiverAddress] = useState("");

  const [weight, setWeight] = useState(1.5);
  const [length, setLength] = useState(25);
  const [width, setWidth] = useState(20);
  const [height, setHeight] = useState(15);
  const [serviceType, setServiceType] = useState<"REGULAR" | "EXPRESS" | "CARGO">("REGULAR");

  const [estimatedCost, setEstimatedCost] = useState<number>(0);
  const [volumetricWeight, setVolumetricWeight] = useState<number>(0);
  const [chargeableWeight, setChargeableWeight] = useState<number>(0);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Modal print label
  const [selectedShipmentForLabel, setSelectedShipmentForLabel] = useState<CustomerShipment | null>(null);

  // Search in history
  const [searchHistory, setSearchHistory] = useState("");

  // Live pricing update
  useEffect(() => {
    let isCancelled = false;
    async function updateEstimate() {
      try {
        const rates = await calculateShippingRates(
          senderCity,
          receiverCity,
          weight,
          length,
          width,
          height
        );
        if (!isCancelled) {
          setVolumetricWeight(rates.volumetricWeight);
          setChargeableWeight(rates.chargeableWeight);
          const matchedService = rates.services.find((s) => s.serviceType === serviceType);
          if (matchedService) {
            setEstimatedCost(matchedService.totalCost);
          }
        }
      } catch (err) {
        console.error("Calculation error:", err);
      }
    }
    updateEstimate();
    return () => {
      isCancelled = true;
    };
  }, [senderCity, receiverCity, weight, length, width, height, serviceType]);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiverName || !receiverPhone || !receiverAddress) {
      setFormError("Mohon lengkapi semua rincian data penerima (Nama, No. HP, Alamat).");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const input: CreateShipmentInput = {
        senderName,
        senderPhone,
        senderCity,
        senderAddress,
        receiverName,
        receiverPhone,
        receiverCity,
        receiverAddress,
        weight,
        length,
        width,
        height,
        serviceType,
      };

      const newShipment = await createShipmentOrder(input);
      setShipments([newShipment, ...shipments]);
      setSelectedShipmentForLabel(newShipment);
      setActiveTab("history");

      // Reset receiver
      setReceiverName("");
      setReceiverPhone("");
      setReceiverAddress("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal membuat pesanan pengiriman.";
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredShipments = shipments.filter((s) => {
    if (!searchHistory.trim()) return true;
    const q = searchHistory.toLowerCase();
    return (
      s.trackingNumber.toLowerCase().includes(q) ||
      s.receiverName.toLowerCase().includes(q) ||
      s.receiverCity.toLowerCase().includes(q) ||
      s.senderCity.toLowerCase().includes(q)
    );
  });

  const activeInTransit = shipments.filter(
    (s) => s.status !== "DELIVERED" && s.status !== "FAILED"
  ).length;
  const deliveredCount = shipments.filter((s) => s.status === "DELIVERED").length;

  return (
    <div className="space-y-8">
      {/* Customer Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950 flex items-center justify-center text-orange-600">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {shipments.length}
            </div>
            <div className="text-xs text-slate-500 font-semibold">Total Pengiriman Saya</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {activeInTransit}
            </div>
            <div className="text-xs text-slate-500 font-semibold">Sedang Dalam Proses</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {deliveredCount}
            </div>
            <div className="text-xs text-slate-500 font-semibold">Berhasil Terkirim</div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher: Buat Order vs Riwayat */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("history")}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition cursor-pointer ${
            activeTab === "history"
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Riwayat Pengiriman ({shipments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("new")}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition cursor-pointer ${
            activeTab === "new"
              ? "bg-orange-600 text-white shadow-md shadow-orange-600/30"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Buat Pengiriman Baru</span>
        </button>
      </div>

      {/* Tab 1: New Shipment Form */}
      {activeTab === "new" && (
        <form
          onSubmit={handleSubmitOrder}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-9 shadow-xl space-y-8 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Formulir Pendaftaran Pengiriman Paket Baru
              </h2>
              <p className="text-xs text-slate-500">
                Lengkapi rincian pengirim, penerima, dan spesifikasi paket. Nomor AWB dan label thermal akan otomatis dibuat.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Estimasi Total Biaya
              </span>
              <span className="text-xl font-black text-orange-600 dark:text-orange-400 font-mono">
                {formatIDR(estimatedCost)}
              </span>
            </div>
          </div>

          {formError && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-700 dark:text-red-300 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Col: Sender Details */}
            <div className="space-y-4 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm uppercase tracking-wider pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-xs flex items-center justify-center font-black">
                  1
                </span>
                Data Pengirim (Origin)
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Nama Pengirim / Toko *
                </label>
                <input
                  type="text"
                  required
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Nomor HP Pengirim *
                </label>
                <input
                  type="text"
                  required
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Kota Asal *
                </label>
                <select
                  value={senderCity}
                  onChange={(e) => setSenderCity(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {INDONESIAN_CITIES.map((c) => (
                    <option key={`orig-form-${c}`} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Alamat Lengkap Penjemputan / Gerai *
                </label>
                <textarea
                  rows={2}
                  required
                  value={senderAddress}
                  onChange={(e) => setSenderAddress(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Right Col: Receiver Details */}
            <div className="space-y-4 bg-orange-50/50 dark:bg-slate-800/40 p-5 rounded-2xl border border-orange-200 dark:border-slate-700">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm uppercase tracking-wider pb-2 border-b border-orange-200 dark:border-slate-700">
                <span className="w-6 h-6 rounded-full bg-orange-600 text-white text-xs flex items-center justify-center font-black">
                  2
                </span>
                Data Penerima (Destination)
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Nama Penerima *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ibu Dewi Lestari"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Nomor HP Penerima *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 081377665544"
                  value={receiverPhone}
                  onChange={(e) => setReceiverPhone(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Kota Tujuan *
                </label>
                <select
                  value={receiverCity}
                  onChange={(e) => setReceiverCity(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {INDONESIAN_CITIES.map((c) => (
                    <option key={`dest-form-${c}`} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Alamat Lengkap Pengiriman *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan"
                  value={receiverAddress}
                  onChange={(e) => setReceiverAddress(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Package Dimensions & Service Selection */}
          <div className="space-y-4 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm uppercase tracking-wider pb-2 border-b border-slate-200 dark:border-slate-700">
              <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-xs flex items-center justify-center font-black">
                3
              </span>
              Spesifikasi Paket & Pilihan Layanan
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Berat Asli (Kg)
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Panjang (cm)
                </label>
                <input
                  type="number"
                  min="1"
                  value={length}
                  onChange={(e) => setLength(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Lebar (cm)
                </label>
                <input
                  type="number"
                  min="1"
                  value={width}
                  onChange={(e) => setWidth(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Tinggi (cm)
                </label>
                <input
                  type="number"
                  min="1"
                  value={height}
                  onChange={(e) => setHeight(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-1">
              <span>Volumetrik: <strong>{volumetricWeight} Kg</strong> | Berat Dikenakan: <strong className="text-orange-600">{chargeableWeight} Kg</strong></span>
              <span className="text-[11px] italic">*Layanan CARGO dikenakan berat minimum 10 Kg</span>
            </div>

            {/* Service Type Radios */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <label
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                  serviceType === "REGULAR"
                    ? "border-orange-500 bg-orange-50 dark:bg-orange-950/40 ring-2 ring-orange-500"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                }`}
              >
                <input
                  type="radio"
                  name="service"
                  value="REGULAR"
                  checked={serviceType === "REGULAR"}
                  onChange={() => setServiceType("REGULAR")}
                  className="mt-1"
                />
                <div>
                  <div className="font-black text-xs text-slate-900 dark:text-white">NEX REGULAR</div>
                  <div className="text-[11px] text-slate-500">2-3 Hari Kerja</div>
                </div>
              </label>

              <label
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                  serviceType === "EXPRESS"
                    ? "border-orange-500 bg-orange-50 dark:bg-orange-950/40 ring-2 ring-orange-500"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                }`}
              >
                <input
                  type="radio"
                  name="service"
                  value="EXPRESS"
                  checked={serviceType === "EXPRESS"}
                  onChange={() => setServiceType("EXPRESS")}
                  className="mt-1"
                />
                <div>
                  <div className="font-black text-xs text-slate-900 dark:text-white">NEX EXPRESS</div>
                  <div className="text-[11px] text-slate-500">1-2 Hari (Next Day)</div>
                </div>
              </label>

              <label
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                  serviceType === "CARGO"
                    ? "border-orange-500 bg-orange-50 dark:bg-orange-950/40 ring-2 ring-orange-500"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                }`}
              >
                <input
                  type="radio"
                  name="service"
                  value="CARGO"
                  checked={serviceType === "CARGO"}
                  onChange={() => setServiceType("CARGO")}
                  className="mt-1"
                />
                <div>
                  <div className="font-black text-xs text-slate-900 dark:text-white">NEX CARGO</div>
                  <div className="text-[11px] text-slate-500">3-5 Hari (Min. 10 Kg)</div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-7 py-2.5 rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses & Menghasilkan AWB...</span>
                </>
              ) : (
                <>
                  <PackagePlus className="w-4 h-4" />
                  <span>Buat Order & Cetak Surat Jalan</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Shipments History Table */}
      {activeTab === "history" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Daftar Seluruh Pengiriman Paket Saya
              </h3>
              <p className="text-xs text-slate-500">
                Klik tombol &quot;Cetak Label&quot; untuk mencetak thermal waybill standar ekspedisi 100mm x 150mm.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari Resi / Penerima / Kota..."
                value={searchHistory}
                onChange={(e) => setSearchHistory(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-bold uppercase border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">No. Resi (AWB)</th>
                  <th className="px-4 py-3">Rute Pengiriman</th>
                  <th className="px-4 py-3">Penerima</th>
                  <th className="px-4 py-3">Layanan</th>
                  <th className="px-4 py-3">Berat / Biaya</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {filteredShipments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400 font-medium">
                      Belum ada paket pengiriman. Silakan klik &quot;Buat Pengiriman Baru&quot; di atas.
                    </td>
                  </tr>
                ) : (
                  filteredShipments.map((s) => {
                    const statusConfig = STATUS_MAP[s.status] || {
                      label: s.status,
                      color: "text-slate-700",
                      bg: "bg-slate-100",
                      border: "border-slate-200",
                    };

                    return (
                      <tr
                        key={s.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition duration-150"
                      >
                        <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                          {s.trackingNumber}
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          <div className="flex items-center gap-1">
                            <span>{s.senderCity}</span>
                            <ArrowRight className="w-3 h-3 text-orange-500" />
                            <span>{s.receiverCity}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold">{s.receiverName}</div>
                          <div className="text-[10px] text-slate-500 truncate max-w-[140px]">
                            {s.receiverPhone}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800">
                            {s.serviceType}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold">{s.chargeableWeight} Kg</div>
                          <div className="text-[11px] font-bold text-orange-600 dark:text-orange-400">
                            {formatIDR(s.totalCost)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}
                          >
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedShipmentForLabel(s)}
                              title="Cetak Label Thermal"
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer border border-slate-200 dark:border-slate-700"
                            >
                              <Printer className="w-3 h-3 text-orange-600" />
                              <span>Label</span>
                            </button>
                            <Link
                              href={`/track/${s.trackingNumber}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition"
                            >
                              <span>Lacak</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Thermal Label Modal */}
      {selectedShipmentForLabel && (
        <ThermalShippingLabel
          shipment={selectedShipmentForLabel}
          onClose={() => setSelectedShipmentForLabel(null)}
        />
      )}
    </div>
  );
}
