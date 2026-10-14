"use client";

import { useRef } from "react";
import { BarcodeGenerator } from "./BarcodeGenerator";
import { QRCodeSVG } from "qrcode.react";
import { Printer, X, Box, Phone, MapPin } from "lucide-react";
import { formatIndonesianDate, getCityHubCode, formatIDR } from "@/lib/utils";

export interface ShipmentLabelData {
  trackingNumber: string;
  senderName: string;
  senderPhone: string;
  senderCity: string;
  senderAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverCity: string;
  receiverAddress: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  chargeableWeight: number;
  serviceType: string;
  totalCost: number;
  createdAt: Date | string;
}

interface ThermalShippingLabelProps {
  shipment: ShipmentLabelData;
  onClose?: () => void;
  inline?: boolean;
}

export function ThermalShippingLabel({
  shipment,
  onClose,
  inline = false,
}: ThermalShippingLabelProps) {
  const labelRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const originHub = getCityHubCode(shipment.senderCity);
  const destHub = getCityHubCode(shipment.receiverCity);
  const volumetric = Math.round(((shipment.length * shipment.width * shipment.height) / 6000) * 10) / 10;
  const trackingUrl = typeof window !== "undefined"
    ? `${window.location.origin}/track/${shipment.trackingNumber}`
    : `https://nusantaraexpress.co.id/track/${shipment.trackingNumber}`;

  const labelContent = (
    <div
      ref={labelRef}
      className="printable-thermal-label bg-white text-black font-sans text-xs w-[100mm] min-h-[148mm] border-2 border-black p-3.5 mx-auto rounded shadow-sm leading-tight select-none flex flex-col justify-between"
      style={{ boxSizing: "border-box" }}
    >
      {/* Top Header: Brand & Service Type */}
      <div>
        <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 bg-black text-white flex items-center justify-center font-black rounded-sm text-sm tracking-wider">
              NEX
            </div>
            <div>
              <div className="font-black text-sm tracking-tight leading-none uppercase">
                NusantaraExpress
              </div>
              <div className="text-[9px] text-neutral-600 font-semibold tracking-wider uppercase">
                Logistics & Cargo Solution
              </div>
            </div>
          </div>
          <div className="border-2 border-black px-2.5 py-1 text-center bg-neutral-100 font-black text-xs tracking-wider uppercase rounded-sm">
            {shipment.serviceType}
          </div>
        </div>

        {/* Route Hub Code Banner */}
        <div className="bg-black text-white text-center py-1.5 px-2 rounded-sm font-black text-base tracking-widest uppercase flex items-center justify-around mb-2">
          <span>{originHub}</span>
          <span className="text-xs font-normal">➔ ➔ ➔</span>
          <span className="text-lg bg-white text-black px-2 py-0.5 rounded-sm">
            {destHub}
          </span>
        </div>

        {/* Barcode & AWB Code */}
        <div className="text-center border border-black p-1.5 rounded-sm mb-2 bg-neutral-50">
          <BarcodeGenerator
            value={shipment.trackingNumber}
            width={1.7}
            height={38}
            fontSize={12}
            className="w-full"
          />
        </div>

        {/* Sender & Receiver Address Grid */}
        <div className="border border-black rounded-sm mb-2 divide-y divide-black">
          {/* Penerima (Large & Prominent) */}
          <div className="p-2 bg-neutral-50/50">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-black" /> PENERIMA (DESTINATION)
              </span>
              <span className="text-[10px] font-bold bg-neutral-200 px-1 rounded">
                Kota: {shipment.receiverCity}
              </span>
            </div>
            <div className="font-black text-sm text-black uppercase">
              {shipment.receiverName}
            </div>
            <div className="font-bold text-xs text-black flex items-center gap-1 my-0.5">
              <Phone className="w-3 h-3 text-black" /> {shipment.receiverPhone}
            </div>
            <div className="text-[10.5px] font-medium leading-tight text-neutral-800 break-words mt-0.5">
              {shipment.receiverAddress}
            </div>
          </div>

          {/* Pengirim */}
          <div className="p-1.5 text-[10px] bg-white">
            <div className="font-bold text-neutral-600 uppercase mb-0.5">
              PENGIRIM (ORIGIN):
            </div>
            <div className="font-bold text-black uppercase">
              {shipment.senderName} ({shipment.senderPhone})
            </div>
            <div className="text-neutral-700 truncate">
              {shipment.senderCity} - {shipment.senderAddress}
            </div>
          </div>
        </div>

        {/* Package Specs Matrix */}
        <div className="border border-black rounded-sm mb-2 grid grid-cols-4 divide-x divide-black text-center text-[10px] bg-neutral-50">
          <div className="p-1">
            <div className="text-[8.5px] text-neutral-600 font-bold uppercase">Berat Asli</div>
            <div className="font-black text-xs">{shipment.weight} Kg</div>
          </div>
          <div className="p-1">
            <div className="text-[8.5px] text-neutral-600 font-bold uppercase">Dimensi</div>
            <div className="font-bold text-[10px]">
              {shipment.length}x{shipment.width}x{shipment.height}
            </div>
          </div>
          <div className="p-1">
            <div className="text-[8.5px] text-neutral-600 font-bold uppercase">Volumetrik</div>
            <div className="font-bold text-[10px]">{volumetric} Kg</div>
          </div>
          <div className="p-1 bg-neutral-200">
            <div className="text-[8.5px] font-black uppercase text-black">Tagihan</div>
            <div className="font-black text-xs text-black">{shipment.chargeableWeight} Kg</div>
          </div>
        </div>
      </div>

      {/* Footer Section: QR Code, Cost, Verification & Signature */}
      <div className="border-t-2 border-black pt-1.5">
        <div className="flex items-center justify-between gap-2">
          {/* QR Code */}
          <div className="flex flex-col items-center">
            <QRCodeSVG value={trackingUrl} size={48} level="M" />
            <span className="text-[8px] font-bold mt-0.5 uppercase">Scan Lacak</span>
          </div>

          {/* Cost & Details */}
          <div className="flex-1 text-[9.5px]">
            <div className="flex justify-between border-b border-neutral-300 pb-0.5">
              <span className="text-neutral-600">Ongkir:</span>
              <span className="font-black text-black">{formatIDR(shipment.totalCost)}</span>
            </div>
            <div className="flex justify-between pt-0.5">
              <span className="text-neutral-600">Tgl Cetak:</span>
              <span className="font-semibold text-black">
                {formatIndonesianDate(shipment.createdAt).split(",")[0]}
              </span>
            </div>
            <div className="text-[8px] text-neutral-500 italic mt-0.5">
              *Syarat & Ketentuan berlaku di nusantaraexpress.co.id
            </div>
          </div>

          {/* Courier Signature box */}
          <div className="border border-black w-24 h-14 p-1 flex flex-col justify-between text-center rounded-sm bg-neutral-50">
            <span className="text-[7.5px] font-bold text-neutral-600 uppercase">Tanda Terima</span>
            <div className="border-b border-neutral-400 w-full mb-1"></div>
            <span className="text-[7px] text-neutral-500 font-semibold">(Nama Terang)</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (inline) {
    return (
      <div className="flex flex-col items-center">
        {labelContent}
        <button
          onClick={handlePrint}
          className="mt-4 inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 px-4 rounded-lg shadow transition"
        >
          <Printer className="w-4 h-4" /> Cetak Label Thermal (100x150mm)
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative bg-neutral-100 dark:bg-slate-900 p-6 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800">
        {/* Modal Action Header */}
        <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Box className="w-5 h-5 text-orange-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Surat Jalan / Thermal Shipping Label
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold py-1.5 px-3 rounded-lg shadow-sm transition"
            >
              <Printer className="w-3.5 h-3.5" /> Cetak (Print)
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Printable label container */}
        <div className="overflow-x-auto py-2">{labelContent}</div>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-4">
          Format standar 100mm × 150mm kompatibel dengan printer thermal POS / Label ekspedisi.
        </p>
      </div>
    </div>
  );
}
