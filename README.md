# Alight Motion Web

Website menggunakan API baru untuk pengiriman dan verifikasi link. UI dan alur manual tetap dipertahankan.

## API aktif

- `POST /api/send-link`
- `POST /api/verify-link`

Backend meneruskan `send-link` dan `verify-link` ke:
`https://restapiv1.cupzproject.my.id/api`

Header `x-api-key` dikirim dari server menggunakan environment variable `CUPZ_API_KEY`.

## Vercel

Set environment variable:

```text
CUPZ_API_KEY=API_KEY_KAMU
```


## Yang sudah dihapus

Fitur aktivitas dan statistik telah dihapus dari UI dan backend, termasuk endpoint statistik, modul penyimpanan statistik, file data statistik, serta skrip tabel statistik Supabase. Alur kirim link dan verifikasi tetap tersedia.
