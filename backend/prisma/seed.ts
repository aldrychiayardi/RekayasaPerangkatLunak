import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DESTINATION_CITIES, ORIGIN_CITY } from "../src/lib/locations.js";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding NusantaraExpress database...");

  // Clear existing
  await prisma.trackingEvent.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.priceRate.deleteMany();
  await prisma.user.deleteMany();

  // 1. Seed Users
  console.log("Seeding users with hashed passwords...");
  const ownerPassword = await bcrypt.hash("Owner123!", 10);
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const courierPassword = await bcrypt.hash("Kurir123!", 10);
  const userPassword = await bcrypt.hash("User123!", 10);

  const customerUser = await prisma.user.create({
    data: {
      name: "Budi Santoso",
      email: "budi@gmail.com",
      password: userPassword,
      role: "CUSTOMER",
    },
  });

  await prisma.user.createMany({
    data: [
      {
        name: "Hendra Pratama (Owner)",
        email: "owner@nusantara.com",
        password: ownerPassword,
        role: "OWNER",
      },
      {
        name: "Admin Operasional Logistik",
        email: "admin@nusantara.com",
        password: adminPassword,
        role: "ADMIN",
      },
      {
        name: "Agus Pratama (Kurir CGK)",
        email: "kurir@nusantara.com",
        password: courierPassword,
        role: "COURIER",
      },
    ],
  });

  // 2. Seed Price Rates
  console.log("Seeding Pontianak corridor routes with default rates...");
  const priceRatesData = [];

  for (const destination of DESTINATION_CITIES) {
    for (const serviceType of ["REGULAR", "VEHICLE"]) {
      priceRatesData.push({
        originCity: ORIGIN_CITY,
        destinationCity: destination,
        serviceType,
        ratePerKg: serviceType === "REGULAR" ? 12000 : 200000,
        estimatedDays: serviceType === "REGULAR" ? "2-3 Hari" : "Sesuai jadwal",
      });
    }
  }

  await prisma.priceRate.createMany({
    data: priceRatesData,
  });

  console.log(`Created ${priceRatesData.length} rate matrix routes.`);

  // 3. Seed Required Shipments
  console.log("Seeding sample shipments with tracking events...");

  // Shipment 1: NEX-882910 (Status: OUT_FOR_DELIVERY)
  const shipment1 = await prisma.shipment.create({
    data: {
      trackingNumber: "NEX-882910",
      userId: customerUser.id,
      senderName: "PT Sentosa Abadi (Hendra Wijaya)",
      senderPhone: "081299887766",
      senderCity: "Pontianak",
      senderAddress: "Gerai NusantaraExpress, Pontianak, Kalimantan Barat",
      receiverName: "Ibu Dewi Lestari",
      receiverPhone: "081377665544",
      receiverCity: "Seluas",
      receiverAddress: "Alamat penerima, Seluas, Kabupaten Bengkayang",
      weight: 2.5,
      length: 25,
      width: 20,
      height: 15,
      chargeableWeight: 2.5,
      serviceType: "REGULAR",
      totalCost: 30000,
      status: "OUT_FOR_DELIVERY",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    },
  });

  await prisma.trackingEvent.createMany({
    data: [
      {
        shipmentId: shipment1.id,
        status: "ORDER_CREATED",
        location: "Gerai Pontianak",
        description: "Pesanan pengiriman dibuat oleh pengirim melalui NusantaraExpress Customer Portal.",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        shipmentId: shipment1.id,
        status: "PICKED_UP",
        location: "Pontianak, Kalimantan Barat",
        description: "Paket telah di-pickup oleh Kurir NusantaraExpress (Bpk. Agus Pratama).",
        timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000),
      },
      {
        shipmentId: shipment1.id,
        status: "AT_ORIGIN_HUB",
        location: "Hub Operasional Pontianak (PNK-01)",
        description: "Paket telah tiba di hub Pontianak dan selesai diproses.",
        timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000),
      },
      {
        shipmentId: shipment1.id,
        status: "IN_TRANSIT",
        location: "Jalur Pontianak menuju Anjongan",
        description: "Paket dalam perjalanan melalui rute Anjongan menuju Seluas.",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
      {
        shipmentId: shipment1.id,
        status: "AT_DESTINATION_HUB",
        location: "Anjongan — Kabupaten Mempawah",
        description: "Paket melewati Anjongan dan diteruskan menuju Kabupaten Bengkayang.",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      },
      {
        shipmentId: shipment1.id,
        status: "OUT_FOR_DELIVERY",
        location: "Seluas — Kabupaten Bengkayang",
        description: "Kurir NEX (Rian Saputra) sedang mengantar paket ke alamat penerima.",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
    ],
  });

  // Shipment 2: NEX-554201 (Status: DELIVERED)
  const shipment2 = await prisma.shipment.create({
    data: {
      trackingNumber: "NEX-554201",
      senderName: "Fashion Nusantara Store (Siti Rahma)",
      senderPhone: "081122334455",
      senderCity: "Pontianak",
      senderAddress: "Gerai NusantaraExpress, Pontianak, Kalimantan Barat",
      receiverName: "Bpk. Faisal Tanjung",
      receiverPhone: "082166554433",
      receiverCity: "Kubu Raya",
      receiverAddress: "Alamat penerima, Kabupaten Kubu Raya",
      weight: 3.0,
      length: 30,
      width: 25,
      height: 12,
      chargeableWeight: 3.0,
      serviceType: "REGULAR",
      totalCost: 36000,
      status: "DELIVERED",
      createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000), // 3 days ago
    },
  });

  await prisma.trackingEvent.createMany({
    data: [
      {
        shipmentId: shipment2.id,
        status: "ORDER_CREATED",
        location: "Gerai Pontianak",
        description: "Pesanan pengiriman teregistrasi di sistem NusantaraExpress.",
        timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000),
      },
      {
        shipmentId: shipment2.id,
        status: "PICKED_UP",
        location: "Pontianak, Kalimantan Barat",
        description: "Paket diserahkan oleh pengirim di loket operasional.",
        timestamp: new Date(Date.now() - 68 * 60 * 60 * 1000),
      },
      {
        shipmentId: shipment2.id,
        status: "AT_ORIGIN_HUB",
        location: "Hub Operasional Pontianak (PNK-01)",
        description: "Paket diproses di hub Pontianak untuk rute lokal.",
        timestamp: new Date(Date.now() - 55 * 60 * 60 * 1000),
      },
      {
        shipmentId: shipment2.id,
        status: "IN_TRANSIT",
        location: "Kabupaten Kubu Raya",
        description: "Paket diteruskan menuju alamat penerima di Kabupaten Kubu Raya.",
        timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000),
      },
      {
        shipmentId: shipment2.id,
        status: "AT_DESTINATION_HUB",
        location: "Kabupaten Kubu Raya",
        description: "Paket tiba di wilayah tujuan dan masuk proses pengantaran.",
        timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000),
      },
      {
        shipmentId: shipment2.id,
        status: "OUT_FOR_DELIVERY",
        location: "Kabupaten Kubu Raya",
        description: "Kurir (Doni Siregar) berangkat membawa paket menuju alamat tujuan.",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      },
      {
        shipmentId: shipment2.id,
        status: "DELIVERED",
        location: "Kabupaten Kubu Raya",
        description: "Paket telah diterima dengan baik oleh Bpk. Faisal Tanjung (Penerima Langsung). Tanda tangan tersimpan.",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      },
    ],
  });

  // Shipment 3: NEX-109283 (Status: IN_TRANSIT)
  const shipment3 = await prisma.shipment.create({
    data: {
      trackingNumber: "NEX-109283",
      senderName: "Bali Art & Decor Warehouse",
      senderPhone: "081700112233",
      senderCity: "Pontianak",
      senderAddress: "Gerai NusantaraExpress, Pontianak, Kalimantan Barat",
      receiverName: "Villa Sunset Serenity (I Wayan Sukarta)",
      receiverPhone: "081933445566",
      receiverCity: "Anjongan",
      receiverAddress: "Alamat penerima, Anjongan, Kabupaten Mempawah",
      weight: 25.0,
      length: 60,
      width: 50,
      height: 40,
      chargeableWeight: 25.0, // volumetric = 60*50*40/6000 = 20kg < 25kg
      serviceType: "VEHICLE",
      totalCost: 200000,
      status: "IN_TRANSIT",
      createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000),
    },
  });

  await prisma.trackingEvent.createMany({
    data: [
      {
        shipmentId: shipment3.id,
        status: "ORDER_CREATED",
        location: "Portal Ekspedisi Nusantara",
        description: "Pesanan pengiriman kendaraan telah dibuat dan dijadwalkan.",
        timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000),
      },
      {
        shipmentId: shipment3.id,
        status: "PICKED_UP",
        location: "Pontianak, Kalimantan Barat",
        description: "Kendaraan telah dimuat ke armada pengiriman.",
        timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000),
      },
      {
        shipmentId: shipment3.id,
        status: "AT_ORIGIN_HUB",
        location: "Hub Operasional Pontianak (PNK-01)",
        description: "Verifikasi kendaraan dan registrasi surat jalan pengiriman.",
        timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000),
      },
      {
        shipmentId: shipment3.id,
        status: "IN_TRANSIT",
        location: "Anjongan — Kabupaten Mempawah",
        description: "Paket dalam perjalanan pada rute Pontianak menuju Anjongan.",
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      },
    ],
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
