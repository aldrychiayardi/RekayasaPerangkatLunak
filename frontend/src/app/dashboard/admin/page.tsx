import { redirect } from "next/navigation";
import { getAdminMetrics, getAllShipments, getAllRates } from "@/actions/shipment-actions";
import { getCurrentUser } from "@/actions/auth-actions";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdminClient } from "./AdminClient";
import { ShieldCheck, Shield } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/admin");
  }

  // Hanya OWNER dan ADMIN yang boleh mengakses dashboard ini
  if (user.role !== "OWNER" && user.role !== "ADMIN") {
    redirect("/dashboard/customer");
  }

  const [metrics, shipments, rates] = await Promise.all([
    getAdminMetrics(),
    getAllShipments(),
    getAllRates(),
  ]);

  const isOwner = user.role === "OWNER";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />

      <main className="flex-1 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase mb-2 ${
                isOwner
                  ? "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                  : "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
              }`}
            >
              {isOwner ? <Shield className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              {isOwner ? "Executive Owner Dashboard (Akses Penuh)" : "Operational Admin Dashboard"}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {isOwner
                ? "Pusat Kendali Bisnis, Omset & Tarif Ekspedisi"
                : "Pusat Manajemen Logistik & Operasional Cabang"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {isOwner
                ? "Sebagai Owner, Anda memiliki wewenang penuh untuk mengubah tarif ongkir per-kg antar kota dan melihat laporan keuangan / omset pendapatan."
                : "Sebagai Admin Operasional, Anda dapat memantau pergerakan seluruh paket dan status checkpoint resi (perubahan tarif dikunci khusus untuk Owner)."}
            </p>
          </div>

          <AdminClient
            currentUser={user}
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
