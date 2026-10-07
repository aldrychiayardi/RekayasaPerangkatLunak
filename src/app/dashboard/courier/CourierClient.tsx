"use client";

import { useState } from "react";
import {
  STATUS_MAP,
  formatIndonesianDate,
} from "@/lib/utils";
import {
  addTrackingEvent,
  getShipmentByAwb,
} from "@/actions/shipment-actions";
import {
  ScanLine,
  Truck,
  CheckCircle2,
  ArrowRight,
  Loader2,
  AlertCircle,
  Radio,
} from "lucide-react";
import Link from "next/link";

export interface CourierTrackingEvent {
  id: string;
  shipmentId: string;
  status: string;
  location: string;
  description: string;
  timestamp: Date | string;
  shipment?: {
    trackingNumber: string;
    senderCity: string;
    receiverCity: string;
    serviceType: string;
  } | null;
}

interface CourierClientProps {
  recentEvents: CourierTrackingEvent[];
  sampleAwbs: string[];
}

const LOCATION_PRESETS = [
  "Sorting Hub Jakarta Barat (CGK-01)",
  "Gateway Kargo Udara Soekarno-Hatta (CGK)",
  "Hub Distribusi Surabaya Timur (SUB-01)",
  "Drop Point Gubeng Surabaya",
  "Sorting Center Gedebage Bandung (BDO-01)",
  "Gateway Kualanamu Medan (KNO-01)",
  "Drop Point Medan Maimun",
  "Hub Logistik Denpasar (DPS-01)",
  "Drop Point Canggu Badung",
];

const REMARK_PRESETS: Record<string, string[]> = {
  PICKED_UP: [
    "Paket telah di-pickup oleh Kurir Operasional.",
    "Paket diserahkan oleh pengirim di loket drop point.",
  ],
  AT_ORIGIN_HUB: [
    "Paket tiba di Hub Sortir Asal dan ditimbang ulang.",
    "Paket selesai disortir dan dimasukkan ke kantong logistik utama.",
  ],
  IN_TRANSIT: [
    "Paket dalam perjalanan darat lintas tol Trans-Jawa.",
    "Paket diterbangkan via penerbangan kargo udara komersial.",
    "Paket berlayar via kapal ekspedisi rute antar-pulau.",
  ],
  AT_DESTINATION_HUB: [
    "Paket tiba di Hub Sortir Tujuan dan siap dibagikan ke drop point.",
    "Paket telah di-sorting berdasarkan zona alamat penerima.",
  ],
  OUT_FOR_DELIVERY: [
    "Kurir sedang membawa paket menuju alamat penerima.",
    "Kurir telah berada di area alamat tujuan dan menghubungi penerima.",
  ],
  DELIVERED: [
    "Paket telah diterima dengan baik oleh Penerima Langsung.",
    "Paket diterima oleh anggota keluarga serumah.",
    "Paket diterima oleh petugas keamanan / satpam gedung.",
  ],
  FAILED: [
    "Rumah penerima kosong / tidak ada orang saat kurir datang.",
    "Alamat tidak lengkap / nomor telepon tidak dapat dihubungi.",
    "Kendala cuaca ekstrem atau akses jalan ditutup.",
  ],
};

