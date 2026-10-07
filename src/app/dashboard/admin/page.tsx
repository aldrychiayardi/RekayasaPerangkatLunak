import { getAdminMetrics, getAllShipments, getAllRates } from "@/actions/shipment-actions";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdminClient } from "./AdminClient";
import { ShieldCheck } from "lucide-react";

export default async function AdminDashboardPage() {
  const [metrics, shipments, rates] = await Promise.all([
    getAdminMetrics(),
    getAllShipments(),
    getAllRates(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />

      <main className="flex-1 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Executive Admin Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Pusat Manajemen Logistik & Analitik
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Pantau performa KPI ekspedisi, kelola master pengiriman seluruh cabang, dan atur matriks tarif per-kg antar kota di Indonesia.
            </p>
          </div>

          <AdminClient
            metrics={metrics}
            initialShipments={shipments}
            initialRates={rates}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
