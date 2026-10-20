# NusantaraExpress

NusantaraExpress adalah aplikasi simulasi layanan ekspedisi Indonesia. Pengunjung dapat menghitung ongkos kirim dan melacak resi; portal pelanggan membuat kiriman dan label thermal; portal kurir mencatat checkpoint; dashboard admin mengelola tarif dan memantau pengiriman.

## Pembagian folder

```text
frontend/
  src/
    actions/       Integrasi server-side antara Next.js dan REST API
    app/           Halaman website dan dashboard
    components/    Komponen antarmuka
    lib/           Utilitas tampilan dan format data
  public/          Aset statis website
  package.json     Dependensi dan perintah frontend
  next.config.ts
  tsconfig.json

backend/
  src/
    routes/        Endpoint REST untuk tarif, kiriman, pelacakan, dan admin
    lib/           Koneksi Prisma, konfigurasi, dan penanganan error
    app.ts
    server.ts
  prisma/
    schema.prisma  Model SQLite untuk aplikasi ekspedisi
    seed.ts        Tarif kota dan data demo resi
    dev.db         Database lokal setelah dibuat
  package.json     Dependensi dan perintah backend
  tsconfig.json

package.json       Workspace dan perintah untuk menjalankan kedua aplikasi
package-lock.json
.env.example       Contoh konfigurasi backend
README.md
```

`frontend` adalah Next.js, React, TypeScript, dan Tailwind CSS. `backend` adalah Express REST API dengan Prisma dan SQLite. Frontend mengakses backend melalui server actions, sehingga tampilan dan rute halaman tetap berada di aplikasi Next.js tanpa mengakses Prisma secara langsung.

## Fitur website

| Halaman | Fungsi |
| --- | --- |
| `/` | Beranda NusantaraExpress dan akses cepat ke layanan |
| `/track` | Mencari nomor resi |
| `/track/[awb]` | Melihat detail paket dan riwayat checkpoint |
| `/rates` | Kalkulator dan daftar tarif pengiriman |
| `/dashboard/customer` | Membuat kiriman, melihat riwayat, dan mencetak label |
| `/dashboard/courier` | Mencari AWB dan mencatat status, lokasi, serta keterangan paket |
| `/dashboard/admin` | Melihat metrik pengiriman dan mengubah tarif |

## User Story MVP dan Acceptance Criteria

1. **US-01 — Kalkulasi ongkos kirim (Rates Calculation)**
   - Sebagai calon pengirim, saya ingin melihat ongkir Reguler dan Kendaraan untuk rute yang didukung.
   - AC: berat tagihan Reguler adalah nilai maksimum antara berat aktual dan `(panjang × lebar × tinggi) / 6000`; ongkir Reguler adalah tarif per kg dikali berat tagihan; ongkir Kendaraan adalah tarif tetap per unit; input berat/dimensi tidak valid dan rute tanpa tarif ditolak.
2. **US-02 — Membuat kiriman (Create Shipment)**
   - Sebagai pelanggan, saya ingin membuat kiriman dan memperoleh nomor resi untuk pelacakan.
   - AC: kiriman baru mendapat AWB `NEX-<tahun><kode-acak>` yang dijaga unik oleh database, status awal `ORDER_CREATED`, dan checkpoint awal pada transaksi pembuatan; tarif Kendaraan dihitung per unit.
3. **US-03 — Melacak kiriman (Tracking & Shipment Details)**
   - Sebagai pengirim atau penerima, saya ingin melihat detail paket dan histori checkpoint berdasarkan AWB.
   - AC: AWB dinormalisasi dengan trim dan huruf kapital; detail mencakup checkpoint terbaru lebih dahulu; AWB kosong ditolak dan AWB yang tidak ditemukan menghasilkan 404.
4. **US-04 — Memperbarui checkpoint kurir (Courier Event Checkpoint)**
   - Sebagai kurir, saya ingin mencatat lokasi/status paket agar pelanggan melihat progres terbaru.
   - AC: checkpoint baru dan status kiriman diperbarui secara atomik; urutan status harus maju satu tahap, misalnya `ORDER_CREATED` → `PICKED_UP` → `AT_ORIGIN_HUB` → `IN_TRANSIT`; lompatan/regresi ditolak, dan status terminal `DELIVERED`/`FAILED` tidak dapat diubah lagi.
5. **US-05 — Mengelola tarif (Admin Rate Management)**
   - Sebagai Owner, saya ingin mengubah tarif dasar dan estimasi pengiriman.
   - AC: hanya Owner dapat memanggil endpoint update; tarif harus lebih besar dari nol dan estimasi wajib diisi; keduanya disimpan bersama; ID tarif yang tidak ditemukan menghasilkan 404. Kolom `ratePerKg` juga menyimpan tarif per unit untuk layanan Kendaraan.

Implementasi bisnis berada di `backend/src/services/`. Lima file test terpisah berada di folder yang sama: `rates.service.test.ts`, `shipment.service.test.ts`, `tracking.service.test.ts`, `courier.service.test.ts`, dan `admin-rates.service.test.ts`. Semua test mem-mock akses Prisma agar tidak membutuhkan database lokal. Jalankan dengan `npm run test --workspace=@nusantara-express/backend`.

