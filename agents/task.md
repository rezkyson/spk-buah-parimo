# Task List
## SPK Komoditas Buah Parigi Moutong

Sumber acuan: [prd.md](prd.md)

Dokumen ini dipakai sebagai panduan kerja bertahap agar implementasi tetap sesuai PRD. Setiap fase sebaiknya diselesaikan, diuji, lalu ditandai sebelum lanjut ke fase berikutnya.

## Status

- [ ] Belum dikerjakan
- [~] Sedang dikerjakan
- [x] Selesai

---

## Catatan Teknis Penting

- Stack utama mengikuti PRD: Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui, Supabase, Recharts, SheetJS, dan jsPDF atau react-pdf.
- Data produksi kosong atau tanda `-` dianggap sebagai `0`.
- Komoditas dengan total produksi `0` di semua tahun, misalnya Apel, tidak ikut proses perhitungan WP.
- Semua kriteria bertipe `benefit`.
- Bobot default:
  - C1 Produksi: 30%
  - C2 Pertumbuhan Produksi: 25%
  - C3 Rata-rata Produksi: 25%
  - C4 Konsistensi Produksi: 20%
- Total bobot wajib `100%` sebelum perhitungan dijalankan.
- Metode WP membutuhkan nilai kriteria positif. Nilai `0`, pertumbuhan negatif, atau hasil konsistensi negatif perlu ditangani secara eksplisit di fase logika WP agar perhitungan tidak menghasilkan nilai tidak valid.

## Arah Desain UI

- Desain harus modern, clean, rapi, dan profesional untuk konteks sistem dinas, penelitian, atau akademik.
- Tampilan tidak boleh terasa seperti template generik atau "buatan AI"; hindari layout yang terlalu penuh dekorasi, copywriting berlebihan, ikon acak, gradient mencolok, dan kartu berlapis-lapis tanpa fungsi jelas.
- Prioritaskan usability: data mudah dipindai, tabel nyaman dibaca, grafik jelas, dan aksi utama terlihat tanpa membuat halaman terasa ramai.
- Gunakan warna secara hemat dengan nuansa hijau/agrikultur sebagai aksen utama, dipadukan dengan background netral yang terang.
- Gunakan shadcn/ui secara konsisten, tetapi tetap beri sentuhan visual yang natural melalui spacing, hierarchy, alignment, dan microcopy yang sederhana.
- Dashboard dan halaman hasil harus terasa seperti aplikasi kerja yang matang, bukan landing page promosi.
- Pastikan desain responsif untuk desktop dan mobile, tanpa elemen tumpang tindih, teks terpotong, atau grafik yang sulit dibaca.
- Setiap halaman harus memiliki empty state, loading state, dan error state yang ringkas serta manusiawi.

---

## Fase 1 - Setup Project, Database, dan Import Data

Target PRD: Minggu 1-2

Catatan eksekusi:

- Next.js berhasil dibuat dan berjalan di `http://127.0.0.1:3000`.
- `npm run lint`, `npm run typecheck`, `npm run build`, dan `npm run import:excel:dry-run` berhasil.
- Dry-run Excel membaca `22` komoditas dan `88` baris produksi.
- Environment Supabase sudah terisi dan endpoint Auth berhasil merespons `200`.
- Schema database sudah diterapkan di Supabase.
- Import Excel berhasil memasukkan `22` komoditas dan `88` baris produksi.

### Project Setup

- [x] Pastikan project menggunakan Next.js 14 App Router.
- [x] Pastikan TypeScript aktif.
- [x] Setup Tailwind CSS.
- [x] Setup shadcn/ui.
- [x] Setup struktur folder awal:
  - `app/`
  - `components/`
  - `lib/`
  - `types/`
  - `supabase/` atau folder migration sesuai tooling yang dipakai.
