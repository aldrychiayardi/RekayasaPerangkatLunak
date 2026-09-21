# Sistem Manajemen Pengiriman Ekspedisi Bus

## 1. Tema (Mengerucut)

Pengembangan **website manajemen pengiriman barang untuk ekspedisi bus** yang membantu proses pemesanan, penentuan tarif, dan pemantauan status pengiriman dalam satu sistem.

Ruang lingkup proyek dibatasi pada operasional pengiriman barang pada satu perusahaan ekspedisi bus. Fokus utama aplikasi adalah digitalisasi proses yang sebelumnya dilakukan secara manual atau menggunakan dokumen fisik.

## 2. Deskripsi Masalah

Proses transaksi pada perusahaan ekspedisi masih dilakukan secara offline. Pencatatan pesanan, pembuatan bukti transaksi, pengelolaan tarif, dan pembaruan status pengiriman membutuhkan dokumen fisik serta pencatatan berulang. Kondisi ini menimbulkan beberapa masalah:

- proses pelayanan pelanggan menjadi lebih lambat;
- biaya operasional untuk nota dan alat tulis kantor meningkat;
- data transaksi lebih sulit dicari dan direkap;
- pelanggan belum dapat mengetahui perkiraan ongkos kirim sebelum melakukan pemesanan; dan
- pemilik usaha kesulitan memantau jumlah transaksi serta pendapatan dalam periode tertentu.

Oleh karena itu, dibutuhkan sebuah website yang dapat memusatkan proses pemesanan dan pengelolaan data pengiriman secara lebih terstruktur, efisien, dan mudah dipantau.

## 3. Profil Target Pengguna

### A. Konsumen

Pelanggan yang ingin mengirimkan barang melalui jasa ekspedisi bus. Konsumen membutuhkan informasi tarif, formulir pemesanan, dan informasi status pengiriman yang mudah diakses.

### B. Admin Operasional

Petugas perusahaan yang menerima serta memproses pesanan pengiriman. Admin bertanggung jawab memvalidasi data pesanan, mengatur tarif, dan memperbarui status pengiriman.

### C. Owner atau Pemilik Usaha

Pemilik perusahaan yang membutuhkan ringkasan operasional dan keuangan untuk memantau kinerja usaha. Owner memiliki akses untuk melihat data, tetapi tidak memiliki hak untuk mengubah tarif atau data operasional utama.

## 4. Manfaat Aplikasi

- Mengurangi ketergantungan pada nota dan pencatatan manual.
- Mempercepat proses penerimaan pesanan pengiriman.
- Membantu konsumen mengetahui perkiraan ongkos kirim sebelum memesan.
- Memudahkan admin mengelola tarif dan memperbarui status pengiriman.
- Membantu owner memantau jumlah transaksi dan estimasi pendapatan berdasarkan periode tertentu.
- Menyediakan data transaksi yang lebih rapi dan mudah ditelusuri.

## 5. Daftar Fitur Inti

Fitur berikut diprioritaskan sebagai **Minimum Viable Product (MVP)** yang realistis untuk diselesaikan dalam 12 pertemuan:

### Fitur Konsumen

- Registrasi dan login pengguna.
- Melihat informasi tarif atau menghitung perkiraan ongkos kirim berdasarkan data pengiriman.
- Membuat pemesanan pengiriman dengan mengisi data pengirim, penerima, serta detail barang.
- Melihat riwayat pemesanan.
- Melihat status pengiriman menggunakan nomor resi atau kode pemesanan.

### Fitur Admin Operasional

- Login sesuai hak akses admin.
- Melihat dan memproses pesanan yang masuk.
- Mengubah status pengiriman, seperti `Menunggu`, `Diproses`, `Dikirim`, dan `Selesai`.
- Mengelola tarif berdasarkan parameter sederhana, seperti jarak dan berat barang.
- Melihat daftar transaksi dan detail pemesanan.

### Fitur Owner

- Login sesuai hak akses owner.
- Melihat ringkasan jumlah transaksi.
- Melihat rekap estimasi pendapatan berdasarkan periode tertentu.
- Melihat daftar tarif dan status transaksi tanpa hak untuk mengubah data operasional.

## 6. Fitur yang Tidak Dikerjakan

Untuk menjaga proyek tetap realistis dalam 12 pertemuan, fitur berikut tidak termasuk dalam ruang lingkup versi pertama:

- pembayaran online dan integrasi dengan payment gateway;
- integrasi otomatis dengan layanan peta atau GPS untuk pelacakan kendaraan secara real-time;
- aplikasi mobile Android atau iOS;
- integrasi dengan WhatsApp, SMS, atau email otomatis;
- pengelolaan banyak cabang dan banyak perusahaan ekspedisi;
- sistem akuntansi dan laporan keuangan lengkap;
- perhitungan tarif yang kompleks berdasarkan banyak zona, promo, atau algoritma dinamis; dan
- integrasi dengan sistem eksternal seperti marketplace atau jasa ekspedisi lain.

