## Deskripsi Perubahan (Pull Request Description)

Pull Request ini melengkapi kriteria tugas Rekayasa Perangkat Lunak (RPL) untuk sistem ekspedisi logistik **NusantaraExpress**, mencakup hasil uji keamanan dan hardening, standardisasi dokumentasi instalasi ulang fresh clone, panduan log aman & analisis error, serta verifikasi build & unit test.

---

### Kriteria Penyelesaian Tugas

- [x] **01 Hasil Uji Security dan Catatan Perubahan yang Relevan**
  - Implementasi HTTP Security Headers menggunakan `helmet`.
  - Pemasangan Rate Limiting (`express-rate-limit`) untuk mitigasi brute-force auth dan DoS API.
  - Perbaikan resolusi `.env` dan proteksi fallback `JWT_SECRET`.
  - Penambahan 11 unit test keamanan (`security.service.test.ts`).
  - Dokumentasi resmi: `SECURITY_REPORT.md`.

- [x] **02 README.md: Instalasi Ulang & Akses Paket Demo (Fresh Clone, Build, Deploy)**
  - Panduan fresh clone langkah-demi-langkah lintas platform (Windows & Linux/macOS).
  - Tabel matriks kredensial akun demo (Owner, Admin, Kurir, Pelanggan) & Quick Demo Login.
  - Nomor AWB sampel pelacakan aktif (`NEX-882910`, `NEX-554201`, `NEX-109283`).
  - Tautan video demonstrasi aplikasi Google Drive.
  - Panduan build dan deployment cloud (Vercel & Railway/Render).

- [x] **03 Contoh Log Aman, Penyebab Error, dan Tindakan Perbaikannya**
  - Pembuatan middleware `safeLogger` dengan masking otomatis PII (kata sandi, token, nomor HP, email).
  - Komparasi sisi demi sisi *Unsafe Log* vs *Safe Log*.
  - Matriks analisis penyebab dan penanganan error HTTP 400, 401, 403, 404, 409, dan 500.
  - Dokumentasi resmi: `LOGGING_AND_ERROR_HANDLING.md`.

- [x] **04 FRESH CLONE, Pull Request, Install, Run, Build, Deploy : Pastikan Jalan, Unit Test All Passed**
  - Penambahan script `"test"` pada root `package.json` (`npm test`).
  - Verifikasi eksekusi `npm install` bersih.
  - Verifikasi kompilasi produksi `npm run build` berhasil (Next.js 15 & Backend TypeScript).
  - Seluruh unit test lulus: **31/31 PASSED (100%)**.
  - Pengecekan kualitas kode `npm run lint` lulus: **0 Errors, 0 Warnings**.

---

### Verifikasi Mandiri Pengujian Lokal
* `npm test` $\rightarrow$ 31 tests passed
* `npm run lint` $\rightarrow$ Passed
* `npm run build` $\rightarrow$ Passed