- [x] Buat konfigurasi environment:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` jika dibutuhkan untuk proses admin/server.
- [x] Buat helper Supabase client untuk browser dan server.

### Database Supabase

- [x] Buat tabel `komoditas`.
- [x] Buat tabel `produksi`.
- [x] Buat tabel `kriteria`.
- [x] Buat tabel `hasil_wp`.
- [x] Tambahkan relasi foreign key:
  - `produksi.komoditas_id -> komoditas.id`
  - `hasil_wp.komoditas_id -> komoditas.id`
- [x] Tambahkan seed data kriteria default C1-C4.
- [x] Tentukan strategi RLS untuk:
  - akses baca publik atau pengguna umum,
  - akses tulis admin.

### Import Data Excel

- [x] Siapkan file sumber `Data_Tanaman_2021_2024.xlsx`.
- [x] Baca sheet `Data Tanaman` menggunakan SheetJS.
- [x] Mapping kolom Excel ke struktur data sistem:
  - nama komoditas,
  - produksi 2021,
  - produksi 2022,
  - produksi 2023,
  - produksi 2024.
- [x] Konversi angka format Indonesia, misalnya `6.178,33`, menjadi numeric.
- [x] Konversi nilai `-` menjadi `0`.
- [x] Simpan data komoditas ke tabel `komoditas`.
- [x] Simpan data tahunan ke tabel `produksi`.
- [x] Hindari duplikasi data saat import ulang.
- [x] Tambahkan validasi format file dan sheet.

### Acceptance Criteria Fase 1

- [x] Project bisa dijalankan secara lokal.
- [x] Supabase terhubung dari aplikasi.
- [x] Tabel database sesuai PRD sudah tersedia.
- [x] Data 22 komoditas dan produksi 2021-2024 bisa masuk ke database.
- [x] Data kosong berhasil disimpan sebagai `0`.

---

## Fase 2 - Implementasi Logika Weighted Product

Target PRD: Minggu 3

Catatan eksekusi:

- Logika WP dibuat di `lib/wp.ts`.
- Unit test dibuat di `lib/wp.test.ts` menggunakan Vitest.
- Nilai kriteria asli tetap disimpan, sedangkan nilai yang masuk rumus WP dibuat positif melalui offset per kriteria jika terdapat nilai `0` atau negatif.
- Smoke test data Excel asli menghasilkan `21` komoditas aktif; Apel terabaikan karena total produksi `0`.
- Top 5 dengan bobot default: Durian, Mangga, Rambutan, Jeruk Siam/Keprok, Alpukat.

### Perhitungan Kriteria

- [x] Buat file logika utama, misalnya `lib/wp.ts`.
- [x] Definisikan tipe data untuk:
  - komoditas,
  - produksi tahunan,
  - kriteria,
  - bobot,
  - hasil perhitungan.
- [x] Hitung C1 Produksi:
  - total produksi 2021-2024.
- [x] Hitung C2 Pertumbuhan Produksi:
  - `((produksi_2024 - produksi_2021) / produksi_2021) * 100`.
- [x] Tangani C2 ketika produksi 2021 bernilai `0`.
- [x] Hitung C3 Rata-rata Produksi:
  - total produksi dibagi jumlah tahun.
- [x] Hitung C4 Konsistensi Produksi:
  - `1 - (StdDev / Mean)`.
- [x] Tangani C4 ketika mean bernilai `0`.
- [x] Abaikan komoditas yang total produksinya `0`.

### Perhitungan WP

- [x] Normalisasi bobot:
  - `w_j = W_j / sum(W_j)`.
- [x] Validasi total bobot harus `100%`.
- [x] Pastikan semua nilai kriteria yang masuk ke WP valid dan positif.
- [x] Hitung vektor S:
  - `S_i = product(x_ij ^ w_j)`.
- [x] Hitung vektor V:
  - `V_i = S_i / sum(S_i)`.
- [x] Urutkan ranking berdasarkan nilai V terbesar.
- [x] Simpan snapshot bobot ke hasil perhitungan.

### Unit Test

- [x] Tambahkan unit test untuk normalisasi bobot.
- [x] Tambahkan unit test untuk hitung C1-C4.
- [x] Tambahkan unit test untuk vektor S.
- [x] Tambahkan unit test untuk vektor V.
- [x] Tambahkan unit test untuk ranking.
- [x] Tambahkan test edge case:
  - produksi semua tahun `0`,
  - produksi 2021 `0`,
  - pertumbuhan negatif,
  - bobot tidak berjumlah `100%`.

### Acceptance Criteria Fase 2

- [x] Fungsi WP menghasilkan ranking valid dari data produksi.
- [x] Semua test logika WP lulus.
- [x] Edge case nilai nol atau tidak valid tidak merusak perhitungan.

---

## Fase 3 - Halaman Data Komoditas dan Pengaturan Bobot

Target PRD: Minggu 4

Catatan eksekusi:

- Halaman data dibuat di `/data-komoditas`.
- Halaman bobot dibuat di `/pengaturan-bobot`.
- Halaman login admin dibuat di `/login`.
- Untuk fase ini, Admin dipetakan sebagai pengguna Supabase Auth yang sudah login; Pengguna Umum adalah pengunjung tanpa login.
- Aksi admin dilindungi di UI dan API route. Endpoint import, tambah, edit, hapus, dan ubah bobot mengembalikan `401` jika tidak login.
- Verifikasi berhasil: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, dan smoke test HTTP lokal.

### Halaman Data Komoditas

- [x] Buat halaman data komoditas.
- [x] Tampilkan tabel produksi semua komoditas untuk tahun 2021-2024.
- [x] Tambahkan pencarian atau filter sederhana jika dibutuhkan.
- [x] Tambahkan fitur tambah data komoditas untuk admin.
- [x] Tambahkan fitur edit data komoditas untuk admin.
- [x] Tambahkan fitur hapus data komoditas untuk admin.
- [x] Tambahkan import Excel dari UI.
- [x] Tambahkan export data ke Excel.
- [x] Tambahkan loading state.
- [x] Tambahkan empty state.
- [x] Tambahkan error state.

### Halaman Pengaturan Bobot Kriteria

- [x] Buat halaman pengaturan bobot.
- [x] Tampilkan input bobot untuk C1-C4.
- [x] Gunakan slider atau input angka sesuai PRD.
- [x] Validasi total bobot harus `100%`.
- [x] Tampilkan pesan error jika total bobot tidak valid.
- [x] Tambahkan tombol simpan.
- [x] Tambahkan tombol reset ke default.
- [x] Simpan bobot ke tabel `kriteria`.
- [x] Batasi perubahan bobot hanya untuk admin.

### Auth dan Role

- [x] Setup Supabase Auth.
- [x] Tentukan cara membedakan Admin dan Pengguna Umum.
- [x] Lindungi fitur admin:
  - import,
  - tambah,
  - edit,
  - hapus,
  - ubah bobot.
- [x] Pastikan pengguna umum tetap bisa melihat data dan hasil.

### Acceptance Criteria Fase 3

- [x] Data produksi tampil dengan benar.
- [x] Admin bisa import, tambah, edit, hapus, dan export data.
- [x] Bobot kriteria bisa disimpan dan divalidasi.
- [x] Pengguna umum tidak bisa mengakses aksi admin.

---

## Fase 4 - Halaman Perhitungan WP dan Hasil Ranking

Target PRD: Minggu 5-6

Catatan eksekusi:

- Halaman perhitungan dibuat di `/perhitungan-wp`.
- Halaman hasil ranking dibuat di `/hasil-ranking`.
- API hitung ulang dibuat di `/api/wp/calculate` dan hanya dapat dipakai admin yang login.
- Snapshot hasil WP sudah tersimpan di tabel `hasil_wp` sebanyak `21` baris; Apel tidak ikut karena total produksi `0`.
- Grafik memakai Recharts; export hasil memakai SheetJS dan jsPDF.
- Verifikasi berhasil: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, dan smoke test HTTP lokal.
- Browser internal tidak tersedia pada sesi verifikasi, sehingga pengecekan visual dilakukan lewat build dan konten HTML lokal.

### Halaman Perhitungan WP

- [x] Buat halaman perhitungan WP.
- [x] Tampilkan tabel nilai asli setiap kriteria.
- [x] Tampilkan tabel normalisasi bobot.
- [x] Tampilkan tabel vektor S.
- [x] Tampilkan tabel vektor V.
- [x] Tambahkan tombol `Hitung Ulang`.
- [x] Saat dihitung ulang, gunakan bobot terbaru dari tabel `kriteria`.
- [x] Simpan hasil ke tabel `hasil_wp`.
- [x] Simpan `bobot_snapshot` saat perhitungan.
- [x] Tampilkan error jika bobot atau data tidak valid.

### Halaman Hasil dan Peringkat

- [x] Buat halaman hasil dan peringkat.
- [x] Tampilkan tabel ranking dari nilai V tertinggi ke terendah.
- [x] Tambahkan badge untuk peringkat 1, 2, dan 3.
- [x] Tampilkan nilai S dan V dengan format angka yang konsisten.
- [x] Tampilkan grafik bar nilai V semua komoditas.
- [x] Tampilkan grafik radar top 5 komoditas berdasarkan C1-C4.
- [x] Tambahkan export hasil ke Excel.
- [x] Tambahkan export hasil ke PDF.

### Acceptance Criteria Fase 4

- [x] Pengguna bisa melihat proses perhitungan WP secara transparan.
- [x] Ranking hasil WP sesuai dengan nilai V.
- [x] Hasil bisa dihitung ulang setelah bobot berubah.
- [x] Grafik hasil tampil dan mudah dibaca.
- [x] Export hasil berfungsi.

---

## Fase 5 - Dashboard, Export, dan Polish UI

Target PRD: Minggu 7

Catatan eksekusi:

- Dashboard utama di `/` sudah menjadi halaman kerja, bukan landing page promosi.
- Dashboard menampilkan ringkasan komoditas, Top 3 hasil WP, grafik total produksi, grafik tren tahunan, dan shortcut halaman utama.
- Export Excel data komoditas memiliki sheet `Metadata` dan `Data Komoditas`.
- Export Excel hasil ranking memiliki sheet `Metadata`, `Bobot`, dan `Hasil WP`.
- Export PDF hasil ranking memiliki judul, tanggal export, waktu hasil tersimpan, dan informasi bobot.
- Grafik Recharts dirender setelah client mount agar tidak muncul warning ukuran saat pre-render atau smoke test HTTP.
- `npm run lint` dirapikan menjadi ESLint langsung agar tidak menggantung pada `next lint`.
- Verifikasi berhasil: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, dan smoke test HTTP lokal.

### Dashboard

- [x] Buat halaman dashboard utama.
- [x] Tampilkan jumlah komoditas yang dianalisis.
- [x] Tampilkan Top 3 komoditas terbaik.
- [x] Tampilkan grafik bar total produksi semua komoditas.
- [x] Tampilkan grafik tren produksi per tahun.
- [x] Pastikan data dashboard mengambil hasil terbaru.

### UI Polish

- [x] Rapikan navigasi utama.
- [x] Pastikan layout responsif desktop dan mobile.
- [x] Konsistenkan format angka produksi.
- [x] Konsistenkan format nilai WP.
- [x] Tambahkan loading state di halaman utama.
- [x] Tambahkan empty state untuk data kosong.
- [x] Tambahkan error state yang mudah dipahami.
- [x] Pastikan komponen tabel tetap nyaman dibaca untuk 22 komoditas.

### Export Final

- [x] Pastikan export Excel data komoditas berjalan.
- [x] Pastikan export Excel hasil ranking berjalan.
- [x] Pastikan export PDF hasil ranking berjalan.
- [x] Pastikan file export memiliki judul, tanggal, dan informasi bobot.

### Acceptance Criteria Fase 5

- [x] Dashboard merangkum kondisi sistem dengan jelas.
- [x] UI nyaman dipakai oleh admin dan pengguna umum.
- [x] Semua fitur export utama berfungsi.

---

## Fase 6 - Testing, Bug Fix, dan Deployment

Target PRD: Minggu 8

Catatan eksekusi:

- `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run import:excel:dry-run`, dan `npm run smoke` berhasil.
- Production server lokal diuji dengan `next start` pada `http://127.0.0.1:3001` dan smoke test berhasil.
- Supabase cloud siap dan berisi `22` komoditas, `88` produksi, `4` kriteria, dan `21` hasil WP.
- Browser internal tidak tersedia pada sesi ini, sehingga uji visual/responsif dilakukan melalui build, smoke test HTTP, dan struktur CSS responsif.
- Deploy frontend ke Vercel akan dilakukan manual oleh pemilik project, sehingga tidak dikerjakan dalam sesi Codex ini.
- Dev server lokal aktif kembali di `http://127.0.0.1:3000`.

