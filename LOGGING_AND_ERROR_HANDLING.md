# Panduan Standar Logging Aman, Analisis Penyebab Error & Tindakan Perbaikan
**Dokumen:** `LOGGING_AND_ERROR_HANDLING.md`  
**Aplikasi:** NusantaraExpress  
**Mata Kuliah:** Rekayasa Perangkat Lunak (RPL)  

---

## 1. Prinsip Utama Logging Aman (Secure Logging Principles)

Pencatatan log (*logging*) pada aplikasi produksi berfungsi sebagai instrumen audit, debugging, dan pemantauan sistem. Namun, log yang tidak dirancang dengan aman dapat menjadi celah kebocoran data pribadi (*Personally Identifiable Information / PII*) dan kredensial (*Credential Leaks*).

NusantaraExpress menerapkan pedoman **OWASP Logging Cheat Sheet** dan prinsip perlindungan data pribadi (UU PDP):

### A. Data yang Dilarang Dicatat pada Log (Blacklisted Data)
* ❌ **Kata Sandi Murni (Plaintext Password)** pada rute login maupun registrasi.
* ❌ **Kunci Rahasia & Token Lengkap** (`JWT_SECRET`, token Bearer utuh).
* ❌ **Informasi Finansial / Pembayaran** (nomor kartu kredit, CVV, PIN).
* ❌ **Data Pribadi Utuh** (nomor telepon tanpa masking, alamat lengkap privat).
* ❌ **Pesan Kesalahan Internal Basis Data mentah** yang mengekspos struktur tabel atau file path server kepada klien.

### B. Aturan Penyamaran Data (Data Masking Rules)
* **Kata Sandi / Kunci Rahasia:** Ditransformasikan secara mutlak menjadi `[REDACTED]`.
* **Alamat Email:** Disamarkan karakter lokalnya, menyisakan huruf depan dan domain, misalnya: `b***@gmail.com`.
* **Nomor Telepon:** Disamarkan digit tengahnya, menyisakan 4 digit awal dan 3 digit akhir, misalnya: `0812****890`.

---

## 2. Komparasi Sisi demi Sisi: Log Tidak Aman vs Log Aman

Berikut adalah perbandingan nyata antara pencatatan log yang membahayakan sistem versus implementasi log aman yang telah diterapkan pada NusantaraExpress:

### Kasus 1: Endpoint Registrasi & Login Pengguna (`POST /api/auth/login`)

* ❌ **Contoh Log Tidak Aman (VULNERABLE):**
  ```text
  [2026-11-04 14:02:11] POST /api/auth/login
  Request Body: { "email": "budi.santoso@gmail.com", "password": "RahasiaNegara2026!" }
  Response: 200 OK, Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsIm5hbWUiOiJC...
  ```
  > *Bahaya:* Kata sandi pengguna tercatat jelas dalam log plaintext. Setiap orang yang memiliki akses ke server log (atau jika log bocor) dapat langsung membajak akun pengguna.

* ✅ **Contoh Log Aman (SECURE - Diimplementasikan di NusantaraExpress):**
  ```json
  [INFO] {
    "timestamp": "2026-11-04T07:02:11.120Z",
    "method": "POST",
    "url": "/api/auth/login",
    "statusCode": 200,
    "durationMs": 35,
    "sanitizedPayload": {
      "email": "b***@gmail.com",
      "password": "[REDACTED]"
    }
  }
  ```
  > *Keunggulan:* Kata sandi disamarkan `[REDACTED]`, email di-masking, dan token tidak diekspos di log.

---

### Kasus 2: Transaksi Pembuatan Kiriman Pelanggan (`POST /api/shipments`)

* ❌ **Contoh Log Tidak Aman (VULNERABLE):**
  ```text
  [2026-11-04 14:15:30] Insert shipment: Budi Santoso (081299887766, Jl. Gajah Mada No 45 Pontianak) -> Siti (085611223344, Jl. Merdeka No 12 Seluas). Total: Rp36.000
  ```
  > *Bahaya:* Kebocoran data pribadi (PII) lengkap pengirim dan penerima yang melanggar privasi pengguna.