## 7. Kriteria Aplikasi Dinyatakan Berhasil

Aplikasi dinyatakan berhasil apabila skenario utama berikut dapat berjalan dengan baik:

1. Konsumen dapat login, menghitung perkiraan ongkos kirim, dan membuat pesanan pengiriman secara online.
2. Sistem dapat menyimpan data pesanan dan menghasilkan nomor resi atau kode pemesanan.
3. Admin dapat melihat pesanan masuk, memperbarui status pengiriman, serta mengatur tarif.
4. Konsumen dapat melihat status pengiriman berdasarkan nomor resi atau kode pemesanan.
5. Owner dapat melihat jumlah transaksi dan estimasi pendapatan berdasarkan periode tertentu.
6. Hak akses setiap peran berjalan sesuai kewenangannya, sehingga konsumen, admin, dan owner hanya dapat mengakses fitur yang relevan.
7. Seluruh alur utama dapat diuji menggunakan data contoh tanpa proses manual di luar sistem.

Keberhasilan proyek diukur dari berjalannya alur pemesanan sampai pemantauan status pengiriman secara konsisten, bukan dari banyaknya fitur tambahan yang berhasil dibuat.

## 8. Identitas dan Konsep Aplikasi

### Nama Aplikasi

**NusantaraExpress: Sistem Informasi Manajemen Ekspedisi dan Logistik Terpadu**

### Teknologi yang Digunakan

- **Framework:** Next.js 15 dengan App Router dan TypeScript
- **Antarmuka:** Tailwind CSS
- **Basis data:** SQLite
- **ORM:** Prisma ORM
- **Pendukung:** JsBarcode dan date-fns

### Gambaran Konsep

NusantaraExpress merupakan aplikasi berbasis web yang dirancang untuk membantu proses pengiriman barang melalui ekspedisi bus. Aplikasi ini mengintegrasikan pemesanan, perhitungan ongkos kirim, pembuatan nomor resi, pencatatan status pengiriman, serta pemantauan transaksi dalam satu sistem.

Pelacakan pengiriman ditampilkan berdasarkan nomor resi atau **Air Waybill (AWB)** melalui tahapan perjalanan paket. Setiap perubahan status dapat dilengkapi lokasi checkpoint, waktu pembaruan, dan keterangan petugas sehingga informasi pengiriman lebih mudah dipahami oleh konsumen maupun pihak operasional.

## 9. Pengembangan Masalah Menjadi Solusi

Untuk mendukung permasalahan yang telah dijelaskan sebelumnya, aplikasi menyediakan solusi berikut:

1. **Perhitungan ongkos kirim yang lebih transparan** dengan membandingkan berat asli dan berat volumetrik menggunakan rumus:

	$$\text{Berat Volumetrik} = \frac{P \times L \times T}{6000}$$

2. **Pelacakan status pengiriman yang lebih jelas** melalui stepper tahapan pengiriman dan timeline kronologis.
3. **Standarisasi label pengiriman** dalam format thermal 100 mm x 150 mm yang memuat nomor resi, barcode, QR code, alamat penerima, dan informasi rute.
4. **Pencatatan checkpoint yang lebih ringkas** bagi petugas operasional melalui fitur pembaruan status berdasarkan nomor resi.

## 10. Modul Tambahan yang Dirancang

Modul berikut merupakan pengembangan dari fitur inti dan tetap mengikuti batasan ruang lingkup proyek:

| Modul | Fitur | Deskripsi |
| :--- | :--- | :--- |
| Publik | Cek Resi | Pengguna dapat memasukkan nomor AWB untuk melihat status dan riwayat pengiriman. |
| Publik | Kalkulator Ongkir | Sistem menghitung estimasi biaya berdasarkan rute, layanan, berat asli, dan berat volumetrik. |
| Pelacakan | Timeline Pengiriman | Status ditampilkan secara kronologis dari pesanan dibuat hingga paket terkirim. |
| Surat Jalan | Label Thermal | Sistem menghasilkan label ukuran 100 mm x 150 mm yang dapat dicetak dan dilengkapi barcode serta QR code. |
| Konsumen | Pendaftaran Pengiriman | Konsumen dapat mengisi data pengirim, penerima, detail barang, dan layanan pengiriman. |
| Operasional | Pencatatan Checkpoint | Petugas dapat memperbarui status paket berdasarkan lokasi atau tahapan pengiriman. |
| Owner | Dashboard Ringkasan | Owner dapat melihat ringkasan transaksi, pendapatan, paket aktif, dan tingkat keberhasilan pengiriman. |

