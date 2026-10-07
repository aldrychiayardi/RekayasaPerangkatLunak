import { getShipmentByAwb } from "@/actions/shipment-actions";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TrackDetailClient } from "./TrackDetailClient";
import Link from "next/link";
import { PackageX, ArrowLeft, Search } from "lucide-react";

interface PageProps {
  params: Promise<{ awb: string }>;
}

export default async function TrackingDetailPage({ params }: PageProps) {
  const { awb } = await params;
  const decodedAwb = decodeURIComponent(awb);
  const shipment = await getShipmentByAwb(decodedAwb);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {!shipment ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-xl space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950 flex items-center justify-center text-red-600 mx-auto">
                <PackageX className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Nomor Resi Tidak Ditemukan
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Nomor resi <span className="font-mono font-bold text-orange-600">&ldquo;{decodedAwb}&rdquo;</span> belum terdaftar di sistem atau terjadi kesalahan pengetikan.
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/track"
                  className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition"
                >
                  <Search className="w-4 h-4" /> Cari Nomor Resi Lain
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-slate-200 transition"
                >
                  <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
                </Link>
              </div>
            </div>
          ) : (
            <TrackDetailClient shipment={shipment} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