Rute operasional aplikasi dibatasi dari Pontianak menuju Kabupaten Kubu Raya, Sungai Pinyuh, Anjongan, Toho, Menjalin, Karangan, dan Seluas melalui Anjongan. Tarif default adalah Rp12.000/kg untuk pengiriman reguler dan Rp200.000/unit untuk pengiriman kendaraan. Owner dapat menyesuaikan tarif dan estimasi melalui dashboard admin.

Kalkulasi berat volumetrik untuk layanan reguler menggunakan `panjang × lebar × tinggi / 6000`; berat tagihan membandingkan berat aktual dengan berat volumetrik. Pilihan layanan saat ini adalah Reguler dan Kendaraan. Tarif Reguler dihitung berdasarkan berat tagihan, sedangkan tarif Kendaraan dihitung per unit. Label pengiriman menyediakan barcode dan QR code.

Aplikasi ini merupakan simulasi lokal. Data checkpoint, lokasi hub, tarif, serta kiriman contoh tidak terhubung dengan armada, GPS, atau penyedia ekspedisi eksternal.

## Persyaratan

- Node.js 20 atau lebih baru
- npm

## Instalasi dan konfigurasi

Jalankan dari direktori root proyek:

```powershell
npm install
Copy-Item .env.example .env
npm run db:generate
npm run db:push
npm run db:seed
```

Database SQLite akan dibuat di `backend/prisma/dev.db`. Perintah seed mengisi tarif awal untuk rute Pontianak dan tiga kiriman demo:

- `NEX-882910` — Pontianak ke Seluas, Reguler
- `NEX-554201` — Pontianak ke Kubu Raya, Reguler
- `NEX-109283` — Pontianak ke Anjongan, Kendaraan

> Seed mengosongkan tabel data sebelum membuat ulang data demo. Jangan jalankan jika ingin mempertahankan perubahan data lokal.

Untuk menambahkan rute koridor ke database yang sudah ada tanpa menghapus pengguna, kiriman, riwayat tracking, atau tarif tersimpan, jalankan:

```powershell
npm run db:routes
```

Perintah ini hanya menambahkan tarif yang belum ada untuk Pontianak ke tujuh tujuan layanan. Tarif baru menggunakan nilai default Rp12.000/kg untuk Reguler dan Rp200.000/unit untuk Kendaraan; Owner dapat menyesuaikannya melalui dashboard admin.

## Menjalankan aplikasi

Buka dua terminal di direktori root.

Terminal pertama — backend:

```powershell
npm run dev:backend
```

REST API berjalan di `http://localhost:4000`. Endpoint pemeriksaan: `GET http://localhost:4000/api/health`.

Terminal kedua — frontend:

```powershell
npm run dev
```

Buka website di [http://localhost:3000](http://localhost:3000).

Untuk build produksi:

```powershell
npm run build
npm start
```

Pastikan backend tetap berjalan saat menggunakan website, karena halaman dan aksi data mengambil informasi melalui REST API.

## REST API

Semua endpoint menggunakan prefiks `/api`.

| Method | Endpoint | Fungsi |
| --- | --- | --- |
| `GET` | `/health` | Memeriksa status API |
| `GET` | `/shipments` | Daftar kiriman; mendukung query `query`, `status`, `service` |
| `GET` | `/shipments/:awb` | Detail kiriman dan seluruh checkpoint |
| `POST` | `/shipments` | Membuat kiriman beserta checkpoint awal |
| `POST` | `/shipments/:awb/events` | Menambahkan checkpoint dan memperbarui status kiriman |
| `GET` | `/tracking-events?limit=15` | Daftar checkpoint terbaru |
| `GET` | `/rates` | Daftar tarif; mendukung filter `origin` dan `destination` |
| `POST` | `/rates/calculate` | Menghitung estimasi ongkir berdasarkan kota dan dimensi |
| `PUT` | `/rates/:id` | Memperbarui tarif dan estimasi waktu |
| `GET` | `/admin/metrics` | Metrik ringkasan dashboard admin |

Konfigurasi backend pada `.env`:

```dotenv
DATABASE_URL="file:./dev.db"
API_PORT=4000
WEB_ORIGIN=http://localhost:3000
API_BASE_URL=http://localhost:4000
```

Untuk mengubah alamat API yang dipanggil frontend, atur `API_BASE_URL` di lingkungan proses Next.js.

## Perintah workspace

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Menjalankan frontend Next.js |
| `npm run dev:backend` | Menjalankan backend Express dalam mode watch |
| `npm run build` | Build frontend dan backend |
| `npm run lint` | Menjalankan lint frontend dan backend |
| `npm run db:generate` | Membuat Prisma Client |
| `npm run db:push` | Menyelaraskan schema dengan SQLite lokal |
| `npm run db:seed` | Membuat ulang data demonstrasi |
| `npm run db:routes` | Menambahkan rute Pontianak tanpa menghapus data lain |