### Tahapan Status Pengiriman

Tahapan status pengiriman yang digunakan dalam versi awal adalah:

`Pesanan Dibuat` -> `Pickup` -> `Hub Asal` -> `Transit` -> `Diantar` -> `Terkirim`

Status tersebut dapat disesuaikan oleh admin atau petugas operasional berdasarkan kondisi paket di lapangan.

### Jenis Layanan Pengiriman

Sistem dapat menyediakan tiga pilihan layanan:

- **NEX Regular:** layanan pengiriman standar dengan tarif ekonomis.
- **NEX Express:** layanan dengan estimasi waktu pengiriman yang lebih cepat.
- **NEX Cargo:** layanan untuk barang dengan berat atau volume yang lebih besar.

## 11. Manfaat Teknis dan Pengguna

### Bagi Pengembang

- Menerapkan arsitektur web full-stack menggunakan Next.js dan TypeScript.
- Memodelkan hubungan data pengiriman, pengguna, tarif, dan riwayat status menggunakan Prisma ORM.
- Menerapkan pembagian hak akses berdasarkan role pengguna.
- Menerapkan algoritma perhitungan tarif dan berat volumetrik secara deterministik.
- Mendesain tampilan responsif serta format cetak khusus untuk label pengiriman.

### Bagi Konsumen dan Pelaku UMKM

- Mengetahui estimasi biaya sebelum melakukan pemesanan.
- Membuat pesanan pengiriman secara mandiri.
- Mendapatkan nomor resi dan label pengiriman yang lebih rapi.
- Memantau perkembangan paket melalui timeline status.

### Bagi Petugas Operasional

- Mempercepat pencatatan status paket di titik checkpoint.
- Mengurangi kesalahan pencatatan melalui data pengiriman yang tersimpan terpusat.
- Memudahkan pencarian paket berdasarkan nomor resi.

### Bagi Owner

- Melihat jumlah transaksi dan pendapatan pada periode tertentu.
- Memantau paket yang masih aktif dalam perjalanan.
- Melihat ringkasan kinerja operasional sebagai bahan evaluasi usaha.

## 12. Struktur Basis Data

Rancangan basis data menggunakan SQLite dan Prisma ORM. Entitas utama yang digunakan adalah:

- **User:** menyimpan data pengguna beserta role, seperti admin, petugas operasional, owner, dan konsumen.
- **Shipment:** menyimpan data paket, nomor resi, data pengirim dan penerima, dimensi, berat, layanan, tarif, serta status terkini.
- **TrackingEvent:** menyimpan riwayat perubahan status, lokasi checkpoint, keterangan, dan waktu pembaruan.
- **PriceRate:** menyimpan tarif berdasarkan kota asal, kota tujuan, jenis layanan, tarif per kilogram, dan estimasi durasi.

## 13. Data Demo dan Skenario Pengujian

Untuk mendukung demonstrasi aplikasi, sistem dapat menggunakan data resi berikut:

| Nomor AWB | Rute | Layanan | Status Skenario |
| :--- | :--- | :--- | :--- |
| `NEX-882910` | Jakarta -> Surabaya | Express | Sedang diantar |
| `NEX-554201` | Bandung -> Medan | Regular | Terkirim |
| `NEX-109283` | Jakarta -> Denpasar | Cargo | Dalam perjalanan |

Data tersebut digunakan untuk menguji halaman cek resi, tampilan timeline, perubahan status, dan perbedaan layanan pengiriman.

## 14. Cara Menjalankan Aplikasi Secara Lokal

### Prasyarat

- Node.js versi 18 atau lebih baru; versi 20, 22, atau 24 direkomendasikan.
- npm, yarn, atau pnpm.

### Langkah Instalasi

```bash
npm install
npx prisma db push
npx prisma db seed
npm run dev
```

Setelah server berjalan, buka [http://localhost:3000](http://localhost:3000) melalui browser.

## 15. Rute Halaman Utama

- **Beranda:** `http://localhost:3000/`
- **Pencarian resi:** `http://localhost:3000/track`
- **Detail resi demo:** `http://localhost:3000/track/NEX-882910`
- **Kalkulator ongkir:** `http://localhost:3000/rates`
- **Portal konsumen:** `http://localhost:3000/dashboard/customer`
- **Portal operasional:** `http://localhost:3000/dashboard/courier`
- **Dashboard admin:** `http://localhost:3000/dashboard/admin`

Rute dan fitur teknis pada bagian ini menjadi acuan implementasi apabila seluruh modul aplikasi dikembangkan. Prioritas penyelesaian tetap mengikuti fitur inti, batasan proyek, dan kriteria keberhasilan yang telah ditetapkan pada bagian sebelumnya.