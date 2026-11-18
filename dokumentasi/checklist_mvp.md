# Checklist Fitur MVP & Status Pengujian — NusantaraExpress

**Target Akhir:** MVP Lengkap Sesuai Lingkup Proyek, Hardened & Siap Didemonstrasikan  
**Status Keseluruhan:** **PASSED & SIAP DEMO**  
**Hasil Unit Test:** **31/31 PASSED (100%)**

---

## 1. Matriks Checklist Fitur Inti MVP

### US-01 — Kalkulasi Ongkos Kirim (Rates Calculation)
| No | Kriteria Penerimaan (Acceptance Criteria) | Implementasi | Status Fitur | Status Unit Test |
| --- | --- | --- | :---: | :---: |
| 1.1 | Menghitung berat volumetrik paket reguler: `(panjang × lebar × tinggi) / 6000` | `rates.service.ts` & `RateCalculatorWidget.tsx` | [x] Selesai | **PASSED** |
| 1.2 | Memilih berat tagihan (*chargeable weight*) sebagai nilai maksimum antara berat aktual dan volumetrik | `calculateRates()` | [x] Selesai | **PASSED** |
| 1.3 | Menghitung ongkos kirim Reguler berdasarkan tarif per kg dikalikan berat tagihan | `calculateRates()` | [x] Selesai | **PASSED** |
| 1.4 | Menghitung ongkos kirim layanan Kendaraan sebagai tarif tetap (*flat rate*) per unit | `calculateRates()` | [x] Selesai | **PASSED** |
| 1.5 | Menolak input berat atau dimensi $\le 0$ dan rute yang tidak tersedia dengan pesan error yang jelas | Validasi schema & `ApiError(400/404)` | [x] Selesai | **PASSED** |

---

### US-02 — Pembuatan Kiriman (Create Shipment)
| No | Kriteria Penerimaan (Acceptance Criteria) | Implementasi | Status Fitur | Status Unit Test |
| --- | --- | --- | :---: | :---: |
| 2.1 | Menghasilkan nomor AWB unik dengan format resmi `NEX-<tahun><6 karakter acak>` | `generateTrackingNumber()` | [x] Selesai | **PASSED** |
| 2.2 | Memberikan status awal kiriman `ORDER_CREATED` | `createShipment()` | [x] Selesai | **PASSED** |
| 2.3 | Mencatat checkpoint awal secara atomik pada transaksi pembuatan pesanan | `prisma.shipment.create({ data: { events: { create: ... } } })` | [x] Selesai | **PASSED** |
| 2.4 | Menghitung total ongkir otomatis sesuai tarif rute tersimpan | Integrasi `priceRate.findFirst()` | [x] Selesai | **PASSED** |
| 2.5 | Menyediakan label thermal waybill dengan Barcode SVG & QR Code yang dapat dicetak | `ThermalShippingLabel.tsx` | [x] Selesai | **PASSED** |

---

### US-03 — Pelacakan Kiriman (Tracking & Shipment Details)
| No | Kriteria Penerimaan (Acceptance Criteria) | Implementasi | Status Fitur | Status Unit Test |
| --- | --- | --- | :---: | :---: |
| 3.1 | Normalisasi input nomor AWB (penghapusan spasi/trimming dan konversi huruf kapital otomatis) | `normalizeAwb()` | [x] Selesai | **PASSED** |
| 3.2 | Menampilkan detail kiriman lengkap beserta riwayat checkpoint berurutan dari yang terbaru | `getShipmentByAwb()` dengan `orderBy: { timestamp: 'desc' }` | [x] Selesai | **PASSED** |
| 3.3 | Menolak nomor AWB kosong dengan status HTTP 400 | Validasi `normalizeAwb()` | [x] Selesai | **PASSED** |
| 3.4 | Menampilkan halaman khusus resi tidak ditemukan (HTTP 404 UI yang ramah pengguna) | `/track/[awb]/page.tsx` empty state | [x] Selesai | **PASSED** |

---

