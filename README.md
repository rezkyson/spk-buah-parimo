# SPK Buah Parigi Moutong

Sistem Pendukung Keputusan penentuan komoditas buah terbaik Kabupaten Parigi Moutong menggunakan metode Weighted Product.

## Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS + shadcn/ui style
- Supabase PostgreSQL + Supabase Auth
- Recharts
- SheetJS
- jsPDF

## Setup Lokal

1. Install dependency:

   ```bash
   npm install
   ```

2. Salin `.env.example` menjadi `.env.local`, lalu isi:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   ```

3. Jalankan migration Supabase dari file:

   ```text
   supabase/migrations/20260615000000_initial_schema.sql
   ```

   Jika memakai dashboard Supabase, buka SQL Editor, salin isi file migration tersebut, lalu jalankan.

4. Cek parsing Excel tanpa import database:

   ```bash
   npm run import:excel:dry-run
   ```

5. Import Excel ke Supabase setelah environment siap:

   ```bash
   npm run import:excel
   ```

6. Jalankan aplikasi:

   ```bash
   npm run dev
   ```

7. Buka:

   ```text
   http://127.0.0.1:3000
   ```

## Data

File sumber default adalah `Data_Tanaman_2021_2024.xlsx`, sheet `Data Tanaman`.

Nilai kosong atau `-` diproses sebagai `0`. Komoditas dengan total produksi `0`, seperti Apel, tidak ikut perhitungan WP.

## Metode Weighted Product

Kriteria yang dipakai:

- C1 Produksi: total produksi 2021-2024
- C2 Pertumbuhan Produksi: pertumbuhan dari 2021 ke 2024
- C3 Rata-rata Produksi: rata-rata produksi 2021-2024
- C4 Konsistensi Produksi: `1 - (StdDev / Mean)`

Bobot default:

- C1: 30%
- C2: 25%
- C3: 25%
- C4: 20%

Tahapan perhitungan:

1. Normalisasi bobot: `w_j = W_j / sum(W_j)`
2. Hitung vektor S: `S_i = product(x_ij ^ w_j)`
3. Hitung vektor V: `V_i = S_i / sum(S_i)`
4. Ranking diurutkan dari nilai V terbesar.

## Admin

Untuk fase ini, pengguna yang login melalui Supabase Auth dianggap sebagai Admin. Pengunjung tanpa login tetap bisa melihat dashboard, data, perhitungan, dan hasil.

Fitur admin:

- Import Excel
- Tambah/edit/hapus data komoditas
- Ubah bobot kriteria
- Hitung ulang dan simpan hasil WP

## Testing

Jalankan pemeriksaan utama:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Jalankan smoke test saat server lokal sudah aktif:

```bash
npm run dev
npm run smoke
```

Untuk smoke test pada URL lain:

```bash
SMOKE_BASE_URL=http://127.0.0.1:3001 npm run smoke
```

## Deployment

### Supabase

1. Pastikan schema production sudah dibuat dari migration:

   ```text
   supabase/migrations/20260615000000_initial_schema.sql
   ```

2. Isi data awal dengan:

   ```bash
   npm run import:excel
   ```

3. Pastikan tabel utama berisi:

   - `komoditas`: 22 baris
   - `produksi`: 88 baris
   - `kriteria`: 4 baris

### Vercel

1. Import project ke Vercel.
2. Set environment variable production:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   ```

3. Build command:

   ```bash
   npm run build
   ```

4. Setelah deploy, buka URL production dan jalankan alur utama:

   - Dashboard
   - Data Komoditas
   - Pengaturan Bobot
   - Perhitungan WP
   - Hasil Ranking

## Perintah Penting

```bash
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
npm run smoke
npm run import:excel:dry-run
npm run import:excel
```