export function CourierClient({ recentEvents, sampleAwbs }: CourierClientProps) {
  const [eventsList, setEventsList] = useState(recentEvents);

  // Scanner Simulator State
  const [scannedAwb, setScannedAwb] = useState("NEX-882910");
  const [currentShipment, setCurrentShipment] = useState<Awaited<ReturnType<typeof getShipmentByAwb>> | null>(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Update Form State
  const [status, setStatus] = useState("OUT_FOR_DELIVERY");
  const [location, setLocation] = useState("Drop Point Gubeng Surabaya");
  const [description, setDescription] = useState(
    "Kurir NEX (Rian Saputra) sedang membawa paket ke alamat penerima."
  );
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleScanAwb = async (awbToSearch?: string) => {
    const target = (awbToSearch || scannedAwb).trim().toUpperCase();
    if (!target) return;

    setLoadingSearch(true);
    setSearchError(null);
    setSuccessMessage(null);

    try {
      const data = await getShipmentByAwb(target);
      if (!data) {
        setSearchError(`Nomor resi "${target}" tidak ditemukan.`);
        setCurrentShipment(null);
      } else {
        setCurrentShipment(data);
        setScannedAwb(target);
        // Default update recommendations based on current status
        const nextStatusMap: Record<string, string> = {
          ORDER_CREATED: "PICKED_UP",
          PICKED_UP: "AT_ORIGIN_HUB",
          AT_ORIGIN_HUB: "IN_TRANSIT",
          IN_TRANSIT: "AT_DESTINATION_HUB",
          AT_DESTINATION_HUB: "OUT_FOR_DELIVERY",
          OUT_FOR_DELIVERY: "DELIVERED",
          DELIVERED: "DELIVERED",
        };
        const next = nextStatusMap[data.status] || "OUT_FOR_DELIVERY";
        setStatus(next);
        if (REMARK_PRESETS[next]?.[0]) {
          setDescription(REMARK_PRESETS[next][0]);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengambil data paket.";
      setSearchError(msg);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    if (REMARK_PRESETS[newStatus]?.[0]) {
      setDescription(REMARK_PRESETS[newStatus][0]);
    }
  };

  const handleSubmitEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedAwb || !location || !description) {
      setSearchError("Lengkapi semua field (Resi, Lokasi, Keterangan).");
      return;
    }

    setSubmitting(true);
    setSearchError(null);
    setSuccessMessage(null);

    try {
      const newEvent = await addTrackingEvent(scannedAwb, status, location, description);

      // Add to local feed
      const feedItem = {
        ...newEvent,
        shipment: {
          trackingNumber: scannedAwb,
          senderCity: currentShipment?.senderCity || "",
          receiverCity: currentShipment?.receiverCity || "",
          serviceType: currentShipment?.serviceType || "",
        },
      };
      setEventsList([feedItem, ...eventsList]);

      // Update current shipment locally
      if (currentShipment) {
        setCurrentShipment({
          ...currentShipment,
          status,
        });
      }

      setSuccessMessage(
        `Sukses! Status paket ${scannedAwb} diperbarui menjadi "${STATUS_MAP[status]?.label || status}".`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memperbarui status.";
      setSearchError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Scanner & Dispatch Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scanner Simulation Column (Left) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <ScanLine className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Simulator Barcode Scanner AWB
                </h3>
                <p className="text-[11px] text-slate-500">
                  Simulasi pemindaian barcode fisik paket di Hub Operasional / Handheld Kurir
                </p>
              </div>
            </div>

            {/* Simulated Scan Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleScanAwb();
              }}
              className="space-y-3"
            >
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">
                Pindai / Masukkan Nomor AWB Resi:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={scannedAwb}
                  onChange={(e) => setScannedAwb(e.target.value.toUpperCase())}
                  placeholder="Scan AWB (cth: NEX-882910)"
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-wider uppercase"
                />
                <button
                  type="submit"
                  disabled={loadingSearch}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {loadingSearch ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanLine className="w-4 h-4" />}
                  <span>Scan</span>
                </button>
              </div>
            </form>

            {/* Quick Sample Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">
                Pilih Resi Simulasi Cepat:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {sampleAwbs.map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => {
                      setScannedAwb(sample);
                      handleScanAwb(sample);
                    }}
                    className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg border transition cursor-pointer ${
                      scannedAwb === sample
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>

            {/* Scanned Package Metadata Preview */}
            {currentShipment && (
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                    {currentShipment.trackingNumber}
                  </span>
                  {STATUS_MAP[currentShipment.status] && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_MAP[currentShipment.status].bg} ${STATUS_MAP[currentShipment.status].color} ${STATUS_MAP[currentShipment.status].border}`}
                    >
                      {STATUS_MAP[currentShipment.status].label}
                    </span>
                  )}
                </div>

                <div className="text-slate-600 dark:text-slate-400">
                  Rute: <strong>{currentShipment.senderCity}</strong> ➔ <strong>{currentShipment.receiverCity}</strong>
                </div>

                <div className="text-slate-600 dark:text-slate-400">
                  Penerima: <strong>{currentShipment.receiverName}</strong> ({currentShipment.receiverPhone})
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-1.5 flex justify-between">
                  <span>Layanan: {currentShipment.serviceType}</span>
                  <span>Berat: {currentShipment.chargeableWeight} Kg</span>
                </div>

                <div className="pt-1 text-right">
                  <Link
                    href={`/track/${currentShipment.trackingNumber}`}
                    target="_blank"
                    className="text-[11px] font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    Buka Halaman Lacak Publik <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Updater Form (Right) */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmitEvent}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5"
          >
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Truck className="w-5 h-5 text-orange-600" />
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Perbarui Status & Titik Checkpoint Paket
                </h3>
                <p className="text-[11px] text-slate-500">
                  Setiap pembaruan akan disinkronkan langsung ke live timeline pelacakan pelanggan.
                </p>
              </div>
            </div>

            {searchError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-700 dark:text-red-300 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{searchError}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Target Status Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                Pilih Status Operasional Baru:
              </label>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="PICKED_UP">1. PICKED_UP (Paket Di-pickup Kurir)</option>
                <option value="AT_ORIGIN_HUB">2. AT_ORIGIN_HUB (Tiba di Hub Sortir Asal)</option>
                <option value="IN_TRANSIT">3. IN_TRANSIT (Dalam Perjalanan Transit)</option>
                <option value="AT_DESTINATION_HUB">4. AT_DESTINATION_HUB (Tiba di Hub Sortir Tujuan)</option>
                <option value="OUT_FOR_DELIVERY">5. OUT_FOR_DELIVERY (Kurir Mengantar ke Alamat)</option>
                <option value="DELIVERED">6. DELIVERED (Paket Berhasil Diterima)</option>
                <option value="FAILED">7. FAILED (Gagal Kirim / Kendala)</option>
              </select>
            </div>

            {/* Location Input & Presets */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Lokasi Hub / Checkpoint Operasional:
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Contoh: Sorting Hub Jakarta Barat (CGK-01)"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 mb-2"
              />

              {/* Quick location presets */}
              <div className="flex flex-wrap gap-1 text-[10px]">
                <span className="text-slate-400 font-bold mr-1">Rekomendasi:</span>
                {LOCATION_PRESETS.slice(0, 4).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setLocation(p)}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 transition cursor-pointer"
                  >
                    {p.split("(")[0].trim()}
                  </button>
                ))}
              </div>
            </div>

            {/* Description / Remarks Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Catatan / Keterangan Kurir:
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Contoh: Paket telah diterima oleh Bpk. Budi (Keluarga Serumah)"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 mb-2"
              />

              {/* Preset remarks for this status */}
              {REMARK_PRESETS[status] && (
                <div className="flex flex-wrap gap-1 text-[10px]">
                  <span className="text-slate-400 font-bold mr-1">Template:</span>
                  {REMARK_PRESETS[status].map((remark, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setDescription(remark)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 transition cursor-pointer text-left truncate max-w-xs"
                    >
                      {remark}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md shadow-orange-500/20 transition disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mencatat Status Baru...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Perbarui Status Paket Ini</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Recent Activity Log Feed */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
            <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Aktivitas Pemindaian Hub & Kurir Terkini (Live Feed)
            </h4>
          </div>
          <span className="text-xs text-slate-400">Pembaruan realtime</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-bold uppercase border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Waktu</th>
                <th className="px-4 py-3">No. Resi AWB</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Lokasi Checkpoint</th>
                <th className="px-4 py-3">Keterangan Aktivitas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {eventsList.slice(0, 10).map((ev) => {
                const statusConfig = STATUS_MAP[ev.status] || {
                  label: ev.status,
                  color: "text-slate-700",
                  bg: "bg-slate-100",
                  border: "border-slate-200",
                };

                return (
                  <tr key={ev.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {formatIndonesianDate(ev.timestamp)}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                      <Link
                        href={`/track/${ev.shipment?.trackingNumber || ev.shipmentId}`}
                        className="hover:text-orange-600 hover:underline"
                      >
                        {ev.shipment?.trackingNumber || ev.shipmentId}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}
                      >
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">
                      {ev.location}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 max-w-sm truncate">
                      {ev.description}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
