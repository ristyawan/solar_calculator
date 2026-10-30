# My Solar Calculator

Katalog produk solar, kalkulator PLTS, RAB, ROI/payback, dan penawaran PDF (pemakaian pribadi).
Frontend statis (HTML/CSS/JS) + Supabase (Auth + Postgres + RLS).

## Isi
- `index.html` aplikasi (layout split 60/40 di landscape, tab Catalog/Calculator di portrait)
- `sync.js` login pemilik dan sinkron ke Supabase; `config.js` URL dan anon key
- `supabase/schema.sql` tabel + RLS; `supabase/seed.sql` 86 produk FSI Price List 2026

## Setup
1. Supabase > SQL Editor: jalankan `supabase/schema.sql`.
2. Authentication > Users > Add user (akun pemilik). Setelah itu matikan pendaftaran publik (Sign In / Providers > Allow new users off).
3. SQL Editor: jalankan `supabase/seed.sql` (produk otomatis dimiliki akun tadi).
4. Isi `config.js` dengan Project URL dan anon key (Project Settings > API). Jangan memakai service_role key.
5. Push ke GitHub, aktifkan Settings > Pages > Source: GitHub Actions. Buka alamat Pages, login, selesai.

Tanpa isi `config.js`, aplikasi berjalan lokal (data di browser).

## Catatan
- Produk disimpan di tabel `products`; pengaturan, proyek, dan penawaran sementara disimpan sebagai JSON di `app_settings` (tabel `project`/`quotations` disiapkan untuk pengembangan berikutnya).
- Gambar produk disimpan sebagai data URL kecil di `image_path` (belum memakai Storage).
- PDF lewat Cetak > Simpan sebagai PDF.
