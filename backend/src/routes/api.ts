import { Router } from "express";
import { randomInt } from "node:crypto";
import { Prisma } from "@prisma/client";
import { ApiError } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import { authenticate, requireRole } from "../lib/auth-middleware.js";
import { DESTINATION_CITIES, ORIGIN_CITY, isSupportedDestination } from "../lib/locations.js";

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

interface RateCalculationInput {
  originCity: string;
  destinationCity: string;
  weight: number;
  length: number;
  width: number;
  height: number;
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

function getAwb(value: string | string[] | undefined): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new ApiError(400, "Nomor resi tidak valid.");
  }
  return value.trim().toUpperCase();
}

function getNumberOfRecords(value: unknown, fallback: number): number {
  if (typeof value !== "string") {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, 100) : fallback;
}

function generateAwb(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const randomPart = Array.from({ length: 6 }, () => alphabet[randomInt(alphabet.length)]).join("");
  return `NEX-${new Date().getFullYear()}${randomPart}`;
}

function calculateRates(input: RateCalculationInput, storedRates: Array<{
  serviceType: string;
  ratePerKg: number;
  estimatedDays: string;
}>) {
  const actualWeight = Math.max(0.1, Number(input.weight) || 1);
  const length = Math.max(1, Number(input.length) || 10);
  const width = Math.max(1, Number(input.width) || 10);
  const height = Math.max(1, Number(input.height) || 10);
  const volumetricWeight = Math.round(((length * width * height) / 6000) * 100) / 100;
  const rawChargeable = Math.max(actualWeight, volumetricWeight);
  const chargeableWeight = Math.max(1, Math.round(rawChargeable * 10) / 10);
  const regular = storedRates.find((rate) => rate.serviceType === "REGULAR");
  const vehicle = storedRates.find((rate) => rate.serviceType === "VEHICLE");
  const regularRate = regular && regular.ratePerKg > 0
    ? regular.ratePerKg
    : defaultRates.REGULAR.rate;
  const vehicleRate = vehicle && vehicle.ratePerKg > 0
    ? vehicle.ratePerKg
    : defaultRates.VEHICLE.rate;

  return {
    volumetricWeight,
    actualWeight,
    chargeableWeight,
    services: [
      {
        serviceType: "REGULAR",
        serviceName: "Reguler",
        rateAmount: regularRate,
        rateUnit: "kg",
        totalCost: Math.round(regularRate * chargeableWeight),
        estimatedDays: regular?.estimatedDays && regular.estimatedDays !== "Belum ditentukan"
          ? regular.estimatedDays
          : defaultRates.REGULAR.estimatedDays,
        description: "Pengiriman reguler dengan tarif berdasarkan berat tagihan.",
        isEligible: true
      },
      {
        serviceType: "VEHICLE",
        serviceName: "Kendaraan",
        rateAmount: vehicleRate,
        rateUnit: "unit",
        totalCost: vehicleRate,
        estimatedDays: vehicle?.estimatedDays && vehicle.estimatedDays !== "Belum ditentukan"
          ? vehicle.estimatedDays
          : defaultRates.VEHICLE.estimatedDays,
        description: "Jasa pengiriman kendaraan dengan tarif per unit.",
        isEligible: true
      }
    ]
  };
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
  const trackingNumber = getAwb(request.params.awb);
  const shipment = await prisma.shipment.findUnique({
    where: { trackingNumber },
    include: { events: { orderBy: { timestamp: "desc" } } }
  });
  if (!shipment) {
    throw new ApiError(404, `Paket dengan nomor resi ${trackingNumber} tidak ditemukan.`);
  }
  response.json(shipment);
});

