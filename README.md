# NusantaraExpress 🚚

Sistem informasi ekspedisi dan logistik untuk rute **Pontianak → wilayah rute Seluas** (Kalimantan Barat).
Proyek mata kuliah **Rekayasa Perangkat Lunak (RPL)**, Semester 3.

| | |
|---|---|
| **Aplikasi Live** | https://rekayasaperangkatlunak-x5bh.vercel.app |
| **API (health check)** | https://rekayasaperangkatlunak-production.up.railway.app/api/health |
| **Video demo** | [Google Drive](https://drive.google.com/file/d/198ZOUDHvKgN_Ppl6Wt-JfbVEGz91vxhj/view?usp=sharing) |
| **Unit test** | 200 test, semua lulus |
| **Versi rilis** | `V1.1` |

---

## Daftar Isi

1. [Fitur Utama](#fitur-utama)
2. [Teknologi](#teknologi)
3. [Struktur Proyek](#struktur-proyek)
4. [Menjalankan Secara Lokal](#menjalankan-secara-lokal)
5. [Akun Demo & Resi Contoh](#akun-demo--resi-contoh)
6. [Unit Test & Quality Check](#unit-test--quality-check)
7. [Branching & CI/CD](#branching--cicd)
8. [Deployment](#deployment)
9. [Endpoint REST API](#endpoint-rest-api)
10. [Daftar Perintah](#daftar-perintah)
11. [Dokumentasi Lain](#dokumentasi-lain)

---

## Fitur Utama

- **Lacak resi (AWB)** beserta riwayat checkpoint pengiriman.
- **Cek ongkir** berdasarkan berat aktual dan berat volumetrik (`P × L × T / 6000`).
- **Dua layanan:** Reguler (tarif per kg) dan Kendaraan (tarif per unit).
- **Pemesanan pengiriman** oleh pelanggan, lengkap dengan nomor resi otomatis dan cetak label.
- **Dashboard per peran:** Owner, Admin, Kurir, dan Pelanggan.
- **Checkpoint kurir berurutan:** status tidak bisa dilompati atau dimundurkan.
- **Keamanan:** JWT, bcrypt, Helmet, rate limiting, dan log yang menyamarkan data pribadi.

## Teknologi

| Bagian | Teknologi |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, Tailwind CSS 4 |
| Backend | Express 5, Prisma 6, SQLite |
| Testing | Vitest |
| CI/CD | GitHub Actions |
| Hosting | Vercel (frontend), Railway (backend + database) |

## Struktur Proyek

Monorepo dengan npm workspaces:

```text
RekayasaPerangkatLunak/
├── .github/
│   └── workflows/ci-cd.yml     # Pipeline: Unit Test → Build → Deploy
├── frontend/                   # Next.js
│   └── src/
│       ├── actions/            # Server action yang memanggil REST API
│       ├── app/                # Halaman: /, /track, /rates, /login, /register, /dashboard
│       ├── components/         # Komponen UI
│       └── lib/                # Helper
├── backend/                    # Express REST API
│   ├── prisma/
│   │   ├── schema.prisma       # Model: User, Shipment, TrackingEvent, PriceRate
│   │   ├── seed.ts             # Data demo (khusus lokal)
│   │   └── sync-routes.ts      # Tambah rute tarif tanpa menghapus data
│   └── src/
│       ├── routes/             # api.ts, auth.ts
│       ├── services/           # Logika bisnis: tarif, pengiriman, tracking, kurir
│       ├── lib/                # Prisma, JWT, middleware, error handler, logger
│       └── test/               # 14 file test (200 unit test)
├── dokumentasi/                # Laporan dan panduan tambahan
├── .env.example                # Template environment variable
├── vercel.json                 # Konfigurasi Vercel
└── package.json                # Workspace dan script utama
```

---

## Menjalankan Secara Lokal

**Prasyarat:** Node.js 20 atau lebih baru, npm 10 atau lebih baru, dan Git.

### 1. Clone dan install

```bash
git clone https://github.com/aldrychiayardi/RekayasaPerangkatLunak.git
cd RekayasaPerangkatLunak
npm install
```

### 2. Buat file `.env`

```bash
cp .env.example .env              # Linux / macOS / Git Bash
Copy-Item .env.example .env       # Windows PowerShell
```

| Variabel | Nilai default | Fungsi |
|---|---|---|
| `DATABASE_URL` | `file:./dev.db` | Lokasi database SQLite |
| `API_PORT` | `4000` | Port backend (`PORT` dipakai jika ada) |
| `WEB_ORIGIN` | `http://localhost:3000` | Origin frontend yang diizinkan CORS |
| `API_BASE_URL` | `http://localhost:4000` | Alamat backend yang dipanggil frontend |
| `JWT_SECRET` | *(lihat `.env.example`)* | Kunci tanda tangan token. **Ganti di production.** |

### 3. Siapkan database

```bash
npm run db:generate   # Generate Prisma Client
npm run db:push       # Buat tabel di SQLite
npm run db:seed       # Isi akun demo, tarif, dan resi contoh
```

> ⚠️ `db:seed` **menghapus semua data** sebelum mengisi ulang. Untuk menambah rute tarif tanpa menghapus data, pakai `npm run db:routes`.

### 4. Jalankan (dua terminal)

```bash
npm run dev:backend   # Terminal 1 → http://localhost:4000/api/health
npm run dev           # Terminal 2 → http://localhost:3000
```

---

## Akun Demo & Resi Contoh

Akun berikut **hanya tersedia di database lokal** setelah menjalankan `npm run db:seed`. Database production tidak berisi akun demo.

| Peran | Email | Kata Sandi | Hak Akses |
|---|---|---|---|
| Owner | `owner@nusantara.com` | `Owner123!` | Metrik omzet, ubah tarif, kelola akun |
| Admin | `admin@nusantara.com` | `Admin123!` | Pantau semua pengiriman, lihat tarif |
| Kurir | `kurir@nusantara.com` | `Kurir123!` | Scan resi dan perbarui checkpoint |
| Pelanggan | `budi@gmail.com` | `User123!` | Buat pesanan, cek ongkir, cetak label |

Halaman `/login` menyediakan tombol **Quick Demo Login**. Pengunjung juga bisa mendaftar sendiri di `/register` sebagai Pelanggan.

**Resi contoh** (lacak di `/track`):

| Nomor Resi | Rute | Layanan | Status |
|---|---|---|---|
| `NEX-882910` | Pontianak → Seluas | Reguler | `OUT_FOR_DELIVERY` |
| `NEX-554201` | Pontianak → Kubu Raya | Reguler | `DELIVERED` |
| `NEX-109283` | Pontianak → Anjongan | Kendaraan | `IN_TRANSIT` |

Resi baru memakai format `NEX-<tahun><6 karakter acak>`, misalnya `NEX-2026ABC234`.

---

## Unit Test & Quality Check

```bash
npm test          # 200 unit test (Vitest)
npm run lint      # Type check frontend & backend
npm run build     # Build production
```

Cakupan test:

| Area | Yang diuji |
|---|---|
| Tarif | Berat volumetrik, berat tagihan, tarif default, validasi input, semua rute |
| Pengiriman | Biaya per rute dan layanan, validasi, retry nomor resi yang bentrok |
| Kurir | Semua transisi status yang sah maupun yang ditolak |
| Tracking & lokasi | Normalisasi nomor resi, rute yang didukung |
| Keamanan | JWT, bcrypt, middleware autentikasi, otorisasi peran, anti-tampering |
| Logger | Penyamaran kata sandi, token, nomor HP, dan email di log |
| Admin & bootstrap | Ubah tarif, pembuatan akun Owner pertama |

---

## Branching & CI/CD

| Branch | Fungsi |
|---|---|
| `main` | Production |
| `v1.0` | Baseline rilis pertama |
| `v1.0_dev` | Pengembangan: fitur baru dan perbaikan bug |
| `V1.1` | Rilis berikutnya, dibuat dari `v1.0_dev` setelah semua test lulus |

Pipeline (`.github/workflows/ci-cd.yml`) berjalan setiap ada push ke `main`, `v1.0`, `v1.0_dev`, atau `V1.1`:

```text
1. Unit Test (200 UT) ──► 2. Build ──► 3. Deploy (Vercel)
```

- **Semua test lulus:** Build dan Deploy berjalan otomatis.
- **Ada test yang gagal:** Build dan Deploy di-*skip*, jadi versi Live sebelumnya tetap berjalan.
- Jumlah total/lulus/gagal tampil di halaman **Summary** GitHub Actions.
- Untuk `v1.0_dev` dan `V1.1`, auto-deploy bawaan Vercel dimatikan di `vercel.json`. Deploy hanya dipicu oleh pipeline melalui secret `DEPLOY_HOOK_URL` per environment.

Penjelasan lengkap ada di [dokumentasi/P11_BRANCHING_CI_CD.md](dokumentasi/P11_BRANCHING_CI_CD.md).

---

## Deployment

### Frontend: Vercel

Project Vercel memakai `vercel.json` di root repo. Environment variable yang wajib diisi:

| Variabel | Nilai |
|---|---|
| `API_BASE_URL` | URL backend Railway, misalnya `https://rekayasaperangkatlunak-production.up.railway.app` |

> Jika `API_BASE_URL` kosong, frontend memanggil `localhost:4000` dan halaman login/daftar menampilkan **"fetch failed"**. Setelah mengubah environment variable, lakukan **redeploy**.

### Backend: Railway

| Pengaturan | Nilai |
|---|---|
| Root Directory | `backend` |
| Build Command | `npm run build` |
| Start Command | `npm run db:push && npm run start` |

| Variabel | Keterangan |
|---|---|
| `DATABASE_URL` | File SQLite di persistent volume, misalnya `file:/app/data/nusantara.db` |
| `WEB_ORIGIN` | Domain frontend Vercel |
| `JWT_SECRET` | Kunci acak yang kuat |

Saat backend menyala, tarif default untuk rute yang belum punya tarif ditambahkan otomatis. Tarif yang sudah ada tidak ditimpa.

### Membuat akun Owner pertama di production

1. Tambahkan sementara di Railway: `OWNER_BOOTSTRAP_NAME`, `OWNER_BOOTSTRAP_EMAIL`, dan `OWNER_BOOTSTRAP_PASSWORD` (minimal 12 karakter).
2. Deploy, lalu tunggu log `Initial OWNER account provisioned.`
3. **Hapus ketiga variabel tersebut** dan deploy ulang.
4. Login sebagai Owner, lalu buat akun Admin di **Dashboard → Kelola Akun**.

Jika Owner sudah ada, bootstrap tidak mengubah apa pun. Jangan pernah menjalankan `npm run db:seed` ke database production.

---

## Endpoint REST API

Semua endpoint memakai prefiks `/api`.

| Method | Endpoint | Akses | Fungsi |
|---|---|---|---|
| `GET` | `/health` | Publik | Status server |
| `POST` | `/auth/register` | Publik | Daftar akun pelanggan |
| `POST` | `/auth/login` | Publik | Login dan terima token JWT |
| `GET` | `/auth/me` | Login | Profil akun yang sedang login |
| `GET` | `/auth/users` | Owner | Daftar akun |
| `POST` | `/auth/users` | Owner | Buat akun Admin |
| `GET` | `/rates` | Publik | Daftar tarif rute |
| `POST` | `/rates/calculate` | Publik | Hitung ongkir |
| `PUT` | `/rates/:id` | Owner | Ubah tarif dan estimasi |
| `GET` | `/shipments` | Login (opsional) | Daftar pengiriman; pelanggan hanya melihat miliknya |
| `POST` | `/shipments` | Login (opsional) | Buat pengiriman dan nomor resi |
| `GET` | `/shipments/:awb` | Publik | Detail resi dan riwayat checkpoint |
| `POST` | `/shipments/:awb/events` | Kurir, Admin, Owner | Tambah checkpoint status |
| `GET` | `/admin/metrics` | Admin, Owner | Ringkasan operasional (omzet hanya untuk Owner) |
| `GET` | `/tracking-events` | Publik | Checkpoint terbaru |

---

## Daftar Perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Jalankan frontend (port 3000) |
| `npm run dev:backend` | Jalankan backend dengan hot reload (port 4000) |
| `npm test` | Jalankan 200 unit test |
| `npm run lint` | Type check frontend & backend |
| `npm run build` | Build frontend & backend |
| `npm start` | Jalankan frontend hasil build |
| `npm run start:backend` | Jalankan backend hasil build |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:push` | Terapkan skema ke database |
| `npm run db:seed` | Reset database dan isi data demo |
| `npm run db:routes` | Tambah rute tarif tanpa menghapus data |

---

## Dokumentasi Lain

| Dokumen | Isi |
|---|---|
| [HowToRun.md](dokumentasi/HowToRun.md) | Panduan instalasi lebih rinci |
| [DemoApps.md](dokumentasi/DemoApps.md) | Tautan video demo |
| [SECURITY_REPORT.md](dokumentasi/SECURITY_REPORT.md) | Hasil uji keamanan |
| [LOGGING_AND_ERROR_HANDLING.md](dokumentasi/LOGGING_AND_ERROR_HANDLING.md) | Log aman dan penanganan error |
| [checklist_mvp.md](dokumentasi/checklist_mvp.md) | Checklist fitur MVP |
| [P11_BRANCHING_CI_CD.md](dokumentasi/P11_BRANCHING_CI_CD.md) | Branching, unit test, dan CI/CD |
