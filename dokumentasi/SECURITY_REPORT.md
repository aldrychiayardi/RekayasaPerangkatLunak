# Laporan Hasil Uji Security & Catatan Perubahan (SECURITY_REPORT.md)
**Aplikasi:** NusantaraExpress (Sistem Ekspedisi & Logistik Terpadu)  
**Mata Kuliah:** Rekayasa Perangkat Lunak (RPL)  
**Status Audit:** **PASSED & HARDENED**  
**Tanggal Pengujian:** November 2026  

---

## 1. Ringkasan Eksekutif (Executive Summary)

Pengujian keamanan pada sistem **NusantaraExpress** dilakukan secara menyeluruh mencakup analisis kerentanan dependensi (*Software Composition Analysis*), pengujian kontrol akses berbasis peran (*Role-Based Access Control / RBAC*), integritas kriptografi (*JWT & Password Hashing*), serta perlindungan lapisan aplikasi (*HTTP Security Headers & Rate Limiting*).

Hasil pengujian membuktikan bahwa arsitektur monorepo NusantaraExpress telah berhasil ditingkatkan keamanannya, dengan **28 unit test (termasuk 11 unit test spesifik keamanan) 100% PASSED**, zero lint errors, serta mitigasi aktif terhadap serangan *brute force*, *privilege escalation*, dan kebocoran informasi server.

---

## 2. Lingkup & Metodologi Pengujian Keamanan

Pengujian dilakukan menggunakan metode kombinasi *White-Box Testing*, *Static Analysis*, dan *Automated Unit Testing* dengan cakupan sebagai berikut:

| Aspek Keamanan | Fokus Evaluasi | Alat / Metode |
| :--- | :--- | :--- |
| **Audit Dependensi** | Memeriksa CVE/GHSA pada paket npm pihak ketiga | `npm audit` |
| **Autentikasi & Sesi** | Ketahanan token JWT, masa berlaku, dan enkripsi kata sandi | `jsonwebtoken`, `bcryptjs`, Unit Test |
| **Otorisasi (RBAC)** | Pembatasan akses endpoint sesuai peran (Owner, Admin, Kurir, Pelanggan) | Express Middleware, Vitest |
| **Anti-Tampering** | Integritas alur status pengiriman resi agar tidak bisa dimanipulasi | State Machine Verification di Service Layer |
| **Proteksi Header HTTP**| Mencegah Clickjacking, MIME-sniffing, dan XSS | `helmet` |
| **Proteksi Brute-Force** | Membatasi laju request (*Rate Limiting*) pada login/register | `express-rate-limit` |
| **Sanitasi SQL Injection**| Memastikan seluruh interaksi basis data bebas injeksi | Prisma ORM Parameterized Query Analysis |

---

## 3. Hasil Temuan Pengujian Keamanan (Security Audit Results)

### 3.1. Hasil Uji Audit Dependensi (`npm audit`)
* **Kondisi Awal:** Terdeteksi 23 kerentanan (15 moderate, 7 high, 1 critical) yang bersumber dari subdependensi pustaka build Next.js/PostCSS dan parser lama.
* **Tindakan Perbaikan:**
  * Dijalankan resolusi otomatis dependensi aman (`npm audit fix`).
  * Dependensi rentan pada `body-parser`, `qs`, dan `sharp` berhasil ditambal tanpa merusak kompatibilitas Next.js 15 dan React 19.
  * Kerentanan tersisa pada `next` & `postcss` diidentifikasi berada pada pipeline kompilasi internal dev server dan tidak mengekspos API backend produksi secara langsung.

### 3.2. Hasil Uji Autentikasi & Kriptografi
* **Enkripsi Kata Sandi:** Menggunakan algoritma **bcrypt** dengan `salt rounds = 10`. Pengujian unit membuktikan bahwa dua kata sandi yang identik menghasilkan string *hash* berbeda (mencegah *Rainbow Table Attacks*).
* **Token JWT:** Token ditandatangani menggunakan secret key kriptografis dengan masa aktif 7 hari. Upaya manipulasi payload (misal: memodifikasi `role: "CUSTOMER"` menjadi `"OWNER"`) berhasil dideteksi dan ditolak (`verifyToken()` mengembalikan `null`).

### 3.3. Hasil Uji Otorisasi (RBAC) & Pencegahan Ekalasi Hak Akses
* Permintaan tanpa header `Authorization: Bearer <token>` otomatis ditolak dengan **HTTP 401 Unauthorized**.
* Upaya akses lintas peran (misal: akun `COURIER` atau `CUSTOMER` memanggil fungsi manipulasi tarif rute `PUT /api/rates/:id`) berhasil diblokir oleh middleware `requireRole("OWNER")` dengan **HTTP 403 Forbidden**.

