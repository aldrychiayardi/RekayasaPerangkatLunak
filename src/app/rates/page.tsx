import { getAllRates } from "@/actions/shipment-actions";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RatesClient } from "./RatesClient";
import { Calculator } from "lucide-react";

export default async function RatesPage() {
  const rates = await getAllRates();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />

      <main className="flex-1 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase">
              <Calculator className="w-3.5 h-3.5" />
              Cek Tarif Pengiriman
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Cek Ongkos Kirim se-Indonesia
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Dapatkan estimasi biaya pengiriman yang transparan, akurat, dan terstandarisasi untuk rute kota-kota besar di seluruh kepulauan Nusantara.
            </p>
          </div>

          <RatesClient initialRates={rates} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
