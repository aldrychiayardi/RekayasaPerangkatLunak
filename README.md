# 🚚 NusantaraExpress: Sistem Informasi Manajemen Ekspedisi & Logistik Terpadu

> **Tugas / Proyek Mata Kuliah:** Rekayasa Perangkat Lunak (Semester 3)  
> **Aplikasi:** NusantaraExpress Web Application  
> **Tech Stack:** Next.js 15 (App Router, TypeScript), Tailwind CSS, Prisma ORM (SQLite), jsbarcode, date-fns  

---

## 1. Penjabaran Judul yang Diambil

### **Judul Lengkap:**
> **"NusantaraExpress: Sistem Informasi Manajemen Ekspedisi & Logistik Terpadu Berbasis Web dengan Pelacakan Multi-Modal Real-Time dan Standarisasi Cetak Label Thermal 100mm × 150mm"**

### **Penjabaran Istilah / Konsep Judul:**
1. **NusantaraExpress**:  
   Identitas sistem logistik yang dirancang dengan jangkauan geografis kepulauan Indonesia (dari Sabang sampai Merauke), mengintegrasikan rute multi-modal (darat, laut, dan kargo udara).
2. **Sistem Informasi Manajemen Ekspedisi & Logistik Terpadu**:  
   Perangkat lunak yang mengintegrasikan seluruh siklus hidup pengiriman barang dalam satu pintu: pembuatan order oleh pengirim, penjemputan barang, pemindaian di sorting hub & gateway bandara, pengantaran oleh kurir, hingga analitik operasional manajemen.
3. **Pelacakan Multi-Modal Real-Time (Live Tracking)**:  
   Mekanisme pelacakan visual berbasis nomor resi (*Air Waybill / AWB*) yang menampilkan *milestone stepper* (tahapan perjalanan) dan lini masa vertikal kronologis dengan stempel waktu Indonesia (WIB/WITA/WIT), lokasi pos sortir, serta catatan petugas.
4. **Standarisasi Cetak Label Thermal (100mm × 150mm)**:  
   Fitur pembuatan Surat Jalan / Waybill standar industri ekspedisi global yang siap dicetak langsung menggunakan printer thermal 4×6 inci, dilengkapi barcode scannable (Code128), QR Code verifikasi, dan perincian berat volumetrik.

---

## 2. Big Picture Permasalahan

Indonesia merupakan negara kepulauan terbesar di dunia dengan lebih dari 17.000 pulau. Pertumbuhan pesat sektor perdagangan digital (*E-commerce*) dan UMKM lokal menuntut sistem rantai pasok (*supply chain*) yang tangguh, cepat, dan transparan. Namun, di lapangan masih banyak ditemukan kendala operasional mendasar:

1. **Ketidaksesuaian & Ketidakjelasan Perhitungan Ongkos Kirim (Volumetrik vs. Berat Asli)**:  
   Banyak pengirim pemula atau pelaku UMKM salah menghitung biaya barang yang berukuran besar tetapi ringan. Kurangnya transparansi perhitungan matematis rumus volumetrik $((P \times L \times T) / 6000)$ sering kali memicu sengketa selisih biaya antara pelanggan dan ekspedisi di gerai drop-off.
2. **Titik Buta (*Blind Spot*) Informasi Status Paket**:  
   Pelanggan sering mengalami kecemasan akibat status resi yang lambat diperbarui (*stale tracking*), informasi checkpoint yang rancu, atau ketiadaan catatan alasan ketika paket gagal terkirim.
3. **Ketiadaan Standarisasi Format Surat Jalan / Label Pengiriman**:  
   Banyak pengirim skala kecil masih menuliskan alamat secara manual dengan pulpen pada kardus paket. Hal ini rawan rusak terkena air, sulit dibaca kurir, tidak memiliki barcode untuk dipindai scanner hub, dan memperlambat alur pemilahan barang di ban berjalan (*sorting conveyor*).
4. **Disiplin Pencatatan Checkpoint oleh Petugas Lapangan**:  
   Diperlukan sistem pencatatan checkpoint yang ringkas dan cepat digunakan oleh kurir serta operator hub gudang tanpa alur input yang berbelit-belit.

---

## 3. Kenapa Mengambil Judul Ini (Alasan & Urgensi)

1. **Relevansi Nyata di Industri Rekayasa Perangkat Lunak**:  
   Sistem logistik dan ekspedisi adalah studi kasus ideal untuk mempraktikkan konsep rekayasa perangkat lunak modern: pemodelan relasi database transaksional (Shipment, TrackingEvent, PriceRate), algoritma deterministik (perhitungan volumetrik dan matriks tarif), manajemen status (*state machine*), hingga kontrol akses multi-peran (Pelanggan, Kurir/Hub, dan Administrator).
