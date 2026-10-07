import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CITIES = [
  "Jakarta",
  "Surabaya",
  "Bandung",
  "Medan",
  "Makassar",
  "Denpasar",
  "Semarang",
  "Palembang",
  "Balikpapan",
  "Yogyakarta",
];

// Distance/zone matrix factor relative to Jakarta base
const BASE_RATES: Record<string, Record<string, number>> = {
  Jakarta: {
    Jakarta: 9000,
    Surabaya: 19000,
    Bandung: 12000,
    Medan: 38000,
    Makassar: 45000,
    Denpasar: 25000,
    Semarang: 16000,
    Palembang: 22000,
    Balikpapan: 42000,
    Yogyakarta: 17000,
  },
  Surabaya: {
    Jakarta: 19000,
    Surabaya: 8000,
    Bandung: 20000,
    Medan: 44000,
    Makassar: 36000,
    Denpasar: 15000,
    Semarang: 12000,
    Palembang: 28000,
    Balikpapan: 39000,
    Yogyakarta: 13000,
  },
  Bandung: {
    Jakarta: 12000,
    Surabaya: 20000,
    Bandung: 8000,
    Medan: 40000,
    Makassar: 47000,
    Denpasar: 26000,
    Semarang: 17000,
    Palembang: 24000,
    Balikpapan: 44000,
    Yogyakarta: 18000,
  },
  Medan: {
    Jakarta: 38000,
    Surabaya: 44000,
    Bandung: 40000,
    Medan: 9000,
    Makassar: 58000,
    Denpasar: 48000,
    Semarang: 42000,
    Palembang: 26000,
    Balikpapan: 55000,
    Yogyakarta: 43000,
  },
  Makassar: {
    Jakarta: 45000,
    Surabaya: 36000,
    Bandung: 47000,
    Medan: 58000,
    Makassar: 9000,
    Denpasar: 32000,
    Semarang: 38000,
    Palembang: 50000,
    Balikpapan: 28000,
    Yogyakarta: 39000,
  },
  Denpasar: {
    Jakarta: 25000,
    Surabaya: 15000,
    Bandung: 26000,
    Medan: 48000,
    Makassar: 32000,
    Denpasar: 8000,
    Semarang: 18000,
    Palembang: 34000,
    Balikpapan: 37000,
    Yogyakarta: 16000,
  },
  Semarang: {
    Jakarta: 16000,
    Surabaya: 12000,
    Bandung: 17000,
    Medan: 42000,
    Makassar: 38000,
    Denpasar: 18000,
    Semarang: 8000,
    Palembang: 25000,
    Balikpapan: 40000,
    Yogyakarta: 10000,
  },
  Palembang: {
    Jakarta: 22000,
    Surabaya: 28000,
    Bandung: 24000,
    Medan: 26000,
    Makassar: 50000,
    Denpasar: 34000,
    Semarang: 25000,
    Palembang: 8000,
    Balikpapan: 48000,
    Yogyakarta: 26000,
  },
  Balikpapan: {
    Jakarta: 42000,
    Surabaya: 39000,
    Bandung: 44000,
    Medan: 55000,
    Makassar: 28000,
    Denpasar: 37000,
    Semarang: 40000,
    Palembang: 48000,
    Balikpapan: 9000,
    Yogyakarta: 41000,
  },
  Yogyakarta: {
    Jakarta: 17000,
    Surabaya: 13000,
    Bandung: 18000,
    Medan: 43000,
    Makassar: 39000,
    Denpasar: 16000,
    Semarang: 10000,
    Palembang: 26000,
    Balikpapan: 41000,
    Yogyakarta: 8000,
  },
};

