# NusantaraExpress 🚚📦

> **Sistem Informasi & Simulasi Logistik Ekspedisi Terpadu Indonesia**  
> Mata Kuliah: Rekayasa Perangkat Lunak (RPL) — Semester 3  
> Status Proyek: **MVP Lengkap, Lulus Uji Keamanan, Siap Demo & Deploy**  
> Hasil Unit Test: **28/28 Unit Tests PASSED (100%)**

---

## 🎥 Tautan Video Demonstrasi & Paket Demo

* **Tautan Video Demo Aplikasi (Google Drive):**  
  👉 [Tonton Video Demonstrasi NusantaraExpress](https://drive.google.com/file/d/198ZOUDHvKgN_Ppl6Wt-JfbVEGz91vxhj/view?usp=sharing)
* **Demo Live Lokal:**
  * **Frontend Web App:** `http://localhost:3000`
  * **Backend REST API:** `http://localhost:4000` (Healthcheck: `http://localhost:4000/api/health`)
* **Laporan Terkait:**
  * [Laporan Uji Keamanan (SECURITY_REPORT.md)](file:///c:/SEMESTER%203/RekayasaPerangkatLunak/SECURITY_REPORT.md)
  * [Checklist Fitur MVP (checklist_mvp.md)](file:///c:/SEMESTER%203/RekayasaPerangkatLunak/checklist_mvp.md)

---

## 📋 Pembagian Struktur Folder (Monorepo)

Aplikasi dibangun menggunakan pola arsitektur **Monorepo** yang memisahkan aplikasi antarmuka pengguna (Frontend Next.js) dengan penyedia logika bisnis serta basis data (Backend Express + Prisma):

```text
RekayasaPerangkatLunak/
├── frontend/                     # Aplikasi Web Klien (Next.js 15 App Router + Tailwind CSS)
│   ├── src/
│   │   ├── actions/             # Integrasi Server-Side Next.js dengan REST API
│   │   ├── app/                 # Halaman rute publik dan portal dashboard
│   │   ├── components/          # Komponen antarmuka (Label Thermal, Calculator, Scanner AWB)
│   │   └── lib/                 # Utilitas helper, format tanggal, & manipulasi style
│   ├── public/                  # Aset statis & logo
│   └── package.json
│
├── backend/                      # REST API Server (Express.js 5 + Prisma ORM + SQLite)
│   ├── src/
│   │   ├── routes/              # Routing REST API (/api/auth, /api/shipments, /api/rates)
│   │   ├── services/            # Logika bisnis inti (Rates, Shipment, Tracking, Courier)
│   │   ├── lib/                 # Prisma client, JWT, security middleware, & centralized error
│   │   ├── test/                # Unit test Vitest (17 MVP tests + 11 Security tests)
│   │   ├── app.ts               # Inisialisasi Express, Helmet, CORS, & Rate Limiter
│   │   └── server.ts            # Entrypoint HTTP listener
│   ├── prisma/
│   │   ├── schema.prisma        # Skema database relasional (User, Shipment, TrackingEvent, PriceRate)
│   │   ├── seed.ts              # Seeding akun demo, tarif rute Pontianak, dan sampel resi
│   │   └── dev.db               # Basis data lokal SQLite
│   └── package.json
│
├── .env.example                 # Template konfigurasi variabel lingkungan
├── package.json                 # Konfigurasi workspace monorepo & script sentral
└── README.md                    # Dokumentasi utama proyek
```

---

## ⚙️ Prasyarat Sistem (Prerequisites)

Sebelum melakukan instalasi, pastikan perangkat Anda telah terpasang:
* **Node.js**: Versi `20.x` LTS atau lebih baru
* **npm**: Versi `10.x` atau lebih baru
* **Git**: Versi `2.x` atau lebih baru

Verifikasi versi instalasi pada terminal:
```bash
node -v
npm -v
git -v
```

---

## 🚀 Panduan Instalasi Ulang (FRESH CLONE REPOSITORY)

Ikuti langkah-langkah berikut untuk mengkloning dan menginisialisasi repositori dari awal:

### 1. Kloning Repositori
Buka terminal dan jalankan:
```bash
git clone https://github.com/aldrychiayardi/RekayasaPerangkatLunak.git
cd RekayasaPerangkatLunak
```

### 2. Salin Konfigurasi Environment (`.env`)
Salin file konfigurasi lingkungan dari template default:

* **Windows (PowerShell):**
  ```powershell
  Copy-Item .env.example .env
  ```
* **Linux / macOS / Bash:**
  ```bash
  cp .env.example .env
  ```

Konfigurasi bawaan pada berkas `.env`:
```dotenv
DATABASE_URL="file:./dev.db"
API_PORT=4000
WEB_ORIGIN=http://localhost:3000
API_BASE_URL=http://localhost:4000
JWT_SECRET=super-secret-nusantara-express-jwt-token-key-2026
```

### 3. Pasang Seluruh Dependensi (Install Dependencies)
Jalankan perintah berikut di direktori root untuk memasang seluruh dependensi workspace (frontend dan backend):
```bash
npm install
```

### 4. Inisialisasi Basis Data Lokal (SQLite & Prisma)
Jalankan urutan perintah berikut untuk membentuk skema database dan mengisinya dengan data awal pengujian:
```bash
# Generate Prisma Client
npm run db:generate

# Sinkronisasi skema ke file database lokal SQLite (backend/prisma/dev.db)
npm run db:push

# Mengisi akun demo, tarif default rute Pontianak, dan sampel resi
npm run db:seed
```

> **Tips:** Jika ingin menambahkan koridor tarif rute baru tanpa menghapus data pesanan atau user yang telah dibuat, gunakan perintah: `npm run db:routes`.

---

## 💻 Menjalankan Aplikasi (Mode Development)

Untuk menjalankan aplikasi secara lokal dalam mode pengembangan, buka **dua terminal** pada direktori utama:

### Terminal 1 — Backend REST API
```bash
npm run dev:backend
```
* Server berjalan di: `http://localhost:4000`
* Tes koneksi backend: `http://localhost:4000/api/health` (menghasilkan status `{"status":"ok"}`)

### Terminal 2 — Frontend Next.js
```bash
npm run dev
```
* Antarmuka aplikasi dapat diakses melalui browser di: `http://localhost:3000`

---

## 🔑 Paket Demo & Kredensial Pengujian (Role Access Matrix)

Aplikasi telah dilengkapi dengan fitur **Quick Demo Login** pada halaman login (`/login`) atau dapat dimasukkan secara manual:

| Peran (Role) | Alamat Email | Kata Sandi | Deskripsi Hak Akses Utama |
| :--- | :--- | :--- | :--- |
| **Owner** | `owner@nusantara.com` | `Owner123!` | Akses metrik finansial, omset logistik, dan hak penuh memodifikasi tarif/estimasi rute. |
| **Admin Operasional** | `admin@nusantara.com` | `Admin123!` | Memantau seluruh operasional kiriman, filter status paket, mode tinjau (*read-only*) tarif. |
| **Kurir** | `kurir@nusantara.com` | `Kurir123!` | Scanner nomor AWB dan pembaruan riwayat status checkpoint secara berurutan. |
| **Pelanggan (Customer)** | `budi@gmail.com` | `User123!` | Membuat pesanan pengiriman, kalkulator ongkir live, riwayat kiriman, cetak label thermal waybill. |

*Pengunjung umum juga dapat mendaftarkan akun baru secara mandiri melalui menu **Registrasi** (`/register`).*

### Contoh Nomor Resi (AWB) Siap Lacak
Nomor AWB sampel bawaan yang dapat langsung dilacak pada menu **Lacak Resi** (`/track`):
* `NEX-882910` : Pontianak $\rightarrow$ Seluas (Reguler, Status: `OUT_FOR_DELIVERY`)
* `NEX-554201` : Pontianak $\rightarrow$ Kubu Raya (Reguler, Status: `DELIVERED` - Selesai)
* `NEX-109283` : Pontianak $\rightarrow$ Anjongan (Kendaraan, Status: `IN_TRANSIT` - Dalam Perjalanan)
* Resi pesanan baru yang dibuat mandiri oleh akun Pelanggan (`NEX-<tahun><kode-acak>`).

---

## 🧪 Eksekusi Unit Test & Quality Assurance

Pengujian unit test menggunakan **Vitest** pada backend yang memvalidasi logika kalkulasi tarif, transaksi pembuatan kiriman, pelacakan resi, alur checkpoint kurir, serta otorisasi keamanan:

```bash
# Menjalankan seluruh 28 unit tests dari root
npm test

# Menjalankan pengecekan kualitas kode & typecheck
npm run lint
```

**Status Pengujian Terverifikasi:**
* **Unit Tests:** `28/28 PASSED (100%)`
* **Linting:** `0 Errors, 0 Warnings`

---

## 🏗️ Kompilasi & Menjalankan Mode Produksi (Build & Run)

Untuk melakukan *production build* dan menjalankannya secara lokal:

```bash
# 1. Kompilasi Next.js frontend dan TypeScript backend
npm run build

# 2. Menjalankan server frontend produksi
npm start

# 3. Menjalankan server backend produksi (di terminal terpisah)
npm run start:backend
```

---

## 🌐 Panduan Deployment ke Cloud (Deploy Guide)

Arsitektur monorepo NusantaraExpress sangat fleksibel untuk dideploy ke berbagai penyedia PaaS / Cloud:

### Opsi A: Deployment Frontend (Next.js) ke Vercel
1. Hubungkan repositori GitHub ke akun [Vercel](https://vercel.com).
2. Tentukan konfigurasi project:
   * **Root Directory:** `frontend`
   * **Framework Preset:** `Next.js`
   * **Build Command:** `npm run build`
   * **Output Directory:** `.next`
3. Tambahkan **Environment Variable**:
   * `API_BASE_URL` : URL backend produksi (misal `https://api-nusantara.up.railway.app`).
4. Klik **Deploy**.

### Opsi B: Deployment Backend (Express + SQLite) ke Railway / Render
1. Hubungkan repositori ke [Railway](https://railway.app) atau [Render](https://render.com).
2. Konfigurasi service backend:
   * **Root Directory:** `backend`
   * **Build Command:** `npm run build && npm run db:push`
   * **Start Command:** `npm run start`
3. Konfigurasi **Environment Variables**:
   * `DATABASE_URL` : `file:./dev.db` (atau pasang persistent volume disk jika menggunakan SQLite di container).
   * `API_PORT` : `4000` (atau sesuaikan dengan `$PORT` platform).
   * `WEB_ORIGIN` : Domain frontend Vercel (misal `https://nusantara-express.vercel.app`).
   * `JWT_SECRET` : Kunci rahasia kriptografi acak yang kuat.
4. Klik **Deploy**.

---

## 📑 Dokumentasi Endpoint REST API

Seluruh endpoint backend menggunakan prefiks `/api`:

| Method | Endpoint | Akses / Role | Deskripsi Fungsi |
| :---: | :--- | :---: | :--- |
| `GET` | `/api/health` | Publik | Memeriksa ketersediaan dan status server API |
| `POST`| `/api/auth/register` | Publik | Mendaftarkan akun pelanggan baru |
| `POST`| `/api/auth/login` | Publik | Login pengguna & penerbitan token JWT |
| `GET` | `/api/rates` | Publik | Mengambil daftar tarif rute Pontianak |
| `POST`| `/api/rates/calculate` | Publik | Kalkulator estimasi tarif berdasarkan berat & volume |
| `PUT` | `/api/rates/:id` | **Owner Only** | Mengubah tarif dasar rute dan estimasi hari pengiriman |
| `GET` | `/api/shipments` | Authenticated | Mengambil riwayat daftar pengiriman |
| `POST`| `/api/shipments` | Authenticated | Membuat order kiriman baru & generate nomor AWB |
| `GET` | `/api/shipments/:awb` | Publik | Detail lengkap resi dan histori riwayat checkpoint |
| `POST`| `/api/shipments/:awb/events`| **Kurir / Admin**| Memperbarui checkpoint dan status paket secara sekuensial |
| `GET` | `/api/admin/metrics` | **Owner / Admin**| Mengambil ringkasan omset dan metrik operasional logistik |

---

## 📜 Perintah Workspace (Command Cheat Sheet)

| Perintah | Deskripsi |
| :--- | :--- |
| `npm run dev` | Menjalankan frontend Next.js (port 3000) |
| `npm run dev:backend` | Menjalankan backend Express dengan tsx watch (port 4000) |
| `npm test` | Menjalankan seluruh 28 unit test dari root |
| `npm run lint` | Menjalankan ESLint & validasi tipe TypeScript |
| `npm run build` | Melakukan build kompilasi produksi frontend & backend |
| `npm start` | Menjalankan frontend hasil kompilasi produksi |
| `npm run start:backend` | Menjalankan backend hasil kompilasi produksi |
| `npm run db:generate` | Menghasilkan Prisma Client |
| `npm run db:push` | Menerapkan skema Prisma ke database SQLite |
| `npm run db:seed` | Inisialisasi ulang basis data dan data demonstrasi |
| `npm run db:routes` | Menambahkan rute layanan Pontianak tanpa reset data pesanan |