2. **Kebutuhan Digitalisasi Ekosistem UMKM Indonesia**:  
   Dengan menyediakan portal mandiri yang memfasilitasi pembuatan order instan, pembuatan AWB otomatis berformat standar `NEX-[TAHUN][RANDOM_ALPHANUMERIC]`, serta cetak label thermal scannable, proses bisnis pengiriman barang dapat berjalan jauh lebih profesional dan efisien.
3. **Transparansi Tarif & Kecepatan Layanan**:  
   Sistem ini mengkategorisasikan layanan secara cerdas (**NEX REGULAR**, **NEX EXPRESS**, dan **NEX CARGO** dengan ambang batas minimum berat kargo) sehingga pengguna mendapatkan pilihan tarif yang paling optimal sesuai kebutuhan anggaran dan urgensi waktu mereka.

---

## 4. Manfaat Proyek

### **A. Bagi Pengembang (Mahasiswa / Pembuat Perangkat Lunak):**
- **Penguasaan Arsitektur Modern Web Full-Stack**: Mengimplementasikan Next.js 15 App Router dengan TypeScript strict mode, Server Components, dan Server Actions yang aman dan berkinerja tinggi.
- **Penerapan ORM & Basis Data Relasional**: Menguasai pemodelan skema relasi one-to-many antara pengiriman (*Shipment*) dan riwayat aktivitas (*TrackingEvent*), serta pengindeksan matriks tarif (*PriceRate*) menggunakan Prisma ORM dan SQLite.
- **Penerapan Rekayasa UI/UX Standar Industri**: Mendesain antarmuka responsif dengan Tailwind CSS, komponen visual timeline status, serta penanganan layout cetak `@media print` khusus ukuran kertas 100mm × 150mm.
- **Pemahaman Algoritma & Standarisasi Logistik**: Mempelajari standarisasi internasional perhitungan volumetrik IATA dan pembangkitan barcode Code128 secara client-side.

### **B. Bagi Orang Lain & Pengguna Sistem:**

1. **Bagi Pelanggan & Pelaku UMKM:**
   - **Kalkulator Tarif Transparan**: Mengetahui estimasi biaya pasti sebelum mengirim paket dengan perbandingan layanan Express, Regular, dan Kargo.
   - **Cetak Surat Jalan Mandiri (Self-Service)**: Menghemat waktu dengan mencetak label thermal 100×150mm yang siap ditempel ke paket, lengkap dengan barcode Code128 dan QR Code lacak.
   - **Kepastian Pelacakan**: Live visual timeline memudahkan pemantauan keberadaan paket secara akurat 24/7.

2. **Bagi Kurir & Petugas Hub Operasional:**
   - **Simulator Scanner & Pembaharuan Cepat**: Mempercepat pencatatan status checkpoint paket saat barang tiba di hub, transit di bandara, atau dibawa oleh kurir pengantar.
   - **Template Keterangan Baku**: Memudahkan pencatatan alasan kendala pengiriman atau nama penerima paket tanpa perlu mengetik panjang.

3. **Bagi Manajemen Ekspedisi / Administrator:**
   - **Visibilitas Metrik Logistik Real-Time**: Memantau Total Pengiriman, Akumulasi Pendapatan (*Revenue*), Paket Aktif dalam Perjalanan, dan Tingkat Keberhasilan (*Delivery Rate*).
   - **Pengendalian Matriks Tarif Antar Kota**: Fleksibilitas memperbarui tarif per-kg dan estimasi durasi antar kota besar di Indonesia secara terpusat.

---

## 5. Fitur Utama Sistem

