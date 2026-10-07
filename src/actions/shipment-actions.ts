"use server";

import { prisma } from "@/lib/prisma";
import { generateAwb } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export interface RateCalculationResult {
  volumetricWeight: number;
  actualWeight: number;
  chargeableWeight: number;
  services: {
    serviceType: "REGULAR" | "EXPRESS" | "CARGO";
    serviceName: string;
    ratePerKg: number;
    totalCost: number;
    estimatedDays: string;
    description: string;
    isEligible: boolean;
    notice?: string;
  }[];
}

// 1. Calculate Shipping Rates
export async function calculateShippingRates(
  originCity: string,
  destinationCity: string,
  weight: number,
  length: number,
  width: number,
  height: number
): Promise<RateCalculationResult> {
  const actualWeight = Math.max(0.1, Number(weight) || 1);
  const l = Math.max(1, Number(length) || 10);
  const w = Math.max(1, Number(width) || 10);
  const h = Math.max(1, Number(height) || 10);

  // Standard Formula: (L x W x H) / 6000
  const volumetricWeight = Math.round(((l * w * h) / 6000) * 100) / 100;
  const rawChargeable = Math.max(actualWeight, volumetricWeight);
  // Chargeable weight rounded up to 1 decimal place (or min 1 kg for regular/express)
  const chargeableWeight = Math.max(1, Math.round(rawChargeable * 10) / 10);

  // Fetch rates from DB
  const rates = await prisma.priceRate.findMany({
    where: {
      originCity,
      destinationCity,
    },
  });

  // Default fallback if not found in DB
  const regularRate = rates.find((r) => r.serviceType === "REGULAR")?.ratePerKg ?? 20000;
  const regularEst = rates.find((r) => r.serviceType === "REGULAR")?.estimatedDays ?? "2-3 Hari";

  const expressRate = rates.find((r) => r.serviceType === "EXPRESS")?.ratePerKg ?? Math.round(regularRate * 1.5);
  const expressEst = rates.find((r) => r.serviceType === "EXPRESS")?.estimatedDays ?? "1-2 Hari (Next Day)";

  const cargoRate = rates.find((r) => r.serviceType === "CARGO")?.ratePerKg ?? Math.round(regularRate * 0.7);
  const cargoEst = rates.find((r) => r.serviceType === "CARGO")?.estimatedDays ?? "3-5 Hari";

  // Calculate costs
  // CARGO has minimum 10 kg requirement
  const cargoChargeableWeight = Math.max(10, chargeableWeight);

  return {
    volumetricWeight,
    actualWeight,
    chargeableWeight,
    services: [
      {
        serviceType: "EXPRESS",
        serviceName: "NEX Express",
        ratePerKg: expressRate,
        totalCost: Math.round(expressRate * chargeableWeight),
        estimatedDays: expressEst,
        description: "Layanan prioritas cepat kilat sampai esok hari.",
        isEligible: true,
      },
      {
        serviceType: "REGULAR",
        serviceName: "NEX Regular",
        ratePerKg: regularRate,
        totalCost: Math.round(regularRate * chargeableWeight),
        estimatedDays: regularEst,
        description: "Pengiriman handal dan terjangkau ke seluruh pelosok negeri.",
        isEligible: true,
      },
      {
        serviceType: "CARGO",
        serviceName: "NEX Cargo",
        ratePerKg: cargoRate,
        totalCost: Math.round(cargoRate * cargoChargeableWeight),
        estimatedDays: cargoEst,
        description: "Solusi hemat untuk pengiriman muatan besar (Min. 10 Kg).",
        isEligible: true,
        notice: chargeableWeight < 10 ? "Dikenakan berat minimum 10 Kg untuk layanan Kargo." : undefined,
      },
    ],
  };
}

// 2. Get Shipment by AWB
export async function getShipmentByAwb(awb: string) {
  if (!awb) return null;
  const cleanAwb = awb.trim().toUpperCase();

  const shipment = await prisma.shipment.findUnique({
    where: { trackingNumber: cleanAwb },
    include: {
      events: {
        orderBy: { timestamp: "desc" },
      },
    },
  });

  return shipment;
}

// 3. Create New Shipment Order
export interface CreateShipmentInput {
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
  serviceType: "REGULAR" | "EXPRESS" | "CARGO";
}

