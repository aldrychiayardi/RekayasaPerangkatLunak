import { getAllShipments } from "@/actions/shipment-actions";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CustomerClient } from "./CustomerClient";
import { PackageCheck } from "lucide-react";

export default async function CustomerDashboardPage() {
  const shipments = await getAllShipments();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />

      <main className="flex-1 py-10 sm:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase mb-2">
              <PackageCheck className="w-3.5 h-3.5" />
              Customer Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Portal Pengiriman Pelanggan
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Buat pengiriman paket baru, cetak thermal waybill 100mm x 150mm ber-barcode, dan pantau status paket Anda secara mandiri.
            </p>
          </div>

          <CustomerClient initialShipments={shipments} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