* ✅ **Contoh Log Aman (SECURE):**
  ```json
  [INFO] {
    "timestamp": "2026-11-04T07:15:30.450Z",
    "method": "POST",
    "url": "/api/shipments",
    "statusCode": 201,
    "durationMs": 48,
    "sanitizedPayload": {
      "senderName": "Budi Santoso",
      "senderPhone": "0812****766",
      "senderCity": "Pontianak",
      "receiverCity": "Seluas",
      "weight": 3,
      "serviceType": "REGULAR"
    }
  }
  ```
  > *Keunggulan:* Nomor telepon disamarkan, parameter operasional tetap dapat diaudit oleh teknisi tanpa mengekspos privasi pelanggan.

---

### Kasus 3: Pencatatan Checkpoint Kurir (`POST /api/shipments/:awb/events`)

* ❌ **Contoh Log Tidak Aman:**
  ```text
  User kurir@nusantara.com with Bearer eyJhbGciOiJIUzI1Ni... scanned package NEX-882910 to OUT_FOR_DELIVERY
  ```

* ✅ **Contoh Log Aman:**
  ```json
  [INFO] {
    "timestamp": "2026-11-04T07:30:15.012Z",
    "method": "POST",
    "url": "/api/shipments/NEX-882910/events",
    "statusCode": 200,
    "durationMs": 22,
    "sanitizedPayload": {
      "status": "OUT_FOR_DELIVERY",
      "location": "Hub Seluas",
      "description": "Paket dibawa kurir menuju alamat penerima"
    }
  }
  ```

---

### Kasus 4: Penanganan Error Server & Database (Error 500)

* ❌ **Contoh Log Tidak Aman (Stack Trace Leak):**
  ```text
  HTTP/1.1 500 Internal Server Error
  {
    "error": "PrismaClientInitializationError: Can't reach database server at `file:./dev.db`\n at C:\\SEMESTER 3\\RekayasaPerangkatLunak\\backend\\node_modules\\@prisma\\client\\runtime\\library.js:123:45\n Table 'Shipment' definition: id VARCHAR(191)..."
  }
  ```
  > *Bahaya:* Menyerahkan informasi direktori server lokal, versi pustaka, dan skema tabel kepada penyerang luar (*Information Disclosure*).

* ✅ **Contoh Log Aman:**
  * **Respon ke Klien (Aman):**
    ```json
    HTTP/1.1 500 Internal Server Error
    {
      "message": "Terjadi kesalahan pada server."
    }
    ```
  * **Pencatatan Internal di Server Console:**
    ```json
    [WARN] {
      "timestamp": "2026-11-04T07:45:00.890Z",
      "method": "POST",
      "url": "/api/shipments",
      "statusCode": 500,
      "durationMs": 15,
      "errorType": "DatabaseConnectionException",
      "sanitizedMessage": "Koneksi basis data terputus sementara"
    }
    ```

---

## 3. Matriks Penyebab Error & Tindakan Perbaikan (Error Handling Matrix)

Berikut adalah panduan klasifikasi kode status error HTTP pada NusantaraExpress, akar penyebabnya (*root cause*), serta tindakan korektif bagi pengguna dan sistem pengembang:

