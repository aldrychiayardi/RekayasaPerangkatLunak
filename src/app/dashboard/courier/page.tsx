import { getRecentTrackingEvents, getAllShipments } from "@/actions/shipment-actions";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CourierClient } from "./CourierClient";
import { Truck } from "lucide-react";

export default async function CourierDashboardPage() {
  const [recentEvents, shipments] = await Promise.all([
    getRecentTrackingEvents(15),
    getAllShipments(),
  ]);

  const sampleAwbs = shipments.map((s) => s.trackingNumber).slice(0, 6);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />

      <main className="flex-1 py-10 sm:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase mb-2">
              <Truck className="w-3.5 h-3.5" />
              Portal Operasional & Kurir
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Scanner Hub & Update Status Checkpoint
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Pindai barcode AWB paket dan catat pergerakan status di setiap sorting hub, bandara transit, dan penyerahan oleh kurir.
            </p>
          </div>

          <CourierClient
            recentEvents={recentEvents}
            sampleAwbs={sampleAwbs}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
