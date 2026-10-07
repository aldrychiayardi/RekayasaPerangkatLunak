"use client";

import {
  STATUS_MAP,
  formatIndonesianDate,
} from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  MapPin,
  Truck,
  Package,
  Plane,
  AlertCircle,
  Building2,
  Navigation,
} from "lucide-react";

export interface TrackingEventItem {
  id: string;
  status: string;
  location: string;
  description: string;
  timestamp: Date | string;
}

interface TrackingTimelineProps {
  currentStatus: string;
  events: TrackingEventItem[];
}

const MILESTONES = [
  { key: "ORDER_CREATED", label: "Pesanan Dibuat", icon: Package },
  { key: "PICKED_UP", label: "Di-pickup", icon: Truck },
  { key: "AT_ORIGIN_HUB", label: "Hub Sortir", icon: Building2 },
  { key: "IN_TRANSIT", label: "Transit", icon: Plane },
  { key: "OUT_FOR_DELIVERY", label: "Diantar Kurir", icon: Navigation },
  { key: "DELIVERED", label: "Terkirim", icon: CheckCircle2 },
];

function getStatusIcon(status: string) {
  switch (status) {
    case "ORDER_CREATED":
      return <Package className="w-4 h-4 text-blue-600" />;
    case "PICKED_UP":
      return <Truck className="w-4 h-4 text-indigo-600" />;
    case "AT_ORIGIN_HUB":
    case "AT_DESTINATION_HUB":
      return <Building2 className="w-4 h-4 text-purple-600" />;
    case "IN_TRANSIT":
      return <Plane className="w-4 h-4 text-amber-600" />;
    case "OUT_FOR_DELIVERY":
      return <Navigation className="w-4 h-4 text-orange-600" />;
    case "DELIVERED":
      return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    case "FAILED":
      return <AlertCircle className="w-4 h-4 text-red-600" />;
    default:
      return <Clock className="w-4 h-4 text-slate-500" />;
  }
}

export function TrackingTimeline({ currentStatus, events }: TrackingTimelineProps) {
  const currentStep = STATUS_MAP[currentStatus]?.step ?? 1;

  return (
    <div className="space-y-6">
      {/* Milestone Progress Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-6">
          Status Progres Pengiriman
        </h4>
        <div className="relative">
          <div className="overflow-x-auto pb-4">
            <div className="flex items-center justify-between min-w-[500px] relative">
              {/* Connecting line */}
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0" />
              
              {MILESTONES.map((milestone, idx) => {
                const milestoneStep = idx + 1;
                const isCompleted =
                  currentStatus === "DELIVERED"
                    ? true
                    : milestoneStep <= currentStep;
                const isCurrent =
                  currentStatus === "DELIVERED"
                    ? idx === MILESTONES.length - 1
                    : milestone.key === currentStatus;
                const Icon = milestone.icon;

                return (
                  <div
                    key={milestone.key}
                    className="relative z-10 flex flex-col items-center group cursor-default"
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCurrent
                          ? "bg-orange-600 text-white ring-4 ring-orange-100 dark:ring-orange-950 scale-110 shadow-md"
                          : isCompleted
                          ? "bg-emerald-600 text-white shadow"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-300 dark:border-slate-700"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[11px] font-semibold mt-2 text-center whitespace-nowrap ${
                        isCurrent
                          ? "text-orange-600 font-bold"
                          : isCompleted
                          ? "text-slate-800 dark:text-slate-200"
                          : "text-slate-400"
                      }`}
                    >
                      {milestone.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Vertical Detailed Timeline */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-7 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Riwayat Perjalanan Paket (Tracking History)
            </h3>
            <p className="text-xs text-slate-500">
              Diperbarui secara real-time dari scan scanner operasional hub & kurir
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full">
            {events.length} Catatan Aktivitas
          </span>
        </div>

        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {events.map((event, index) => {
            const isLatest = index === 0;
            const statusConfig = STATUS_MAP[event.status] || {
              label: event.status,
              color: "text-slate-700",
              bg: "bg-slate-100",
              border: "border-slate-200",
            };

            return (
              <div key={event.id} className="relative group">
                {/* Node icon circle */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                    isLatest
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-950/80 ring-4 ring-orange-100 dark:ring-orange-950/50"
                      : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  }`}
                >
                  {getStatusIcon(event.status)}
                </div>

                {/* Event Card Content */}
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    isLatest
                      ? "bg-orange-50/40 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/50 shadow-sm"
                      : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800 hover:border-slate-300"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}
                    >
                      {statusConfig.label}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatIndonesianDate(event.timestamp)}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug mb-2">
                    {event.description}
                  </p>

                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                    <span>Lokasi: <strong className="text-slate-800 dark:text-slate-200">{event.location}</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