| Status HTTP | Deskripsi Error | Akar Penyebab (Root Cause) | Tindakan Perbaikan bagi Pengguna (User Action) | Tindakan Perbaikan bagi Pengembang/Sistem (System Fix) |
| :---: | :--- | :--- | :--- | :--- |
| **400** | `Bad Request` | 1. Input berat $\le 0$ atau dimensi non-numerik.<br>2. Field wajib belum terisi.<br>3. Format email pendaftaran tidak valid. | Periksa kembali input formulir; pastikan berat $> 0$ dan email memiliki format valid (`user@domain.com`). | 1. Pasang validasi sisi klien (*HTML5 validation*).<br>2. Tolak payload dengan `ApiError(400)` di service layer sebelum masuk basis data. |
| **401** | `Unauthorized` | 1. Token JWT tidak disertakan pada header `Authorization`.<br>2. Token kedaluwarsa ($> 7\text{ hari}$) atau signature palsu. | Lakukan login ulang melalui halaman `/login` untuk memperoleh sesi token baru. | 1. Frontend otomatis mendeteksi status 401 dan mengarahkan pengguna ke `/login`.<br>2. Bersihkan token lama dari storage/cookie lokal. |
| **403** | `Forbidden` | Pengguna mencoba memanggil endpoint yang berada di luar hak akses perannya (misal: Kurir mencoba mengubah tarif rute Owner). | Hubungi administrator/Owner jika memerlukan izin akses khusus. | 1. Sembunyikan atau nonaktifkan tombol aksi pada antarmuka jika peran tidak sesuai.<br>2. Middleware `requireRole("OWNER")` memblokir akses secara mutlak. |
| **404** | `Not Found` | 1. Nomor resi AWB tidak terdaftar di database.<br>2. Rute URL API yang dipanggil salah ketik. | Pastikan nomor resi sesuai dengan tanda terima pengiriman (misal: `NEX-882910`). | 1. Tampilkan komponen UI *Empty State* yang informatif.<br>2. Tangani fallback route Express dengan `ApiError(404, "Rute API tidak ditemukan.")`. |
| **409** | `Conflict` | 1. **Email Duplikat:** Mendaftar akun dengan email yang sudah ada.<br>2. **Lompatan Status:** Kurir mencoba update status yang melompati urutan (misal: `ORDER_CREATED` $\rightarrow$ `DELIVERED`).<br>3. **Terminal Resi:** Mencoba mengubah resi yang sudah berstatus akhir `DELIVERED`/`FAILED`. | 1. Gunakan email lain atau klik *Lupa Password*.<br>2. Kurir wajib memindai paket berurutan sesuai alur fisik logistik. | 1. Validasi keunikan email di database via `findUnique`.<br>2. Service `recordCourierCheckpoint` memvalidasi state machine status sekuensial dan mengunci status terminal. |
| **500** | `Internal Server Error` | 1. SQLite file lock (*database busy*).<br>2. Prisma Client belum di-generate.<br>3. Kesalahan logika yang tidak tertangkap (*unhandled exception*). | Muat ulang halaman beberapa saat lagi. Jika berlanjut, hubungi tim operasional IT. | 1. Jalankan `npm run db:generate` dan `npm run db:push`.<br>2. Gunakan centralized error handler `errorHandler` agar aplikasi tidak *crash* dan informasi sensitif tidak bocor. |

---

## 4. Implementasi Teknis pada Kode NusantaraExpress

### A. Middleware Log Aman (`backend/src/lib/logger.ts`)
Fungsi `safeLogger` dan `maskSensitiveData()` otomatis berjalan pada setiap request API:
* Mendeteksi field sensitif (`password`, `token`, `secret`, `phone`, `email`) secara rekursif pada payload JSON.
* Menghitung durasi eksekusi dalam milidetik (`durationMs`) untuk pemantauan performa server.
* Memisahkan level log `[INFO]` untuk kode status 2xx/3xx dan `[WARN]` untuk kode status $\ge 400$.

### B. Penanganan Error Terpusat (`backend/src/lib/errors.ts`)
Semua error yang dilempar oleh aplikasi dieksekusi melalui `errorHandler`:
* Error operasional turunan `ApiError` mengembalikan status dan pesan yang ramah pengguna.
* Error yang tidak terduga (*unexpected error*) dicatat di terminal server untuk kebutuhan perbaikan pengembang, namun hanya mengembalikan respon generik HTTP 500 ke publik demi keamanan sistem.