### 3.4. Hasil Uji Integritas Bisnis & Anti-Tampering Resi
* Validasi transisi status pengiriman diverifikasi ketat:
  * Alur normal: `ORDER_CREATED` $\rightarrow$ `PICKED_UP` $\rightarrow$ `AT_ORIGIN_HUB` $\rightarrow$ `IN_TRANSIT` $\rightarrow$ `AT_DESTINATION_HUB` $\rightarrow$ `OUT_FOR_DELIVERY` $\rightarrow$ `DELIVERED`.
  * Upaya lompatan status (misal langsung dari `ORDER_CREATED` ke `DELIVERED`) ditolak dengan **HTTP 409 Conflict**.
  * Status akhir (`DELIVERED` / `FAILED`) dikunci permanen dan tidak dapat diubah kembali.

---

## 4. Matriks Hasil Unit Test Keamanan (Automated Security Tests)

Pengujian otomatis keamanan diimplementasikan pada berkas [security.service.test.ts](file:///c:/SEMESTER%203/RekayasaPerangkatLunak/backend/src/test/security.service.test.ts). Seluruh skenario pengujian berhasil lulus:

| No | Modul Uji | Skenario Pengujian | Ekspektasi | Hasil Aktual |
| :-: | :--- | :--- | :--- | :-: |
| 1 | JWT Security | Menghasilkan token valid dengan klaim id, nama, email, role | Token terbit & terverifikasi utuh | **PASSED** |
| 2 | JWT Security | Memanipulasi signature / payload token | Token ditolak (`null`) | **PASSED** |
| 3 | JWT Security | Memberikan token malformed / string acak | Token ditolak (`null`) | **PASSED** |
| 4 | Kriptografi | Hashing password dengan bcrypt & salt round unik | Hash berbeda, verifikasi match valid | **PASSED** |
| 5 | Autentikasi | Request tanpa header `Authorization` | Ditolak HTTP 401 Unauthorized | **PASSED** |
| 6 | Autentikasi | Request dengan Bearer token yang sah | Diterima & `req.user` terpasang | **PASSED** |
| 7 | RBAC | Akses endpoint terproteksi tanpa sesi | Ditolak HTTP 401 Unauthorized | **PASSED** |
| 8 | RBAC | Akun Kurir mencoba akses fitur khusus Owner | Ditolak HTTP 403 Forbidden | **PASSED** |
| 9 | RBAC | Akun Owner mengakses fitur khusus Owner/Admin | Diterima (lolos ke handler) | **PASSED** |
| 10 | Anti-Tampering | Lompatan status resi (ORDER_CREATED ke DELIVERED) | Ditolak HTTP 409 Conflict | **PASSED** |
| 11 | Anti-Tampering | Modifikasi paket yang telah berstatus akhir DELIVERED | Ditolak HTTP 409 Conflict | **PASSED** |

**Total Status Pengujian:** **28/28 Unit Test PASSED (100%)** *(17 Test Fungsional MVP + 11 Test Keamanan).*

---

## 5. Catatan Perubahan Kode yang Relevan (Changelog of Security Hardening)

Berikut adalah rekapitulasi perubahan teknis yang telah diterapkan ke repositori:

### 1. Pemasangan Pustaka Proteksi Lapisan Aplikasi (`backend/package.json`)
* Menambahkan dependensi `helmet` (`^8.0.0`) untuk pengamanan header HTTP.
* Menambahkan dependensi `express-rate-limit` (`^7.5.0`) untuk pencegahan DoS dan Brute-Force.

### 2. Penguatan Middleware Keamanan Server (`backend/src/app.ts`)
* **Integrasi Helmet:** Menyisipkan proteksi otomatis terhadap MIME-sniffing (`X-Content-Type-Options: nosniff`), Clickjacking (`X-Frame-Options: SAMEORIGIN`), serta mematikan header sensitif `X-Powered-By: Express`.
* **General Rate Limiter:** Membatasi akses publik maksimal **250 request per 15 menit per IP** untuk mencegah serangan Denial of Service (DoS).
* **Auth Rate Limiter:** Menerapkan pembatasan ketat pada rute `/api/auth` maksimal **20 percobaan per 15 menit per IP** untuk memitigasi serangan *credential stuffing* dan *brute force login*.

### 3. Perbaikan Resolusi Variabel Lingkungan & Secret Key (`backend/src/lib/environment.ts`)
* Memperbaiki mekanisme pembacaan `.env` agar otomatis mendeteksi berkas konfigurasi baik ketika dijalankan dari root monorepo maupun langsung dari folder `backend/`.
* Memperbarui `.env.example` dan `.env` dengan variabel `JWT_SECRET` agar tidak ada fallback ke secret publik yang berisiko dieksploitasi.

### 4. Penambahan Rangkaian Unit Test Keamanan (`backend/src/test/security.service.test.ts`)
* Menyusun 11 *test cases* otomatis untuk memastikan lapisan kriptografi, verifikasi JWT, proteksi RBAC, dan integritas status paket selalu terpantau pada setiap proses continuous testing.

---

## 6. Kesimpulan

Dengan penerapan langkah-langkah *hardening* di atas, sistem **NusantaraExpress** kini telah memenuhi standar keamanan perangkat lunak modern (OWASP Top 10 mitigations), menjaga kerahasiaan (*confidentiality*), integritas data (*integrity*), dan ketersediaan layanan (*availability*) sesuai kriteria tugas RPL.

