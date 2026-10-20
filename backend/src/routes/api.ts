import { Router } from "express";
import { Prisma } from "@prisma/client";
import { ApiError } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import { authenticate, requireRole } from "../lib/auth-middleware.js";
import { DESTINATION_CITIES, ORIGIN_CITY, isSupportedDestination } from "../lib/locations.js";
import { updateAdminRate } from "../services/admin-rates.service.js";
import { recordCourierCheckpoint } from "../services/courier.service.js";
import {
  calculateRatesForRoute,
  type RateCalculationInput
} from "../services/rates.service.js";
import { createShipment } from "../services/shipment.service.js";
import { getShipmentByAwb } from "../services/tracking.service.js";

export const apiRouter = Router();

const serviceTypes = ["REGULAR", "VEHICLE"];
const defaultRates = {
  REGULAR: { rate: 12000, estimatedDays: "2-3 Hari" },
  VEHICLE: { rate: 200000, estimatedDays: "Sesuai jadwal" }
} as const;
const shipmentStatuses = [
  "ORDER_CREATED",
  "PICKED_UP",
  "AT_ORIGIN_HUB",
  "IN_TRANSIT",
  "AT_DESTINATION_HUB",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "FAILED"
];

interface ShipmentInput {
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
  serviceType: string;
}

function requireString(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new ApiError(400, `${label} wajib diisi.`);
  }
  return value.trim();
}

function requirePositiveNumber(value: unknown, label: string): number {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number) || number <= 0) {
    throw new ApiError(400, `${label} harus berupa angka lebih besar dari 0.`);
  }
  return number;
}

function getShipmentInput(value: unknown): ShipmentInput {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ApiError(400, "Isi permintaan harus berupa objek JSON.");
  }
  const body = value as Record<string, unknown>;
  const serviceType = requireString(body.serviceType, "Jenis layanan");
  if (!serviceTypes.includes(serviceType)) {
    throw new ApiError(400, "Jenis layanan tidak dikenal.");
  }

  const senderCity = requireString(body.senderCity, "Kota asal");
  const receiverCity = requireString(body.receiverCity, "Kota tujuan");
  if (senderCity !== ORIGIN_CITY || !isSupportedDestination(receiverCity)) {
    throw new ApiError(400, "Rute pengiriman hanya tersedia dari Pontianak ke wilayah rute Seluas.");
  }

  return {
    senderName: requireString(body.senderName, "Nama pengirim"),
    senderPhone: requireString(body.senderPhone, "Nomor telepon pengirim"),
    senderCity,
    senderAddress: requireString(body.senderAddress, "Alamat pengirim"),
    receiverName: requireString(body.receiverName, "Nama penerima"),
    receiverPhone: requireString(body.receiverPhone, "Nomor telepon penerima"),
    receiverCity,
    receiverAddress: requireString(body.receiverAddress, "Alamat penerima"),
    weight: requirePositiveNumber(body.weight, "Berat paket"),
    length: requirePositiveNumber(body.length, "Panjang paket"),
    width: requirePositiveNumber(body.width, "Lebar paket"),
    height: requirePositiveNumber(body.height, "Tinggi paket"),
    serviceType
  };
}

function getRateCalculationInput(value: unknown): RateCalculationInput {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ApiError(400, "Isi permintaan harus berupa objek JSON.");
  }
  const body = value as Record<string, unknown>;
  const originCity = requireString(body.originCity, "Kota asal");
  const destinationCity = requireString(body.destinationCity, "Kota tujuan");
  if (originCity !== ORIGIN_CITY || !isSupportedDestination(destinationCity)) {
    throw new ApiError(400, "Rute hanya tersedia dari Pontianak ke wilayah rute Seluas.");
  }
  return {
    originCity,
    destinationCity,
    weight: requirePositiveNumber(body.weight, "Berat paket"),
    length: requirePositiveNumber(body.length, "Panjang paket"),
    width: requirePositiveNumber(body.width, "Lebar paket"),
    height: requirePositiveNumber(body.height, "Tinggi paket")
  };
}

function getNumberOfRecords(value: unknown, fallback: number): number {
  if (typeof value !== "string") {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, 100) : fallback;
}

apiRouter.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

apiRouter.get("/shipments", authenticate(true), async (request, response) => {
  const query = typeof request.query.query === "string" ? request.query.query.trim() : "";
  const status = typeof request.query.status === "string" ? request.query.status : "";
  const service = typeof request.query.service === "string" ? request.query.service : "";

  const where: Prisma.ShipmentWhereInput = {};
  if (request.user?.role === "CUSTOMER") {
    where.userId = request.user.id;
  }
  if (status && status !== "ALL") {
    where.status = shipmentStatuses.includes(status) ? status : { equals: status };
  }
  if (service && service !== "ALL") {
    where.serviceType = serviceTypes.includes(service) ? service : { equals: service };
  }
  if (query) {
    where.OR = [
      { trackingNumber: { contains: query } },
      { senderName: { contains: query } },
      { receiverName: { contains: query } },
      { senderCity: { contains: query } },
      { receiverCity: { contains: query } }
    ];
  }

  const shipments = await prisma.shipment.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      events: {
        orderBy: { timestamp: "desc" },
        take: 1
      }
    }
  });
  response.json(shipments);
});