async function main() {
  console.log("Seeding NusantaraExpress database...");

  // Clear existing
  await prisma.trackingEvent.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.priceRate.deleteMany();
  await prisma.user.deleteMany();

  // 1. Seed Users
  console.log("Seeding users...");
  await prisma.user.createMany({
    data: [
      {
        name: "Administrator Nusantara",
        email: "admin@nusantaraexpress.com",
        role: "ADMIN",
      },
      {
        name: "Agus Pratama (Kurir CGK)",
        email: "kurir.jakarta@nusantaraexpress.com",
        role: "COURIER",
      },
      {
        name: "Budi Santoso",
        email: "budi.santoso@gmail.com",
        role: "CUSTOMER",
      },
    ],
  });

  // 2. Seed Price Rates
  console.log("Seeding price rates for Indonesian cities...");
  const priceRatesData = [];

  for (const origin of CITIES) {
    for (const destination of CITIES) {
      const baseRate = BASE_RATES[origin]?.[destination] || 25000;
      const isSameCity = origin === destination;

      // REGULAR
      priceRatesData.push({
        originCity: origin,
        destinationCity: destination,
        serviceType: "REGULAR",
        ratePerKg: baseRate,
        estimatedDays: isSameCity ? "1 Hari" : "2-3 Hari",
      });

      // EXPRESS (1.5x base rate)
      priceRatesData.push({
        originCity: origin,
        destinationCity: destination,
        serviceType: "EXPRESS",
        ratePerKg: Math.round(baseRate * 1.5),
        estimatedDays: isSameCity ? "Same Day" : "1-2 Hari (Next Day)",
      });

      // CARGO (0.7x base rate, min 10kg)
      priceRatesData.push({
        originCity: origin,
        destinationCity: destination,
        serviceType: "CARGO",
        ratePerKg: Math.round(baseRate * 0.7),
        estimatedDays: isSameCity ? "1-2 Hari" : "3-5 Hari",
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
      senderName: "PT Sentosa Abadi (Hendra Wijaya)",
      senderPhone: "081299887766",
      senderCity: "Jakarta",
      senderAddress: "Kawasan Industri Daan Mogot KM 12 No. 8, Jakarta Barat",
      receiverName: "Ibu Dewi Lestari",
      receiverPhone: "081377665544",
      receiverCity: "Surabaya",
      receiverAddress: "Jl. Gubeng Kertajaya IX Raya No. 45, Gubeng, Surabaya",
      weight: 2.5,
      length: 25,
      width: 20,
      height: 15,
      chargeableWeight: 2.5,
      serviceType: "EXPRESS",
      totalCost: 71250,
      status: "OUT_FOR_DELIVERY",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    },
  });

  await prisma.trackingEvent.createMany({
    data: [
      {
        shipmentId: shipment1.id,
        status: "ORDER_CREATED",
        location: "Jakarta Drop Point Kebon Jeruk",
        description: "Pesanan pengiriman dibuat oleh pengirim melalui NusantaraExpress Customer Portal.",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        shipmentId: shipment1.id,
        status: "PICKED_UP",
        location: "Kawasan Daan Mogot, Jakarta Barat",
        description: "Paket telah di-pickup oleh Kurir NusantaraExpress (Bpk. Agus Pratama).",
        timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000),
      },
      {
        shipmentId: shipment1.id,
        status: "AT_ORIGIN_HUB",
        location: "Sorting Hub Jakarta Barat (CGK-01)",
        description: "Paket telah tiba di Hub Sortir Utama Jakarta dan telah melalui proses barcode scan timbangan.",
        timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000),
      },
      {
        shipmentId: shipment1.id,
        status: "IN_TRANSIT",
        location: "Cargo Hub Bandara Soekarno-Hatta (CGK)",
        description: "Paket dalam penerbangan kargo udara NEX-602 menuju Bandara Juanda Surabaya.",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
      {
        shipmentId: shipment1.id,
        status: "AT_DESTINATION_HUB",
        location: "Hub Distribusi Surabaya Timur (SUB-01)",
        description: "Paket tiba di Hub Sortir Surabaya dan dialokasikan ke Drop Point Gubeng.",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      },
      {
        shipmentId: shipment1.id,
        status: "OUT_FOR_DELIVERY",
        location: "Drop Point Gubeng Surabaya",
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
      senderCity: "Bandung",
      senderAddress: "Jl. Riau No. 88A, Citarum, Bandung Wetan, Bandung",
      receiverName: "Bpk. Faisal Tanjung",
      receiverPhone: "082166554433",
      receiverCity: "Medan",
      receiverAddress: "Jl. Brigjend Katamso No. 120, Medan Maimun, Medan",
      weight: 3.0,
      length: 30,
      width: 25,
      height: 12,
      chargeableWeight: 3.0,
      serviceType: "REGULAR",
      totalCost: 120000,
      status: "DELIVERED",
      createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000), // 3 days ago
    },
  });

  await prisma.trackingEvent.createMany({
    data: [
      {
        shipmentId: shipment2.id,
        status: "ORDER_CREATED",
        location: "Bandung Counter Dago",
        description: "Pesanan pengiriman teregistrasi di sistem NusantaraExpress.",
        timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000),
      },
      {
        shipmentId: shipment2.id,
        status: "PICKED_UP",
        location: "Drop Point Dago Bandung (BDO-02)",
        description: "Paket diserahkan oleh pengirim di loket operasional.",
        timestamp: new Date(Date.now() - 68 * 60 * 60 * 1000),
      },
      {
        shipmentId: shipment2.id,
        status: "AT_ORIGIN_HUB",
        location: "Hub Sortir Bandung Gedebage (BDO-01)",
        description: "Paket diproses dan dikelompokkan ke container pengiriman antar pulau.",
        timestamp: new Date(Date.now() - 55 * 60 * 60 * 1000),
      },
      {
        shipmentId: shipment2.id,
        status: "IN_TRANSIT",
        location: "Gateway Antar Pulau Cengkareng (CGK)",
        description: "Paket transit penerbangan kargo menuju Kota Medan.",
        timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000),
      },
      {
        shipmentId: shipment2.id,
        status: "AT_DESTINATION_HUB",
        location: "Hub Kualanamu Medan (KNO-01)",
        description: "Paket tiba di Gateway Kualanamu dan diteruskan ke Drop Point Medan Maimun.",
        timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000),
      },
      {
        shipmentId: shipment2.id,
        status: "OUT_FOR_DELIVERY",
        location: "Drop Point Medan Maimun",
        description: "Kurir (Doni Siregar) berangkat membawa paket menuju alamat tujuan.",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      },
      {
        shipmentId: shipment2.id,
        status: "DELIVERED",
        location: "Jl. Brigjend Katamso, Medan",
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
      senderCity: "Jakarta",
      senderAddress: "Jl. Pluit Raya No. 10B, Penjaringan, Jakarta Utara",
      receiverName: "Villa Sunset Serenity (I Wayan Sukarta)",
      receiverPhone: "081933445566",
      receiverCity: "Denpasar",
      receiverAddress: "Jl. Pantai Batu Bolong No. 88, Canggu, Kuta Utara, Badung / Denpasar",
      weight: 25.0,
      length: 60,
      width: 50,
      height: 40,
      chargeableWeight: 25.0, // volumetric = 60*50*40/6000 = 20kg < 25kg
      serviceType: "CARGO",
      totalCost: 437500, // 25kg * 17500
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
        description: "Order muatan kargo pallet telah dibuat dan dijadwalkan.",
        timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000),
      },
      {
        shipmentId: shipment3.id,
        status: "PICKED_UP",
        location: "Pergudangan Pluit, Jakarta Utara",
        description: "Armada Truk Fuso NEX (B 9812 UI) telah memuat paket kargo.",
        timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000),
      },
      {
        shipmentId: shipment3.id,
        status: "AT_ORIGIN_HUB",
        location: "Logistics Hub Cakung (CGK-09)",
        description: "Verifikasi dimensi, pallet wrapping, dan registrasi surat jalan muatan kargo.",
        timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000),
      },
      {
        shipmentId: shipment3.id,
        status: "IN_TRANSIT",
        location: "Lintas Tol Trans-Jawa KM 360",
        description: "Armada ekspedisi darat dalam perjalanan menuju Pelabuhan Ketapang Banyuwangi.",
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
