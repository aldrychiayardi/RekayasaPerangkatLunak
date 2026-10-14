import Link from "next/link";
import { Truck, Phone, Mail, MapPin, ShieldCheck, Clock } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white font-black shadow-md">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                Nusantara<span className="text-orange-500">Express</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Jaringan ekspedisi dan logistik terpadu di Indonesia. Menghubungkan ribuan pulau, kota, dan pelosok Nusantara dengan kecepatan, ketepatan, dan teknologi tracking presisi tinggi.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1 bg-slate-800 px-2 py-1 rounded">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> ISO 9001:2015
              </span>
              <span className="inline-flex items-center gap-1 bg-slate-800 px-2 py-1 rounded">
                <Clock className="w-3.5 h-3.5 text-orange-400" /> 24/7 Monitoring Hub
              </span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Layanan & Fitur
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/track" className="hover:text-orange-400 transition">
                  Cek Resi & Live Tracking
                </Link>
              </li>
              <li>
                <Link href="/rates" className="hover:text-orange-400 transition">
                  Hitung Ongkir (Cek Tarif)
                </Link>
              </li>
              <li>
                <Link href="/dashboard/customer" className="hover:text-orange-400 transition">
                  Order Pengiriman Baru
                </Link>
              </li>
              <li>
                <Link href="/dashboard/customer" className="hover:text-orange-400 transition">
                  Cetak Thermal Waybill 100x150mm
                </Link>
              </li>
              <li>
                <Link href="/rates" className="hover:text-orange-400 transition">
                  Matriks Tarif Antar Kota
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Portal Ekspedisi */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Portal Operasional
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/dashboard/customer" className="hover:text-orange-400 transition">
                  Portal Pelanggan (Customer)
                </Link>
              </li>
              <li>
                <Link href="/dashboard/courier" className="hover:text-orange-400 transition">
                  Portal Kurir & Hub Scanner
                </Link>
              </li>
              <li>
                <Link href="/dashboard/admin" className="hover:text-orange-400 transition">
                  Admin Analytics & Master Rates
                </Link>
              </li>
              <li>
                <span className="text-xs text-slate-500">
                  Sample Resi Aktif: NEX-882910, NEX-554201, NEX-109283
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Hub Center */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Hub Kontak 24 Jam
            </h4>
            <div className="flex items-start gap-2.5 text-sm text-slate-400">
              <Phone className="w-4 h-4 text-orange-500 mt-1 shrink-0" />
              <div>
                <div className="font-semibold text-white">Call Center: 1500-NEX (639)</div>
                <div className="text-xs">WhatsApp: +62 811-8899-NEX</div>
              </div>
            </div>
            <div className="flex items-start gap-2.5 text-sm text-slate-400">
              <Mail className="w-4 h-4 text-orange-500 mt-1 shrink-0" />
              <div>
                <div className="font-semibold text-white">support@nusantaraexpress.co.id</div>
                <div className="text-xs">corporate@nusantaraexpress.co.id</div>
              </div>
            </div>
            <div className="flex items-start gap-2.5 text-sm text-slate-400">
              <MapPin className="w-4 h-4 text-orange-500 mt-1 shrink-0" />
              <div className="text-xs">
                NEX Central Gateway: Jl. Daan Mogot KM 12 No. 88, Jakarta Barat 11840
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} NusantaraExpress (PT Ekspedisi Logistik Nusantara). Hak Cipta Dilindungi Undang-Undang.</p>
          <div className="flex items-center gap-6">
            <span>Kebijakan Privasi</span>
            <span>Syarat & Ketentuan Pengiriman</span>
            <span>Asuransi Muatan</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