export async function createShipmentOrder(input: CreateShipmentInput) {
  const actualWeight = Math.max(0.1, Number(input.weight) || 1);
  const l = Math.max(1, Number(input.length) || 10);
  const w = Math.max(1, Number(input.width) || 10);
  const h = Math.max(1, Number(input.height) || 10);

  const volumetricWeight = Math.round(((l * w * h) / 6000) * 100) / 100;
  const rawChargeable = Math.max(actualWeight, volumetricWeight);
  let chargeableWeight = Math.max(1, Math.round(rawChargeable * 10) / 10);

  if (input.serviceType === "CARGO") {
    chargeableWeight = Math.max(10, chargeableWeight);
  }

  // Find rate
  const rateRecord = await prisma.priceRate.findFirst({
    where: {
      originCity: input.senderCity,
      destinationCity: input.receiverCity,
      serviceType: input.serviceType,
    },
  });

  let ratePerKg = rateRecord?.ratePerKg;
  if (!ratePerKg) {
    // default base
    const base = 20000;
    ratePerKg =
      input.serviceType === "EXPRESS"
        ? Math.round(base * 1.5)
        : input.serviceType === "CARGO"
        ? Math.round(base * 0.7)
        : base;
  }

  const totalCost = Math.round(ratePerKg * chargeableWeight);
  const trackingNumber = generateAwb();

  const shipment = await prisma.shipment.create({
    data: {
      trackingNumber,
      senderName: input.senderName,
      senderPhone: input.senderPhone,
      senderCity: input.senderCity,
      senderAddress: input.senderAddress,
      receiverName: input.receiverName,
      receiverPhone: input.receiverPhone,
      receiverCity: input.receiverCity,
      receiverAddress: input.receiverAddress,
      weight: actualWeight,
      length: l,
      width: w,
      height: h,
      chargeableWeight,
      serviceType: input.serviceType,
      totalCost,
      status: "ORDER_CREATED",
    },
  });

  // Create initial tracking event
  await prisma.trackingEvent.create({
    data: {
      shipmentId: shipment.id,
      status: "ORDER_CREATED",
      location: `Drop Point / Gerai ${input.senderCity}`,
      description: "Pesanan pengiriman berhasil dibuat di sistem NusantaraExpress.",
    },
  });

  revalidatePath("/dashboard/customer");
  revalidatePath("/dashboard/admin");
  revalidatePath(`/track/${trackingNumber}`);

  return shipment;
}

// 4. Add Tracking Event (Courier / Hub portal)
export async function addTrackingEvent(
  trackingNumber: string,
  status: string,
  location: string,
  description: string
) {
  const cleanAwb = trackingNumber.trim().toUpperCase();

  const shipment = await prisma.shipment.findUnique({
    where: { trackingNumber: cleanAwb },
  });

  if (!shipment) {
    throw new Error(`Paket dengan nomor resi ${cleanAwb} tidak ditemukan.`);
  }

  // Create event
  const newEvent = await prisma.trackingEvent.create({
    data: {
      shipmentId: shipment.id,
      status,
      location: location.trim(),
      description: description.trim(),
      timestamp: new Date(),
    },
  });

  // Update shipment status
  await prisma.shipment.update({
    where: { id: shipment.id },
    data: {
      status,
      updatedAt: new Date(),
    },
  });

  revalidatePath(`/track/${cleanAwb}`);
  revalidatePath("/dashboard/courier");
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/customer");

  return newEvent;
}

// 5. Admin Analytics Metrics
export async function getAdminMetrics() {
  const [totalShipments, shipments, activeCount, deliveredCount] = await Promise.all([
    prisma.shipment.count(),
    prisma.shipment.findMany({
      select: { totalCost: true },
    }),
    prisma.shipment.count({
      where: {
        status: {
          notIn: ["DELIVERED", "FAILED"],
        },
      },
    }),
    prisma.shipment.count({
      where: {
        status: "DELIVERED",
      },
    }),
  ]);

  const totalRevenue = shipments.reduce((acc, curr) => acc + curr.totalCost, 0);
  const deliveryPercentage =
    totalShipments > 0 ? Math.round((deliveredCount / totalShipments) * 100) : 0;

  return {
    totalShipments,
    totalRevenue,
    activeInTransit: activeCount,
    deliveredCount,
    deliveryPercentage,
  };
}

// 6. Get All Shipments (with search & filters)
export async function getAllShipments(query?: string, status?: string, service?: string) {
  const whereClause: Record<string, unknown> = {};

  if (status && status !== "ALL") {
    whereClause.status = status;
  }

  if (service && service !== "ALL") {
    whereClause.serviceType = service;
  }

  if (query && query.trim() !== "") {
    const q = query.trim();
    whereClause.OR = [
      { trackingNumber: { contains: q } },
      { senderName: { contains: q } },
      { receiverName: { contains: q } },
      { senderCity: { contains: q } },
      { receiverCity: { contains: q } },
    ];
  }

  const shipments = await prisma.shipment.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: {
      events: {
        orderBy: { timestamp: "desc" },
        take: 1,
      },
    },
  });

  return shipments;
}

// 7. Get Recent Tracking Events (for Courier scan log)
export async function getRecentTrackingEvents(limit = 10) {
  return await prisma.trackingEvent.findMany({
    take: limit,
    orderBy: { timestamp: "desc" },
    include: {
      shipment: {
        select: {
          trackingNumber: true,
          senderCity: true,
          receiverCity: true,
          serviceType: true,
        },
      },
    },
  });
}

// 8. Rates Management
export async function getAllRates(origin?: string, destination?: string) {
  const whereClause: Record<string, unknown> = {};
  if (origin && origin !== "ALL") whereClause.originCity = origin;
  if (destination && destination !== "ALL") whereClause.destinationCity = destination;

  return await prisma.priceRate.findMany({
    where: whereClause,
    orderBy: [{ originCity: "asc" }, { destinationCity: "asc" }, { serviceType: "asc" }],
  });
}

export async function updateRate(id: string, ratePerKg: number, estimatedDays: string) {
  const updated = await prisma.priceRate.update({
    where: { id },
    data: {
      ratePerKg: Number(ratePerKg),
      estimatedDays: estimatedDays.trim(),
    },
  });

  revalidatePath("/rates");
  revalidatePath("/dashboard/admin");
  return updated;
}
