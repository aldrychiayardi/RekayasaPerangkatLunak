import { Router } from "express";
import { randomInt } from "node:crypto";
import { Prisma } from "@prisma/client";
import { ApiError } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";

export const apiRouter = Router();

const serviceTypes = ["REGULAR", "EXPRESS", "CARGO"];
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

  return {
    senderName: requireString(body.senderName, "Nama pengirim"),
    senderPhone: requireString(body.senderPhone, "Nomor telepon pengirim"),
    senderCity: requireString(body.senderCity, "Kota asal"),
    senderAddress: requireString(body.senderAddress, "Alamat pengirim"),
    receiverName: requireString(body.receiverName, "Nama penerima"),
    receiverPhone: requireString(body.receiverPhone, "Nomor telepon penerima"),
    receiverCity: requireString(body.receiverCity, "Kota tujuan"),
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
  return {
    originCity: requireString(body.originCity, "Kota asal"),
    destinationCity: requireString(body.destinationCity, "Kota tujuan"),
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
}> ) {
  const actualWeight = Math.max(0.1, Number(input.weight) || 1);
  const length = Math.max(1, Number(input.length) || 10);
  const width = Math.max(1, Number(input.width) || 10);
  const height = Math.max(1, Number(input.height) || 10);
  const volumetricWeight = Math.round(((length * width * height) / 6000) * 100) / 100;
  const rawChargeable = Math.max(actualWeight, volumetricWeight);
  const chargeableWeight = Math.max(1, Math.round(rawChargeable * 10) / 10);
  const regular = storedRates.find((rate) => rate.serviceType === "REGULAR");
  const express = storedRates.find((rate) => rate.serviceType === "EXPRESS");
  const cargo = storedRates.find((rate) => rate.serviceType === "CARGO");
  const regularRate = regular?.ratePerKg ?? 20000;
  const expressRate = express?.ratePerKg ?? Math.round(regularRate * 1.5);
  const cargoRate = cargo?.ratePerKg ?? Math.round(regularRate * 0.7);

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
        estimatedDays: express?.estimatedDays ?? "1-2 Hari (Next Day)",
        description: "Layanan prioritas cepat kilat sampai esok hari.",
        isEligible: true
      },
      {
        serviceType: "REGULAR",
        serviceName: "NEX Regular",
        ratePerKg: regularRate,
        totalCost: Math.round(regularRate * chargeableWeight),
        estimatedDays: regular?.estimatedDays ?? "2-3 Hari",
        description: "Pengiriman handal dan terjangkau ke seluruh pelosok negeri.",
        isEligible: true
      },
      {
        serviceType: "CARGO",
        serviceName: "NEX Cargo",
        ratePerKg: cargoRate,
        totalCost: Math.round(cargoRate * Math.max(10, chargeableWeight)),
        estimatedDays: cargo?.estimatedDays ?? "3-5 Hari",
        description: "Solusi hemat untuk pengiriman muatan besar (Min. 10 Kg).",
        isEligible: true,
        ...(chargeableWeight < 10
          ? { notice: "Dikenakan berat minimum 10 Kg untuk layanan Kargo." }
          : {})
      }
    ]
  };
}

apiRouter.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

apiRouter.get("/shipments", async (request, response) => {
  const query = typeof request.query.query === "string" ? request.query.query.trim() : "";
  const status = typeof request.query.status === "string" ? request.query.status : "";
  const service = typeof request.query.service === "string" ? request.query.service : "";

  const where: Prisma.ShipmentWhereInput = {};
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

apiRouter.post("/shipments", async (request, response) => {
  const input = getShipmentInput(request.body);
  const length = Math.max(1, input.length);
  const width = Math.max(1, input.width);
  const height = Math.max(1, input.height);
  const volumetricWeight = Math.round(((length * width * height) / 6000) * 100) / 100;
  let chargeableWeight = Math.max(1, Math.round(Math.max(input.weight, volumetricWeight) * 10) / 10);
  if (input.serviceType === "CARGO") {
    chargeableWeight = Math.max(10, chargeableWeight);
  }

  const rate = await prisma.priceRate.findFirst({
    where: {
      originCity: input.senderCity,
      destinationCity: input.receiverCity,
      serviceType: input.serviceType
    }
  });
  const baseRate = 20000;
  const ratePerKg = rate?.ratePerKg ?? (
    input.serviceType === "EXPRESS"
      ? Math.round(baseRate * 1.5)
      : input.serviceType === "CARGO"
        ? Math.round(baseRate * 0.7)
        : baseRate
  );
  const trackingNumber = generateAwb();

  try {
    const shipment = await prisma.shipment.create({
      data: {
        ...input,
        trackingNumber,
        weight: input.weight,
        length,
        width,
        height,
        chargeableWeight,
        totalCost: Math.round(ratePerKg * chargeableWeight),
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

apiRouter.post("/shipments/:awb/events", async (request, response) => {
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

apiRouter.get("/admin/metrics", async (_request, response) => {
  const [totalShipments, shipments, activeInTransit, deliveredCount] = await Promise.all([
    prisma.shipment.count(),
    prisma.shipment.findMany({ select: { totalCost: true } }),
    prisma.shipment.count({ where: { status: { notIn: ["DELIVERED", "FAILED"] } } }),
    prisma.shipment.count({ where: { status: "DELIVERED" } })
  ]);
  const totalRevenue = shipments.reduce((total, shipment) => total + shipment.totalCost, 0);
  response.json({
    totalShipments,
    totalRevenue,
    activeInTransit,
    deliveredCount,
    deliveryPercentage: totalShipments
      ? Math.round((deliveredCount / totalShipments) * 100)
      : 0
  });
});

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
  const rates = await prisma.priceRate.findMany({
    where: {
      ...(origin && origin !== "ALL" ? { originCity: origin } : {}),
      ...(destination && destination !== "ALL" ? { destinationCity: destination } : {})
    },
    orderBy: [
      { originCity: "asc" },
      { destinationCity: "asc" },
      { serviceType: "asc" }
    ]
  });
  response.json(rates);
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

apiRouter.put("/rates/:id", async (request, response) => {
  const id = request.params.id;
  if (typeof id !== "string" || !id) {
    throw new ApiError(400, "ID tarif tidak valid.");
  }
  const body = request.body as Record<string, unknown>;
  const ratePerKg = Number(body?.ratePerKg);
  if (!Number.isFinite(ratePerKg) || ratePerKg <= 0) {
    throw new ApiError(400, "Tarif per kilogram harus lebih besar dari 0.");
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