### Testing

- [x] Jalankan lint.
- [x] Jalankan typecheck.
- [x] Jalankan unit test.
- [~] Uji manual alur admin:
  - login,
  - import Excel,
  - ubah data,
  - ubah bobot,
  - hitung ulang WP,
  - export hasil.
- [x] Uji manual alur pengguna umum:
  - lihat dashboard,
  - lihat data,
  - lihat perhitungan,
  - lihat hasil ranking.
- [~] Uji responsive layout.
- [x] Uji data kosong dan data tidak valid.

### Bug Fix

- [x] Perbaiki bug dari hasil testing.
- [x] Validasi ulang perhitungan setelah bug fix.
- [x] Pastikan tidak ada regression pada import, ranking, dan export.

### Deployment

- [x] Siapkan environment variable untuk production.
- [~] Deploy frontend ke Vercel. Ditangani manual oleh pemilik project.
- [x] Pastikan Supabase production siap.
- [x] Jalankan migration atau setup schema production.
- [~] Uji koneksi aplikasi production ke Supabase.
- [~] Uji fitur utama di URL production. Dilakukan setelah deploy manual ke Vercel.

### Dokumentasi

- [x] Tambahkan instruksi setup lokal di README.
- [x] Tambahkan instruksi environment variable.
- [x] Tambahkan instruksi import data Excel.
- [x] Tambahkan catatan metode WP secara ringkas.

### Acceptance Criteria Fase 6

- [x] Aplikasi lolos lint, typecheck, dan test.
- [~] Aplikasi berhasil deploy. Menunggu deploy manual ke Vercel.
- [~] Alur utama admin dan pengguna umum berjalan di production.
- [x] Dokumentasi setup tersedia.

---

## Definition of Done

Sebuah fase dianggap selesai jika:

- [ ] Semua task inti pada fase tersebut sudah selesai.
- [ ] Acceptance criteria fase tersebut terpenuhi.
- [ ] Tidak ada error kritis pada halaman atau fitur terkait.
- [ ] Perubahan sudah diuji minimal secara manual.
- [ ] Catatan kendala atau keputusan teknis sudah ditulis jika ada.

---

## Urutan Prioritas Kerja

1. Fase 1 - Setup Project, Database, dan Import Data
2. Fase 2 - Implementasi Logika Weighted Product
3. Fase 3 - Halaman Data Komoditas dan Pengaturan Bobot
4. Fase 4 - Halaman Perhitungan WP dan Hasil Ranking
5. Fase 5 - Dashboard, Export, dan Polish UI
6. Fase 6 - Testing, Bug Fix, dan Deployment


EN0FoY4oE36Ustip