### US-04 — Pembaruan Checkpoint Kurir (Courier Event Checkpoint)
| No | Kriteria Penerimaan (Acceptance Criteria) | Implementasi | Status Fitur | Status Unit Test |
| --- | --- | --- | :---: | :---: |
| 4.1 | Memperbarui checkpoint baru dan status kiriman secara atomik melalui transaksi basis data | `db.$transaction()` | [x] Selesai | **PASSED** |
| 4.2 | Memvalidasi urutan status kiriman harus maju satu tahap sesuai alur operasional:  <br>`ORDER_CREATED` $\rightarrow$ `PICKED_UP` $\rightarrow$ `AT_ORIGIN_HUB` $\rightarrow$ `IN_TRANSIT` $\rightarrow$ `AT_DESTINATION_HUB` $\rightarrow$ `OUT_FOR_DELIVERY` $\rightarrow$ `DELIVERED`/`FAILED` | `VALID_STATUS_TRANSITIONS` & `validateStatusTransition()` | [x] Selesai | **PASSED** |
| 4.3 | Menolak lompatan status (*skipping status*) dan pembalikan status (*regressive status*) dengan HTTP 409 Conflict | Validasi transisi status | [x] Selesai | **PASSED** |
| 4.4 | Mengunci paket dengan status akhir (*terminal status*) `DELIVERED` atau `FAILED` agar tidak dapat dimodifikasi lagi | Pengecekan status terminal | [x] Selesai | **PASSED** |

---

### US-05 — Pengelolaan Tarif oleh Owner (Admin Rate Management)
| No | Kriteria Penerimaan (Acceptance Criteria) | Implementasi | Status Fitur | Status Unit Test |
| --- | --- | --- | :---: | :---: |
| 5.1 | Otorisasi berbasis peran: hanya akun berkedudukan **Owner** yang berhak memperbarui tarif rute | RBAC middleware & Server Action verification | [x] Selesai | **PASSED** |
| 5.2 | Membatasi akun **Admin Operasional** hanya dapat memantau data operasional dan tabel tarif dalam mode tinjau (*Read-Only*) | `AdminClient.tsx` read-only lock banner & disabled actions | [x] Selesai | **PASSED** |
| 5.3 | Memvalidasi bahwa tarif baru harus bernilai positif ($> 0$) dan estimasi durasi wajib terisi | `updateAdminRate()` | [x] Selesai | **PASSED** |
| 5.4 | Menyimpan pembaruan tarif per kg dan estimasi waktu secara bersamaan | `priceRate.update()` | [x] Selesai | **PASSED** |
| 5.5 | Mengembalikan status 404 apabila ID tarif tidak ditemukan di database | Prisma error mapping | [x] Selesai | **PASSED** |

---

### US-06 — Keamanan Sistem & Logging Terproteksi (Security & Safe Logging)
| No | Kriteria Keamanan & Logging | Implementasi | Status Fitur | Status Unit Test |
| --- | --- | --- | :---: | :---: |
| 6.1 | Kriptografi token JWT (verifikasi signature, deteksi manipulasi payload) | `jwt.ts` & `security.service.test.ts` | [x] Selesai | **PASSED** |
| 6.2 | Hashing password dengan bcrypt (salt rounds = 10, pencegahan rainbow table) | `auth.ts` & `security.service.test.ts` | [x] Selesai | **PASSED** |
| 6.3 | Proteksi RBAC Middleware (blokir 401 unauthenticated, blokir 403 unauthorized role) | `auth-middleware.ts` | [x] Selesai | **PASSED** |
| 6.4 | Anti-tampering status resi sekuensial dan penguncian status final | `courier.service.ts` | [x] Selesai | **PASSED** |
| 6.5 | HTTP Security Headers (Helmet: anti-MIME sniffing, anti-clickjacking) | `app.ts` (`helmet`) | [x] Selesai | **PASSED** |
| 6.6 | Proteksi Brute Force & DoS via Rate Limiter (20 req/15 min auth, 250 req/15 min API) | `app.ts` (`express-rate-limit`) | [x] Selesai | **PASSED** |
| 6.7 | Masking data sensitif PII pada log (penyamaran password, token, no hp, email) | `logger.ts` & `logger.test.ts` | [x] Selesai | **PASSED** |

