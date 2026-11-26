# Tugas P11 — Branching, Unit Test, dan CI/CD

## Strategi Branch

| Branch | Fungsi |
|---|---|
| `v1.0` | Baseline rilis (kode stabil yang sudah Live) |
| `v1.0_dev` | Pengembangan: tambah fitur / perbaikan bug, sedang diuji (under testing) |
| `V1.1` | Rilis berikutnya, dibuat dari `v1.0_dev` setelah semua unit test hijau |

```
v1.0 ──► v1.0_dev (fix bug + 200 UT) ──► [CI hijau] ──► V1.1
```

## Perbaikan Bug di `v1.0_dev`

**Bug:** saat membuat pesanan, nomor resi (AWB) dibuat acak. Jika nomor acak itu
kebetulan sudah dipakai (Prisma error `P2002`), pesanan langsung gagal dengan
HTTP 503 walaupun cukup membuat nomor resi baru.

**Perbaikan:** `createShipment` (`backend/src/services/shipment.service.ts`) kini
membuat ulang nomor resi hingga `MAX_AWB_ATTEMPTS = 3` kali. HTTP 503 hanya
dikembalikan jika ketiga percobaan bentrok. Error database lain tidak di-retry.

## Unit Test: 200 UT

```bash
npm test
# Test Files  14 passed (14)
#      Tests  200 passed (200)
```

Test baru berbasis tabel (`it.each`): `rates.table`, `courier.table`,
`shipment.table`, `locations-tracking.table`, `admin-rates.table`.

## Pipeline CI/CD (`.github/workflows/ci-cd.yml`)

```
1. Unit Test (200 UT) ──► 2. Build ──► 3. Deploy (Live)
```

- **Semua lulus (hijau):** Build lalu Deploy berjalan otomatis, aplikasi Live dan siap diuji.
- **Ada yang gagal (merah):** job Build dan Deploy berstatus *skipped*, sehingga kode rusak
  tidak pernah sampai ke server Live. Versi Live sebelumnya tetap berjalan.

Ringkasan jumlah Total / Passed / Failed tampil di halaman *Summary* GitHub Actions.

### Efek Unit Test Gagal (simulasi)

Mengubah `MAX_AWB_ATTEMPTS` menjadi `1` (mensimulasikan regresi bug) menghasilkan:

| Total | Passed | Failed |
|---:|---:|---:|
| 200 | 197 | 3 |

Akibatnya: workflow merah, **Build dan Deploy di-skip**, PR tidak layak di-merge,
developer harus memperbaiki kode lalu push ulang sampai hijau.

### Konfigurasi Deploy

Job Deploy memanggil secret `DEPLOY_HOOK_URL` (GitHub → Settings → Secrets and
variables → Actions). Isi dengan Deploy Hook Vercel (Project → Settings → Git →
Deploy Hooks, pilih branch `v1.0_dev`). Untuk backend di Railway, aktifkan
**Wait for CI** pada Settings → Source agar Railway hanya deploy setelah workflow hijau.