apiRouter.post("/shipments", authenticate(true), async (request, response) => {
  const input = getShipmentInput(request.body);
  const length = Math.max(1, input.length);
  const width = Math.max(1, input.width);
  const height = Math.max(1, input.height);
  const volumetricWeight = Math.round(((length * width * height) / 6000) * 100) / 100;
  const chargeableWeight = Math.max(1, Math.round(Math.max(input.weight, volumetricWeight) * 10) / 10);
  const rate = await prisma.priceRate.findFirst({
    where: {
      originCity: input.senderCity,
      destinationCity: input.receiverCity,
      serviceType: input.serviceType
    }
  });
  if (!rate) {
    throw new ApiError(404, "Tarif untuk rute ini belum tersedia.");
  }
  const ratePerKg = rate.ratePerKg > 0
    ? rate.ratePerKg
    : defaultRates[input.serviceType as keyof typeof defaultRates].rate;
  const trackingNumber = generateAwb();

  try {
    const shipment = await prisma.shipment.create({
      data: {
        ...input,
        userId: request.user?.id ?? null,
        trackingNumber,
        weight: input.weight,
        length,
        width,
        height,
        chargeableWeight,
        totalCost: input.serviceType === "VEHICLE"
          ? ratePerKg
          : Math.round(ratePerKg * chargeableWeight),
        status: "ORDER_CREATED",
        events: {
          create: {
            status: "ORDER_CREATED",
            location: `Drop Point / Gerai ${input.senderCity}`,
            description: "Pesanan pengiriman berhasil dibuat di sistem NusantaraExpress."
          }
        }
      },
      include: { events: { orderBy: { timestamp: "desc" } } }
    });
    response.status(201).json(shipment);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new ApiError(503, "Nomor resi gagal dibuat. Silakan coba kembali.");
    }
    throw error;
  }
});

apiRouter.post(
  "/shipments/:awb/events",
  authenticate(),
  requireRole("ADMIN", "COURIER", "OWNER"),
  async (request, response) => {
    const trackingNumber = getAwb(request.params.awb);
  const body = request.body as Record<string, unknown>;
  const status = requireString(body?.status, "Status pengiriman");
  if (!shipmentStatuses.includes(status)) {
    throw new ApiError(400, "Status pengiriman tidak dikenal.");
  }
  const location = requireString(body?.location, "Lokasi checkpoint");
  const description = requireString(body?.description, "Keterangan checkpoint");
  const shipment = await prisma.shipment.findUnique({ where: { trackingNumber } });
  if (!shipment) {
    throw new ApiError(404, `Paket dengan nomor resi ${trackingNumber} tidak ditemukan.`);
  }

  const event = await prisma.$transaction(async (transaction) => {
    const createdEvent = await transaction.trackingEvent.create({
      data: {
        shipmentId: shipment.id,
        status,
        location,
        description,
        timestamp: new Date()
      }
    });
    await transaction.shipment.update({
      where: { id: shipment.id },
      data: { status, updatedAt: new Date() }
    });
    return createdEvent;
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
  const rates = await prisma.priceRate.findMany({
    where: {
      originCity: input.originCity,
      destinationCity: input.destinationCity
    }
  });
  if (rates.length === 0) {
    throw new ApiError(
      404,
      `Tarif untuk rute ${input.originCity} ke ${input.destinationCity} belum tersedia.`
    );
  }
  response.json(calculateRates(input, rates));
});

apiRouter.put(
  "/rates/:id",
  authenticate(),
  requireRole("OWNER"),
  async (request, response) => {
    const id = request.params.id;
  if (typeof id !== "string" || !id) {
    throw new ApiError(400, "ID tarif tidak valid.");
  }
  const body = request.body as Record<string, unknown>;
  const ratePerKg = Number(body?.ratePerKg);
  if (!Number.isFinite(ratePerKg) || ratePerKg <= 0) {
    throw new ApiError(400, "Tarif harus lebih besar dari 0.");
  }
  const estimatedDays = requireString(body?.estimatedDays, "Estimasi waktu");

  try {
    const updatedRate = await prisma.priceRate.update({
      where: { id },
      data: { ratePerKg, estimatedDays }
    });
    response.json(updatedRate);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new ApiError(404, "Data tarif tidak ditemukan.");
    }
    throw error;
  }
});