| Modul | Fitur | Deskripsi |
| :--- | :--- | :--- |
| **Publik** | **Cek Resi (Live Tracking)** | Masukkan nomor AWB (tersedia sampel: `NEX-882910`, `NEX-554201`, `NEX-109283`) untuk melihat status dan timeline langsung. |
| **Publik** | **Cek Ongkir (Kalkulator Tarif)** | Menghitung perbandingan berat asli vs volumetrik $(P \times L \times T / 6000)$ dan kalkulasi otomatis tarif REGULAR, EXPRESS, dan CARGO. |
| **Pelacakan** | **Timeline Kronologis & Stepper** | Visual stepper 6 tahap: Pesanan Dibuat $\rightarrow$ Pickup $\rightarrow$ Hub Asal $\rightarrow$ Transit $\rightarrow$ Diantar $\rightarrow$ Terkirim. |
| **Surat Jalan** | **Thermal Shipping Label** | Label ukuran standar 100mm × 150mm dengan barcode Code128, kode rute hub (`CGK ➔ SUB`), alamat penerima tebal, dan QR code lacak. |
| **Customer Portal** | **Pendaftaran Pengiriman Baru** | Formulir order pengiriman dengan kalkulasi live biaya, generate otomatis AWB, dan pop-up label thermal siap cetak. |
| **Courier Portal** | **Scanner & Checkpoint Logger** | Simulator pemindaian AWB, pembaharuan status operasional, pemilihan lokasi hub, serta rekaman live feed aktivitas. |
| **Admin Portal** | **Dashboard Analitik & Master Data** | Kartu metrik KPI logistik, pencarian/filter master paket se-Indonesia, dan antarmuka edit matriks tarif ongkir antar kota. |

---

## 6. Struktur Basis Data (Prisma ORM)

Skema database tersimpan di `prisma/schema.prisma` menggunakan SQLite (`dev.db`):
- **`User`**: Data pengguna untuk testing (Admin, Courier, Customer).
- **`Shipment`**: Data paket (no resi unik, detail pengirim/penerima, dimensi fisik, berat volumetrik, berat tagihan, jenis layanan, total ongkir, status terkini).
- **`TrackingEvent`**: Riwayat kronologis setiap pergerakan paket di hub atau kurir (shipmentId, status, lokasi checkpoint, keterangan, stempel waktu).
- **`PriceRate`**: Matriks tarif per kilogram antar kota di Indonesia (Origin, Destination, ServiceType, RatePerKg, EstimatedDays).

---

## 7. Cara Menjalankan Aplikasi Secara Lokal

### **Prasyarat:**
- Node.js versi 18+ (direkomendasikan Node.js v20 / v22 / v24)
- npm / yarn / pnpm

### **Langkah Instalasi & Eksekusi:**

1. **Clone atau Masuk ke Direktori Proyek:**
   ```bash
   cd "c:\SEMESTER 3\RekayasaPerangkatLunak"
   ```

2. **Instal Dependensi:**
   ```bash
   npm install
   ```

3. **Sinkronisasi Database SQLite & Prisma:**
   ```bash
   npx prisma db push
   ```

4. **Jalankan Seeding Data Awal (Matriks Tarif 10 Kota & 3 Resi Sampel):**
   ```bash
   npx prisma db seed
   ```

5. **Jalankan Server Pengembang (Development Server):**
   ```bash
   npm run dev
   ```

6. **Buka di Browser:**
   Akses **[http://localhost:3000](http://localhost:3000)**

---

## 8. Data Uji Coba (Demo Resi & Rute)

Aplikasi telah dilengkapi dengan data *pre-seeded* untuk demonstrasi langsung:

| Nomor AWB | Rute Asal $\rightarrow$ Tujuan | Layanan | Status Terkini | Skenario Uji |
| :--- | :--- | :--- | :--- | :--- |
| **`NEX-882910`** | Jakarta $\rightarrow$ Surabaya | EXPRESS | `OUT_FOR_DELIVERY` (Sedang Diantar) | Kurir sedang mengantar paket ke alamat penerima di Surabaya. |
| **`NEX-554201`** | Bandung $\rightarrow$ Medan | REGULAR | `DELIVERED` (Terkirim) | Paket telah diterima oleh penerima langsung lengkap dengan riwayat 7 checkpoint. |
| **`NEX-109283`** | Jakarta $\rightarrow$ Denpasar | CARGO | `IN_TRANSIT` (Dalam Perjalanan) | Pengiriman kargo pallet berat 25 Kg dalam perjalanan tol Trans-Jawa. |

---

## 9. URL Rute Halaman Aplikasi

- **Beranda & Alat Cepat**: `http://localhost:3000/`
- **Pencarian Lacak Resi**: `http://localhost:3000/track`
- **Detail Lacak Resi Sampel**: `http://localhost:3000/track/NEX-882910`
- **Kalkulator & Matriks Ongkir**: `http://localhost:3000/rates`
- **Portal Pelanggan (Customer)**: `http://localhost:3000/dashboard/customer`
- **Portal Kurir & Hub (Scanner)**: `http://localhost:3000/dashboard/courier`
- **Dashboard Admin & Analitik**: `http://localhost:3000/dashboard/admin`