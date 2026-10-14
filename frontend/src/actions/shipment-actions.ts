"use server";

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

export interface ShipmentRecord {
  id: string;
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
  status: string;
  createdAt: string;
  updatedAt: string;
  events: TrackingEventRecord[];
}

export interface TrackingEventRecord {
  id: string;
  shipmentId: string;
  status: string;
  location: string;
  description: string;
  timestamp: string;
  shipment?: {
    trackingNumber: string;
    senderCity: string;
    receiverCity: string;
    serviceType: string;
  } | null;
}

export interface RateRecord {
  id: string;
  originCity: string;
  destinationCity: string;
  serviceType: string;
  ratePerKg: number;
  estimatedDays: string;
}

export interface AdminMetrics {
  totalShipments: number;
  totalRevenue: number;
  activeInTransit: number;
  deliveredCount: number;
  deliveryPercentage: number;
}

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

class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

async function requestApi<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = (process.env.API_BASE_URL ?? "http://localhost:4000").replace(/\/+$/, "");
  let response: Response;

  try {
    response = await fetch(`${baseUrl}/api${path}`, {
      ...init,
      cache: "no-store",
      headers: {
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers
      }
    });
  } catch {
    throw new Error("Server API ekspedisi tidak dapat dihubungi. Pastikan backend sudah berjalan.");
  }

  const responseText = await response.text();
  let responseData: unknown;
  try {
    responseData = responseText ? JSON.parse(responseText) : null;
  } catch {
    throw new Error("Backend mengirim respons yang tidak valid.");
  }

  if (!response.ok) {
    const message =
      typeof responseData === "object" &&
      responseData !== null &&
      "message" in responseData &&
      typeof responseData.message === "string"
        ? responseData.message
        : `Permintaan API gagal (HTTP ${response.status}).`;
    throw new ApiRequestError(message, response.status);
  }

  return responseData as T;
}

export async function calculateShippingRates(
  originCity: string,
  destinationCity: string,
  weight: number,
  length: number,
  width: number,
  height: number
): Promise<RateCalculationResult> {
  return requestApi<RateCalculationResult>("/rates/calculate", {
    method: "POST",
    body: JSON.stringify({ originCity, destinationCity, weight, length, width, height })
  });
}

export async function getShipmentByAwb(awb: string): Promise<ShipmentRecord | null> {
  if (!awb.trim()) {
    return null;
  }
  try {
    return await requestApi<ShipmentRecord>(`/shipments/${encodeURIComponent(awb.trim())}`);
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function createShipmentOrder(input: CreateShipmentInput): Promise<ShipmentRecord> {
  const shipment = await requestApi<ShipmentRecord>("/shipments", {
    method: "POST",
    body: JSON.stringify(input)
  });
  revalidatePath("/dashboard/customer");
  revalidatePath("/dashboard/admin");
  revalidatePath(`/track/${shipment.trackingNumber}`);
  return shipment;
}

export async function addTrackingEvent(
  trackingNumber: string,
  status: string,
  location: string,
  description: string
): Promise<TrackingEventRecord> {
  const event = await requestApi<TrackingEventRecord>(
    `/shipments/${encodeURIComponent(trackingNumber)}/events`,
    {
      method: "POST",
      body: JSON.stringify({ status, location, description })
    }
  );
  revalidatePath(`/track/${trackingNumber}`);
  revalidatePath("/dashboard/courier");
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/customer");
  return event;
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  return requestApi<AdminMetrics>("/admin/metrics");
}

export async function getAllShipments(
  query?: string,
  status?: string,
  service?: string
): Promise<ShipmentRecord[]> {
  const parameters = new URLSearchParams();
  if (query) parameters.set("query", query);
  if (status) parameters.set("status", status);
  if (service) parameters.set("service", service);
  const search = parameters.size ? `?${parameters.toString()}` : "";
  return requestApi<ShipmentRecord[]>(`/shipments${search}`);
}

export async function getRecentTrackingEvents(limit = 10): Promise<TrackingEventRecord[]> {
  return requestApi<TrackingEventRecord[]>(`/tracking-events?limit=${encodeURIComponent(limit)}`);
}

export async function getAllRates(origin?: string, destination?: string): Promise<RateRecord[]> {
  const parameters = new URLSearchParams();
  if (origin) parameters.set("origin", origin);
  if (destination) parameters.set("destination", destination);
  const search = parameters.size ? `?${parameters.toString()}` : "";
  return requestApi<RateRecord[]>(`/rates${search}`);
}

export async function updateRate(
  id: string,
  ratePerKg: number,
  estimatedDays: string
): Promise<RateRecord> {
  const updatedRate = await requestApi<RateRecord>(`/rates/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify({ ratePerKg, estimatedDays })
  });
  revalidatePath("/rates");
  revalidatePath("/dashboard/admin");
  return updatedRate;
}
