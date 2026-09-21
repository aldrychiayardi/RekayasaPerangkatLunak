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