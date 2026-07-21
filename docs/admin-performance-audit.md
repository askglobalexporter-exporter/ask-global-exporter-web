# Audit performa panel admin

Tanggal audit: 21 Juli 2026

## Penyebab utama yang ditemukan

1. Halaman Media Library mengambil hingga 100 baris dengan `select("*")` dan menampilkan sumber gambar asli.
2. Modal pemilih media mengulang query folder pada setiap pencarian dan mengambil 60 gambar sekaligus tanpa pagination.
3. Upload banyak file meminta kredensial ImageKit dan menulis metadata Supabase satu per satu secara berurutan.
4. Perubahan status inquiry merevalidasi halaman inquiry sekaligus dashboard, walau statistik dashboard tidak memerlukan refresh langsung.
5. Daftar admin belum dipaginasi dan beberapa query admin masih memakai `select("*")`.
6. Preview produk, konten, dan pemilih media menonaktifkan optimizer Next.js atau memakai URL aset asli.
7. Filter dan pengurutan admin belum seluruhnya ditopang index komposit yang sesuai.

## Perubahan yang diterapkan

- Produk dan konten tetap dipaginasi 10 item; inquiry 25 item; admin 12 item; media 24 item.
- Media picker menggunakan infinite query 24 item per tahap, cache React Query, deduplikasi request, abort signal, dan cache folder lima menit.
- Media page dan update status inquiry memakai mutation optimistis; loading hanya muncul pada baris/item yang diproses.
- Query independen media, produk terpilih, dan dashboard dijalankan paralel.
- Semua query admin yang tersentuh memakai daftar kolom eksplisit, termasuk export inquiry.
- Upload gambar dikompresi ke WebP dengan batas dimensi 2200 px sebelum upload. Multi-file diproses paralel, memakai satu token, lalu metadata ditulis secara batch.
- Thumbnail ImageKit (`f-auto`, kualitas 72, dimensi terbatas) dipakai di grid/list. Next Image mengaktifkan AVIF/WebP, cache 24 jam, `sizes`, dan lazy loading.
- Media picker dimuat dinamis hanya ketika diperlukan.
- Revalidasi dashboard yang tidak terkait dihapus dari update inquiry/media. Cache lokal diperbarui lebih dulu dan di-rollback bila mutation gagal.
- Migrasi `015_admin_list_indexes.sql` menambahkan index untuk urutan produk, daftar konten, admin, status inquiry, media, dan folder.

## Validasi dan operasional

- Jalankan migrasi Supabase 015 sebelum mengukur query production.
- Baseline Lighthouse production pada `/admin/login`: Performance 89, Accessibility 95, Best Practices 96, SEO 91; FCP 1,9 dtk, LCP 2,4 dtk, TBT 270 md, CLS 0, 28 request, transfer 512 KiB. Peluang terbesar yang tersisa adalah sekitar 48 KiB JavaScript tidak terpakai dan 2,1 dtk kerja main thread.
- Halaman panel yang terlindungi tetap perlu diukur lagi dengan akun admin uji setelah deployment; audit headless tanpa sesi hanya dapat mengukur halaman login, bukan beban data dashboard/media.
- Audit menemukan fungsi Vercel sebelumnya berjalan di `iad1` (Washington, D.C.) sedangkan database Supabase berada di AWS `ap-southeast-1` (Singapore). `vercel.json` kini menetapkan `sin1`; perubahan aktif pada deployment berikutnya.
- Pantau jumlah request dan transferred bytes di Network untuk pembukaan Media Library, pencarian, upload multi-file, dan update status inquiry.
- Pantau p75 LCP, INP, dan CLS setelah traffic production cukup; target awal: LCP ≤2,5 dtk, INP ≤200 md, CLS ≤0,1.
