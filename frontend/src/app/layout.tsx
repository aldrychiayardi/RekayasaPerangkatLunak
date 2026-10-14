import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NusantaraExpress | Ekspedisi & Logistik Terpadu Indonesia",
  description:
    "Ekspedisi terpercaya menjangkau seluruh pelosok Nusantara. Cek resi live tracking, kalkulator ongkir otomatis, cetak thermal waybill, dan portal kurir terintegrasi.",
  keywords: [
    "ekspedisi indonesia",
    "nusantaraexpress",
    "cek resi",
    "cek ongkir",
    "kargo murah",
    "surat jalan thermal",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
