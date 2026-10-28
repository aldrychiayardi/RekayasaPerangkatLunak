# Panduan Menjalankan NusantaraExpress (HowToRun.md)

NusantaraExpress adalah aplikasi simulasi logistik dan ekspedisi terpadu Indonesia yang dirancang menggunakan arsitektur monorepo (Next.js 15 App Router untuk frontend dan Express.js REST API + Prisma ORM + SQLite untuk backend).

Dokumen ini memuat panduan lengkap instalasi, konfigurasi, inisialisasi basis data, eksekusi aplikasi (mode *development* & *production*), akun pengujian, serta verifikasi unit test.

---

## 1. Prasyarat Sistem

Sebelum memulai, pastikan perangkat Anda telah terpasang:
- **Node.js**: Versi `20.x` atau lebih baru (direkomendasikan versi LTS)
- **npm**: Versi `10.x` atau lebih baru
- **Git**

Periksa versi Node.js dan npm di terminal:
```bash
node -v
npm -v
```

---

## 2. Instalasi dan Konfigurasi Lingkungan

Jalankan perintah berikut pada direktori utama proyek (`RekayasaPerangkatLunak`):

### 2.1. Instalasi Dependensi
```bash
npm install
```
*Perintah ini akan menginstal seluruh dependensi workspace untuk root, frontend, dan backend.*

### 2.2. Konfigurasi Berkas `.env`
Salin berkas konfigurasi default:

**PowerShell (Windows):**
```powershell
Copy-Item .env.example .env
```

**Bash / macOS / Linux:**
```bash
cp .env.example .env
```

Isi default pada `.env`:
```dotenv
DATABASE_URL="file:./dev.db"
API_PORT=4000
WEB_ORIGIN=http://localhost:3000
API_BASE_URL=http://localhost:4000
JWT_SECRET=super-secret-nusantara-express-jwt-token-key-2026
```

---

## 3. Inisialisasi Database Lokal (SQLite & Prisma)

Database SQLite disimpan secara lokal di `backend/prisma/dev.db`. Jalankan urutan perintah berikut:

```bash
# 1. Menghasilkan Prisma Client
npm run db:generate

# 2. Sinkronisasi skema Prisma ke database SQLite
npm run db:push

# 3. Mengisi data awal (seeding akun demo, tarif rute Pontianak, dan sampel kiriman)
npm run db:seed
```

> **Catatan Seeding:** Perintah `npm run db:seed` membuat tabel dan mengisi data demo awal. Jika sewaktu-waktu ingin menambahkan rute koridor tanpa mereset data kiriman yang sudah dibuat, gunakan perintah `npm run db:routes`.

---

## 4. Menjalankan Aplikasi (Mode Development)

Buka **dua terminal** terpisah pada direktori root:

### Terminal 1 — Backend REST API
```bash
npm run dev:backend
```
- Server REST API berjalan di: `http://localhost:4000`
- Pemeriksaan status API: `GET http://localhost:4000/api/health` (menghasilkan `{"status":"ok"}`)

### Terminal 2 — Frontend Next.js
```bash
npm run dev
```
- Antarmuka web dapat diakses di: `http://localhost:3000`

---

## 5. Akun Demo Pengujian (Role Access Matrix)

Aplikasi menyediakan tombol cepat (*Quick Demo Login*) pada halaman `/login`, atau dapat dimasukkan secara manual:

| Peran (Role) | Alamat Email | Kata Sandi | Hak Akses Utama |
| --- | --- | --- | --- |
| **Owner** | `owner@nusantara.com` | `Owner123!` | Akses penuh dashboard, metrik finansial/omset, dan pengubahan tarif/estimasi rute. |
| **Admin Operasional** | `admin@nusantara.com` | `Admin123!` | Monitoring operasional logistik, filter kiriman, mode tinjau (*read-only*) pada tarif. |
| **Kurir** | `kurir@nusantara.com` | `Kurir123!` | Akses scanner AWB dan pembaruan riwayat checkpoint status secara berurutan. |
| **Pelanggan** | `budi@gmail.com` | `User123!` | Membuat order pengiriman, kalkulasi ongkir live, riwayat kiriman, dan cetak label thermal waybill. |

*Pengunjung umum juga dapat mendaftarkan akun pelanggan baru secara mandiri melalui halaman `/register`.*

---

## 6. Contoh Data Nomor Resi (AWB) untuk Pelacakan

Data bawaan lokal yang dapat langsung dilacak melalui menu **Lacak Resi** (`/track`):
- `NEX-882910`: Pontianak $\rightarrow$ Seluas (Reguler, Status: `OUT_FOR_DELIVERY`)
- `NEX-554201`: Pontianak $\rightarrow$ Kubu Raya (Reguler, Status: `DELIVERED`)
- `NEX-109283`: Pontianak $\rightarrow$ Anjongan (Kendaraan, Status: `IN_TRANSIT`)
- Resi baru yang dibuat oleh Pelanggan (`NEX-<tahun><kode-acak>`)

---

## 7. Eksekusi Unit Test & Quality Assurance

Pengujian unit test menggunakan **Vitest** pada backend untuk memastikan seluruh *business logic* dan *acceptance criteria* terpenuhi secara terisolasi tanpa efek samping database:

```bash
# Menjalankan seluruh unit test
npm run test --workspace=@nusantara-express/backend

# Menjalankan linting kode (ESLint & TypeScript Typecheck)
npm run lint
```

Status pengujian seluruh unit test: **PASSED (17/17 tests passing)**.

---

## 8. Build dan Menjalankan Mode Produksi

Untuk melakukan kompilasi dan menjalankan versi produksi:

```bash
# Build frontend dan backend
npm run build

# Menjalankan server frontend produksi
npm start
```

---

## 9. Dokumentasi Video Demonstrasi

Video demonstrasi penggunaan nyata aplikasi dapat diakses melalui berkas:
- [DemoApps.md](file:///c:/SEMESTER%203/RekayasaPerangkatLunak/DemoApps.md) (Tautan Google Drive Demo Video)
