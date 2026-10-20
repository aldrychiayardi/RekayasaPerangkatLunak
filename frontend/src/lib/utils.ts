import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatIndonesianDate(date: Date | string | number): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return format(d, "dd MMM yyyy, HH:mm 'WIB'", { locale: id });
}

export function formatShortDate(date: Date | string | number): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return format(d, "dd/MM/yyyy", { locale: id });
}

export function getCityHubCode(city: string): string {
  const codes: Record<string, string> = {
    Pontianak: "PNK",
    "Kubu Raya": "KUB",
    "Sungai Pinyuh": "SPY",
    Anjongan: "ANJ",
    Toho: "TOH",
    Menjalin: "MEN",
    Karangan: "KAR",
    Seluas: "SEL",
  };
  return codes[city] || city.substring(0, 3).toUpperCase();
}

export const ORIGIN_CITY = "Pontianak";

export const DESTINATION_LOCATIONS = [
  { value: "Kubu Raya", label: "Kabupaten Kubu Raya" },
  { value: "Sungai Pinyuh", label: "Sungai Pinyuh — Kabupaten Mempawah" },
  { value: "Anjongan", label: "Anjongan — Kabupaten Mempawah" },
  { value: "Toho", label: "Toho — Kabupaten Landak" },
  { value: "Menjalin", label: "Menjalin — Kabupaten Landak" },
  { value: "Karangan", label: "Karangan — Kabupaten Landak" },
  { value: "Seluas", label: "Seluas — Kabupaten Bengkayang" },
] as const;

export const DESTINATION_CITIES = DESTINATION_LOCATIONS.map(({ value }) => value);

export function getLocationLabel(city: string): string {
  return DESTINATION_LOCATIONS.find((location) => location.value === city)?.label ?? city;
}

export function getServiceLabel(serviceType: string): string {
  const labels: Record<string, string> = {
    REGULAR: "REGULER",
    VEHICLE: "KENDARAAN",
    EXPRESS: "EXPRESS",
    CARGO: "KARGO",
  };
  return labels[serviceType] ?? serviceType;
}

export const STATUS_MAP: Record<
  string,
  { label: string; color: string; bg: string; border: string; step: number }
> = {
  ORDER_CREATED: {
    label: "Pesanan Dibuat",
    color: "text-blue-700 dark:text-blue-300",
    bg: "bg-blue-50 dark:bg-blue-950/60",
    border: "border-blue-200 dark:border-blue-800",
    step: 1,
  },
  PICKED_UP: {
    label: "Di-pickup Kurir",
    color: "text-indigo-700 dark:text-indigo-300",
    bg: "bg-indigo-50 dark:bg-indigo-950/60",
    border: "border-indigo-200 dark:border-indigo-800",
    step: 2,
  },
  AT_ORIGIN_HUB: {
    label: "Di Hub Asal",
    color: "text-purple-700 dark:text-purple-300",
    bg: "bg-purple-50 dark:bg-purple-950/60",
    border: "border-purple-200 dark:border-purple-800",
    step: 3,
  },
  IN_TRANSIT: {
    label: "Dalam Perjalanan",
    color: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-50 dark:bg-amber-950/60",
    border: "border-amber-200 dark:border-amber-800",
    step: 4,
  },
  AT_DESTINATION_HUB: {
    label: "Di Hub Tujuan",
    color: "text-cyan-700 dark:text-cyan-300",
    bg: "bg-cyan-50 dark:bg-cyan-950/60",
    border: "border-cyan-200 dark:border-cyan-800",
    step: 5,
  },
  OUT_FOR_DELIVERY: {
    label: "Sedang Diantar",
    color: "text-orange-700 dark:text-orange-300",
    bg: "bg-orange-50 dark:bg-orange-950/60",
    border: "border-orange-200 dark:border-orange-800",
    step: 6,
  },
  DELIVERED: {
    label: "Terkirim",
    color: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-50 dark:bg-emerald-950/60",
    border: "border-emerald-200 dark:border-emerald-800",
    step: 7,
  },
  FAILED: {
    label: "Gagal / Kendala",
    color: "text-red-700 dark:text-red-300",
    bg: "bg-red-50 dark:bg-red-950/60",
    border: "border-red-200 dark:border-red-800",
    step: 0,
  },
};