apiRouter.get("/shipments/:awb", async (request, response) => {
  const shipment = await getShipmentByAwb(prisma, request.params.awb);
  response.json(shipment);
});

apiRouter.post("/shipments", authenticate(true), async (request, response) => {
  const input = getShipmentInput(request.body);
  const shipment = await createShipment(prisma, input, request.user?.id ?? null);
  response.status(201).json(shipment);
});

apiRouter.post(
  "/shipments/:awb/events",
  authenticate(),
  requireRole("ADMIN", "COURIER", "OWNER"),
  async (request, response) => {
    const body = request.body as Record<string, unknown>;
    const event = await recordCourierCheckpoint(prisma, request.params.awb, {
      status: requireString(body?.status, "Status pengiriman"),
      location: requireString(body?.location, "Lokasi checkpoint"),
      description: requireString(body?.description, "Keterangan checkpoint")
    });
    response.status(201).json(event);
});

apiRouter.get(
  "/admin/metrics",
  authenticate(),
  requireRole("ADMIN", "OWNER"),
  async (request, response) => {
    const isOwner = request.user?.role === "OWNER";
    const [totalShipments, shipments, activeInTransit, deliveredCount] = await Promise.all([
      prisma.shipment.count(),
      prisma.shipment.findMany({ select: { totalCost: true } }),
      prisma.shipment.count({ where: { status: { notIn: ["DELIVERED", "FAILED"] } } }),
      prisma.shipment.count({ where: { status: "DELIVERED" } })
    ]);
    const totalRevenue = shipments.reduce((total, shipment) => total + shipment.totalCost, 0);
    response.json({
      totalShipments,
      totalRevenue: isOwner ? totalRevenue : null,
      isOwner,
      activeInTransit,
      deliveredCount,
      deliveryPercentage: totalShipments
        ? Math.round((deliveredCount / totalShipments) * 100)
        : 0
    });
  }
);

apiRouter.get("/tracking-events", async (request, response) => {
  const limit = getNumberOfRecords(request.query.limit, 10);
  const events = await prisma.trackingEvent.findMany({
    take: limit,
    orderBy: { timestamp: "desc" },
    include: {
      shipment: {
        select: {
          trackingNumber: true,
          senderCity: true,
          receiverCity: true,
          serviceType: true
        }
      }
    }
  });
  response.json(events);
});

apiRouter.get("/rates", async (request, response) => {
  const origin = typeof request.query.origin === "string" ? request.query.origin : "";
  const destination = typeof request.query.destination === "string"
    ? request.query.destination
    : "";
  if (
    (origin && origin !== "ALL" && origin !== ORIGIN_CITY) ||
    (destination && destination !== "ALL" && !isSupportedDestination(destination))
  ) {
    response.json([]);
    return;
  }
  const rates = await prisma.priceRate.findMany({
    where: {
      originCity: ORIGIN_CITY,
      destinationCity: { in: [...DESTINATION_CITIES] },
      ...(destination && destination !== "ALL" ? { destinationCity: destination } : {})
    },
    orderBy: [
      { originCity: "asc" },
      { destinationCity: "asc" },
      { serviceType: "asc" }
    ]
  });
  response.json(rates
    .filter((rate) => serviceTypes.includes(rate.serviceType))
    .map((rate) => {
      const defaults = defaultRates[rate.serviceType as keyof typeof defaultRates];
      return {
        ...rate,
        ratePerKg: rate.ratePerKg > 0 ? rate.ratePerKg : defaults.rate,
        estimatedDays: rate.estimatedDays !== "Belum ditentukan"
          ? rate.estimatedDays
          : defaults.estimatedDays
      };
    }));
});

apiRouter.post("/rates/calculate", async (request, response) => {
  const input = getRateCalculationInput(request.body);
  response.json(await calculateRatesForRoute(prisma, input));
});

apiRouter.put(
  "/rates/:id",
  authenticate(),
  requireRole("OWNER"),
  async (request, response) => {
    const body = request.body as Record<string, unknown>;
    const updatedRate = await updateAdminRate(prisma, requireString(request.params.id, "ID tarif"), {
      ratePerKg: Number(body?.ratePerKg),
      estimatedDays: requireString(body?.estimatedDays, "Estimasi waktu")
    });
    response.json(updatedRate);
});
