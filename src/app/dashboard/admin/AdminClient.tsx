"use client";

import { useState } from "react";
import {
  STATUS_MAP,
  formatIDR,
  INDONESIAN_CITIES,
} from "@/lib/utils";
import { updateRate } from "@/actions/shipment-actions";
import { ThermalShippingLabel, ShipmentLabelData } from "@/components/ThermalShippingLabel";
import { RateItem } from "@/app/rates/RatesClient";
import Link from "next/link";
import {
  Package,
  Truck,
  DollarSign,
  Search,
  Layers,
  Edit2,
  Check,
  X,
  Printer,
  ArrowRight,
  Loader2,
  Percent,
} from "lucide-react";

export type AdminShipmentItem = ShipmentLabelData & {
  id: string;
  status: string;
};

interface AdminClientProps {
  metrics: {
    totalShipments: number;
    totalRevenue: number;
    activeInTransit: number;
    deliveredCount: number;
    deliveryPercentage: number;
  };
  initialShipments: AdminShipmentItem[];
  initialRates: RateItem[];
}

export function AdminClient({
  metrics,
  initialShipments,
  initialRates,
}: AdminClientProps) {
  const [activeTab, setActiveTab] = useState<"shipments" | "rates">("shipments");

  // Shipments filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [serviceFilter, setServiceFilter] = useState("ALL");

  // Rates states
  const [rates, setRates] = useState(initialRates);
  const [editingRateId, setEditingRateId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editEstDays, setEditEstDays] = useState<string>("");
  const [savingRate, setSavingRate] = useState(false);
  const [rateOriginFilter, setRateOriginFilter] = useState("ALL");
  const [rateDestFilter, setRateDestFilter] = useState("ALL");

  // Thermal Label modal state
  const [selectedShipmentForLabel, setSelectedShipmentForLabel] = useState<AdminShipmentItem | null>(null);

  // Filter Shipments
  const filteredShipments = initialShipments.filter((s) => {
    if (statusFilter !== "ALL" && s.status !== statusFilter) return false;
    if (serviceFilter !== "ALL" && s.serviceType !== serviceFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        s.trackingNumber.toLowerCase().includes(q) ||
        s.senderName.toLowerCase().includes(q) ||
        s.receiverName.toLowerCase().includes(q) ||
        s.senderCity.toLowerCase().includes(q) ||
        s.receiverCity.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Filter Rates
  const filteredRates = rates.filter((r) => {
    if (rateOriginFilter !== "ALL" && r.originCity !== rateOriginFilter) return false;
    if (rateDestFilter !== "ALL" && r.destinationCity !== rateDestFilter) return false;
    return true;
  });

  const handleStartEditRate = (rate: RateItem) => {
    setEditingRateId(rate.id);
    setEditPrice(rate.ratePerKg);
    setEditEstDays(rate.estimatedDays);
  };

  const handleSaveRate = async (rateId: string) => {
    setSavingRate(true);
    try {
      const updated = await updateRate(rateId, editPrice, editEstDays);
      setRates(rates.map((r) => (r.id === rateId ? { ...r, ...updated } : r)));
      setEditingRateId(null);
    } catch (err) {
      console.error("Failed to update rate:", err);
    } finally {
      setSavingRate(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* KPI Metrics Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Shipments */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Pengiriman
            </span>
            <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950 flex items-center justify-center text-orange-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {metrics.totalShipments}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            Paket terdata di seluruh hub
          </div>
        </div>

        {/* Metric 2: Total Revenue */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Pendapatan (Revenue)
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {formatIDR(metrics.totalRevenue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            Akumulasi transaksi ongkos kirim
          </div>
        </div>

        {/* Metric 3: Active In-Transit */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Sedang Dalam Perjalanan
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {metrics.activeInTransit}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            Paket aktif di armada darat / udara
          </div>
        </div>

        {/* Metric 4: Delivered % */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Tingkat Keberhasilan
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
            {metrics.deliveryPercentage}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            {metrics.deliveredCount} paket telah sukses diterima
          </div>
        </div>
      </div>

      {/* Main Tabs Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("shipments")}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition cursor-pointer ${
            activeTab === "shipments"
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Master Data Pengiriman ({filteredShipments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("rates")}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition cursor-pointer ${
            activeTab === "rates"
              ? "bg-orange-600 text-white shadow-md shadow-orange-600/30"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Manajemen Tarif Ongkir (Master Rate)</span>
        </button>
      </div>

      {/* TAB 1: Master Shipments Table */}
      {activeTab === "shipments" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5 animate-in fade-in duration-150">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Seluruh Paket Terdaftar di Sistem Ekspedisi
              </h3>
              <p className="text-xs text-slate-500">
                Pencarian dan penyaringan data paket, status pergerakan, dan pencetakan surat jalan.
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari AWB / Nama / Kota..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="ALL">Semua Status</option>
                <option value="ORDER_CREATED">ORDER_CREATED</option>
                <option value="PICKED_UP">PICKED_UP</option>
                <option value="AT_ORIGIN_HUB">AT_ORIGIN_HUB</option>
                <option value="IN_TRANSIT">IN_TRANSIT</option>
                <option value="AT_DESTINATION_HUB">AT_DESTINATION_HUB</option>
                <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="FAILED">FAILED</option>
              </select>

              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="ALL">Semua Layanan</option>
                <option value="EXPRESS">EXPRESS</option>
                <option value="REGULAR">REGULAR</option>
                <option value="CARGO">CARGO</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-bold uppercase border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">AWB Resi</th>
                  <th className="px-4 py-3">Rute</th>
                  <th className="px-4 py-3">Pengirim</th>
                  <th className="px-4 py-3">Penerima</th>
                  <th className="px-4 py-3">Layanan</th>
                  <th className="px-4 py-3">Berat / Biaya</th>
                  <th className="px-4 py-3">Status Terkini</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {filteredShipments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-400 font-medium">
                      Tidak ada data pengiriman yang cocok.
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
                          <Link
                            href={`/track/${s.trackingNumber}`}
                            className="hover:text-orange-600 hover:underline"
                          >
                            {s.trackingNumber}
                          </Link>
                        </td>
                        <td className="px-4 py-3 font-semibold whitespace-nowrap">
                          {s.senderCity} ➔ {s.receiverCity}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold">{s.senderName}</div>
                          <div className="text-[10px] text-slate-400">{s.senderPhone}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold">{s.receiverName}</div>
                          <div className="text-[10px] text-slate-400">{s.receiverPhone}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800">
                            {s.serviceType}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div>{s.chargeableWeight} Kg</div>
                          <div className="font-mono font-bold text-[11px] text-emerald-600 dark:text-emerald-400">
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
                              title="Cetak Surat Jalan (Thermal 100x150mm)"
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer border border-slate-200 dark:border-slate-700"
                            >
                              <Printer className="w-3 h-3 text-orange-600" />
                              <span>Label</span>
                            </button>
                            <Link
                              href={`/track/${s.trackingNumber}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition"
                            >
                              <span>Timeline</span>
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

      {/* TAB 2: Master Rates Management */}
      {activeTab === "rates" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Kelola Matriks Tarif Ongkos Kirim Antar Kota
              </h3>
              <p className="text-xs text-slate-500">
                Klik ikon &quot;Edit&quot; pada baris rute untuk memperbarui tarif per-kg dan estimasi hari pengiriman langsung ke database.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={rateOriginFilter}
                onChange={(e) => setRateOriginFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="ALL">Semua Kota Asal</option>
                {INDONESIAN_CITIES.map((c) => (
                  <option key={`admin-orig-${c}`} value={c}>
                    Asal: {c}
                  </option>
                ))}
              </select>

              <select
                value={rateDestFilter}
                onChange={(e) => setRateDestFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="ALL">Semua Kota Tujuan</option>
                {INDONESIAN_CITIES.map((c) => (
                  <option key={`admin-dest-${c}`} value={c}>
                    Tujuan: {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-bold uppercase border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Kota Asal</th>
                  <th className="px-4 py-3">Kota Tujuan</th>
                  <th className="px-4 py-3">Layanan</th>
                  <th className="px-4 py-3">Tarif / Kg (IDR)</th>
                  <th className="px-4 py-3">Estimasi Durasi</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {filteredRates.slice(0, 60).map((r) => {
                  const isEditing = editingRateId === r.id;

                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                    >
                      <td className="px-4 py-3 font-bold">{r.originCity}</td>
                      <td className="px-4 py-3 font-semibold">{r.destinationCity}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800">
                          {r.serviceType}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(parseInt(e.target.value) || 0)}
                            className="w-28 bg-white dark:bg-slate-800 border border-orange-500 rounded px-2 py-1 text-xs font-bold"
                          />
                        ) : (
                          <span className="font-bold text-orange-600 dark:text-orange-400">
                            {formatIDR(r.ratePerKg)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editEstDays}
                            onChange={(e) => setEditEstDays(e.target.value)}
                            className="w-32 bg-white dark:bg-slate-800 border border-orange-500 rounded px-2 py-1 text-xs font-semibold"
                          />
                        ) : (
                          <span className="text-slate-600 dark:text-slate-300 font-medium">
                            {r.estimatedDays}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleSaveRate(r.id)}
                              disabled={savingRate}
                              className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
                            >
                              {savingRate ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Check className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingRateId(null)}
                              className="p-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleStartEditRate(r)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition border border-slate-200 dark:border-slate-700 cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3 text-orange-600" />
                            <span>Edit</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredRates.length > 60 && (
            <p className="text-center text-xs text-slate-400 mt-2">
              Menampilkan 60 dari {filteredRates.length} tarif rute. Gunakan filter kota di atas untuk mempersempit.
            </p>
          )}
        </div>
      )}

      {/* Printable Thermal Label Modal */}
      {selectedShipmentForLabel && (
        <ThermalShippingLabel
          shipment={selectedShipmentForLabel}
          onClose={() => setSelectedShipmentForLabel(null)}
        />
      )}
    </div>
  );
}