---

## 2. Ringkasan Eksekusi Unit Test (Vitest)

Hasil eksekusi `npm test` dari root workspace:

```text
 RUN  v5.0.5 C:/SEMESTER 3/RekayasaPerangkatLunak/backend

 ✓ src/test/logger.test.ts (3 tests)
   - masks password, token, and secret fields in payloads
   - handles primitive and non-object inputs safely
   - registers finish handler and calls next() without blocking execution

 ✓ src/test/admin-rates.service.test.ts (3 tests)
   - updates the stored base rate and estimated delivery time
   - rejects zero/negative rates and an empty estimate without updating
   - maps an unknown rate ID to a not-found API error

 ✓ src/test/rates.service.test.ts (4 tests)
   - uses volumetric weight when it exceeds actual weight
   - uses actual weight when it exceeds volumetric weight
   - charges vehicle service as a flat per-unit rate
   - rejects invalid dimensions and a route without configured rates

 ✓ src/test/shipment.service.test.ts (4 tests)
   - creates a unique-format AWB with calculated cost and initial checkpoint
   - uses the vehicle rate as a flat unit amount
   - rejects invalid weight and reports a missing route rate
   - returns a service error if the generated AWB collides

 ✓ src/test/tracking.service.test.ts (3 tests)
   - normalizes AWB and returns the shipment with newest checkpoints first
   - rejects an empty AWB without querying Prisma
   - returns not found for an unknown AWB

 ✓ src/test/courier.service.test.ts (3 tests)
   - adds an in-transit checkpoint and updates shipment status atomically
   - accepts delivery after out-for-delivery
   - rejects skipped, regressive, and post-delivery status changes

 ✓ src/test/security.service.test.ts (11 tests)
   - successfully issues and verifies a valid cryptographic token
   - rejects tampered or forged tokens with signature mismatch
   - rejects malformed token strings
   - hashes passwords securely with unique salts
   - blocks unauthenticated requests without valid session with HTTP 401
   - prevents privilege escalation when user has insufficient role with HTTP 403
   - permits authorized user with allowed role to proceed
   - rejects missing Authorization header with HTTP 401
   - attaches decoded user on valid Bearer token
   - rejects illegal status skipping attempts with HTTP 409 Conflict
   - locks terminal status preventing modification once package is delivered

 Test Files  7 passed (7)
      Tests  31 passed (31)
   Duration  666ms
     Status  ALL PASSED (100%)
```

---

## 3. Kesimpulan Kesiapan Pengumpulan

Seluruh cakupan penyelesaian MVP telah terpenuhi secara menyeluruh:
1. **Kode versi final**: Bersih, teruji, dan lulus seluruh linting serta kompilasi produksi.
2. **Petunjuk instalasi fresh clone & deploy**: Tersedia komprehensif pada berkas [README.md](file:///c:/SEMESTER%203/RekayasaPerangkatLunak/README.md).
3. **Laporan hasil uji keamanan**: Terdokumentasi lengkap pada [SECURITY_REPORT.md](file:///c:/SEMESTER%203/RekayasaPerangkatLunak/SECURITY_REPORT.md).
4. **Panduan log aman & analisis error**: Terdokumentasi lengkap pada [LOGGING_AND_ERROR_HANDLING.md](file:///c:/SEMESTER%203/RekayasaPerangkatLunak/LOGGING_AND_ERROR_HANDLING.md).
5. **Checklist seluruh fitur MVP & status pengujian**: Terdokumentasi lengkap pada berkas ini dengan status **31/31 PASSED**.
6. **Demonstrasi aplikasi**: Tautan rekaman video demo tersedia di [DemoApps.md](file:///c:/SEMESTER%203/RekayasaPerangkatLunak/DemoApps.md).
