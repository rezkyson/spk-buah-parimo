# Product Requirements Document (PRD)
## Sistem Pendukung Keputusan Penentuan Komoditas Buah Terbaik
### Kabupaten Parigi Moutong Menggunakan Metode Weighted Product (WP)

---

**Versi:** 1.0  
**Tanggal:** Juni 2026  
**Status:** Draft  
**Stack Teknologi:** Next.js + Supabase  

---

## 1. Latar Belakang

Kabupaten Parigi Moutong memiliki beragam komoditas buah-buahan yang dihasilkan setiap tahunnya. Berdasarkan data produksi tahun 2021–2024, terdapat 22 jenis komoditas buah yang tercatat, antara lain Durian, Mangga, Rambutan, Pisang, Nangka, dan lain-lain. Perbedaan jumlah produksi, tren pertumbuhan, serta konsistensi antar komoditas menyulitkan pemangku kepentingan dalam menentukan komoditas mana yang paling unggul dan potensial untuk dikembangkan.

Sistem Pendukung Keputusan (SPK) ini dibangun untuk membantu proses pengambilan keputusan secara objektif dan terstruktur menggunakan metode **Weighted Product (WP)**, dengan mengolah data produksi buah aktual dari file Excel yang telah tersedia.

---

## 2. Tujuan Produk

- Membangun sistem berbasis web yang mampu mengolah data produksi komoditas buah dan menghasilkan peringkat komoditas terbaik secara otomatis.
- Mengimplementasikan metode Weighted Product (WP) sebagai dasar perhitungan pengambilan keputusan multikriteria.
- Memberikan visualisasi hasil yang mudah dipahami oleh pengguna (dinas/peneliti/akademisi).
- Menyediakan kemampuan import data dari file Excel ke dalam sistem.

---

## 3. Pengguna Sistem (User)

| Peran | Deskripsi |
|---|---|
| Admin | Mengelola data komoditas, mengatur bobot kriteria, mengimpor data Excel |
| Pengguna Umum | Melihat hasil perhitungan, peringkat, dan grafik komoditas |

---

## 4. Data Komoditas

Data bersumber dari file Excel `Data_Tanaman_2021_2024.xlsx` dengan sheet `Data Tanaman`.

### 4.1 Daftar Komoditas Buah (22 Komoditas)

| No | Nama Komoditas | 2021 | 2022 | 2023 | 2024 |
|---|---|---|---|---|---|
| 1 | Alpukat | 6.178,33 | 8.636,00 | 9.068,00 | 23.651,00 |
| 2 | Anggur | 51,65 | 16,50 | 21,64 | 35,29 |
| 3 | Belimbing | 274,97 | 359,50 | 351,00 | 867,00 |
| 4 | Duku/Langsat | 12.076,79 | 10.535,00 | 16.376,00 | 9.091,00 |
| 5 | Durian | 228.637,20 | 305.419,41 | 340.763,00 | 250.520,00 |
| 6 | Jambu Air | 1.412,08 | 4.533,30 | 2.155,00 | 3.111,00 |
| 7 | Jambu Biji | 314,21 | 650,70 | 761,00 | 1.670,00 |
| 8 | Jeruk Pamelo | 0,24 | 7,00 | 291,00 | 584,00 |
| 9 | Jeruk Siam/Keprok | 1.549,36 | 18.988,90 | 22.616,00 | 13.023,40 |
| 10 | Lengkeng | - | 10,00 | 21,00 | 11,40 |
| 11 | Mangga | 78.782,18 | 86.364,50 | 93.161,00 | 96.543,00 |
| 12 | Manggis | 9.525,69 | 11.705,00 | 9.934,00 | 10.122,00 |
| 13 | Nenas | 274,96 | 319,31 | 332,50 | 240,61 |
| 14 | Nangka/Cempedak | 21.865,39 | 25.253,50 | 14.529,00 | 16.837,00 |
| 15 | Pepaya | 2.284,66 | 2.778,60 | 3.745,00 | 4.189,00 |
| 16 | Pisang | 44.011,44 | 39.494,00 | 35.798,00 | 26.706,00 |
| 17 | Rambutan | 70.973,59 | 72.912,80 | 61.688,00 | 50.655,00 |
| 18 | Salak | 394,72 | 270,49 | 303,00 | 660,00 |
| 19 | Sawo | 1.973,08 | 853,00 | 725,00 | 913,00 |
| 20 | Sirsak | 277,63 | 255,70 | 253,00 | 617,00 |
| 21 | Sukun | 871,31 | 730,29 | 693,00 | 2.289,00 |
| 22 | Apel | - | - | - | - |

> Satuan produksi: Kuintal (Ku) / Ton (sesuai sumber data)  
> Nilai `-` berarti tidak ada data produksi pada tahun tersebut (dianggap 0)

---

## 5. Kriteria Penilaian

Sistem menggunakan 4 kriteria dalam metode WP, seluruhnya bersifat **benefit** (semakin besar semakin baik).

| Kode | Nama Kriteria | Tipe | Deskripsi |
|---|---|---|---|
| C1 | Produksi | Benefit | Total produksi keseluruhan tahun 2021–2024 |
| C2 | Pertumbuhan Produksi | Benefit | Persentase pertumbuhan dari tahun pertama ke terakhir `((2024-2021)/2021 × 100%)` |
| C3 | Rata-rata Produksi | Benefit | Rata-rata produksi per tahun selama 2021–2024 |
| C4 | Konsistensi Produksi | Benefit | Diukur dari inverse Coefficient of Variation `(1 - (StdDev/Mean))`, semakin tinggi = semakin konsisten |

---

## 6. Metode Weighted Product (WP)

### 6.1 Rumus WP

**Langkah 1 — Normalisasi Bobot**

$$w_j = \frac{W_j}{\sum W_j}$$

**Langkah 2 — Hitung Vektor S (Skor tiap alternatif)**

$$S_i = \prod_{j=1}^{n} x_{ij}^{w_j}$$

- $x_{ij}$ = nilai kriteria ke-j untuk alternatif ke-i
- $w_j$ = bobot ternormalisasi kriteria ke-j (positif untuk benefit)

**Langkah 3 — Hitung Vektor V (Peringkat relatif)**

$$V_i = \frac{S_i}{\sum_{k=1}^{m} S_k}$$

**Langkah 4 — Ranking**

Alternatif dengan nilai $V_i$ tertinggi = komoditas terbaik.

### 6.2 Default Bobot Kriteria

Bobot awal dapat disesuaikan oleh admin melalui halaman pengaturan.

| Kriteria | Bobot Default |
|---|---|
| C1 — Produksi | 30% |
| C2 — Pertumbuhan Produksi | 25% |
| C3 — Rata-rata Produksi | 25% |
| C4 — Konsistensi Produksi | 20% |
| **Total** | **100%** |

---

## 7. Fitur Sistem

### 7.1 Halaman Dashboard
- Ringkasan jumlah komoditas yang dianalisis
- Top 3 komoditas terbaik (card summary)
- Grafik bar perbandingan total produksi semua komoditas
- Grafik tren produksi per tahun (line chart)

### 7.2 Halaman Data Komoditas
- Tabel data produksi 2021–2024 semua komoditas
- Fitur import data dari file Excel (.xlsx)
- Fitur tambah / edit / hapus data komoditas (admin only)
- Fitur export data ke Excel

### 7.3 Halaman Pengaturan Bobot Kriteria
- Input bobot untuk masing-masing kriteria (C1–C4) dalam bentuk slider atau input angka
- Validasi otomatis: total bobot harus = 100%
- Tombol simpan dan reset ke default

### 7.4 Halaman Perhitungan WP
- Tampilkan tahapan perhitungan secara transparan:
  - Tabel nilai asli setiap kriteria
  - Tabel normalisasi bobot
  - Tabel nilai Vektor S
  - Tabel nilai Vektor V
- Tombol "Hitung Ulang" setelah bobot diubah

### 7.5 Halaman Hasil & Peringkat
- Tabel peringkat komoditas dari nilai V tertinggi ke terendah
- Badge/label untuk peringkat 1, 2, 3
- Grafik bar nilai V semua komoditas
- Grafik radar (spider chart) top 5 komoditas berdasarkan semua kriteria
- Tombol export hasil ke PDF / Excel

### 7.6 Halaman Tentang Sistem
- Penjelasan singkat tentang metode WP
- Informasi penelitian (judul, instansi, tahun)

---

## 8. Struktur Database (Supabase)

### Tabel: `komoditas`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | Primary key |
| nama | varchar | Nama komoditas buah |
| nama_en | varchar | Nama dalam bahasa Inggris |
| created_at | timestamp | Waktu dibuat |

### Tabel: `produksi`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | Primary key |
| komoditas_id | uuid | Foreign key → komoditas.id |
| tahun | integer | Tahun produksi (2021–2024) |
| nilai | numeric | Nilai produksi |
| created_at | timestamp | Waktu dibuat |

### Tabel: `kriteria`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | Primary key |
| kode | varchar | C1, C2, C3, C4 |
| nama | varchar | Nama kriteria |
| tipe | varchar | `benefit` atau `cost` |
| bobot | numeric | Bobot dalam % (0–100) |

### Tabel: `hasil_wp`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | Primary key |
| komoditas_id | uuid | Foreign key → komoditas.id |
| nilai_s | numeric | Nilai vektor S |
| nilai_v | numeric | Nilai vektor V |
| peringkat | integer | Urutan peringkat |
| bobot_snapshot | jsonb | Snapshot bobot saat dihitung |
| calculated_at | timestamp | Waktu perhitungan |

---

## 9. Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Backend/API | Next.js API Routes |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Chart | Recharts |
| Excel Import/Export | SheetJS (xlsx) |
| PDF Export | jsPDF atau react-pdf |
| Deployment | Vercel (frontend) + Supabase Cloud |

---

## 10. Alur Penggunaan Sistem

```
1. Admin import data Excel
        ↓
2. Data tersimpan di Supabase
        ↓
3. Sistem hitung nilai tiap kriteria (C1–C4) otomatis
        ↓
4. Admin/User atur bobot kriteria (default sudah tersedia)
        ↓
5. Sistem jalankan perhitungan WP (Vektor S → Vektor V)
        ↓
6. Tampil tabel peringkat + grafik hasil
        ↓
7. User export hasil ke PDF/Excel
```

---

## 11. Batasan Sistem

- Data yang diolah adalah data produksi buah tahun 2021–2024 dari Kabupaten Parigi Moutong.
- Komoditas dengan nilai produksi 0 atau tidak ada data di semua tahun (seperti Apel) akan diabaikan dari proses perhitungan WP.
- Metode yang digunakan hanya Weighted Product (WP), tidak mencakup metode SPK lainnya.
- Sistem tidak terhubung ke sumber data eksternal secara real-time; data diperbarui secara manual melalui import Excel.

---

## 12. Milestone Pengembangan

| Fase | Deskripsi | Target |
|---|---|---|
| Fase 1 | Setup project Next.js + Supabase, struktur database, import data Excel | Minggu 1–2 |
| Fase 2 | Implementasi logika perhitungan WP (fungsi wp.ts) + unit test | Minggu 3 |
| Fase 3 | Halaman Data Komoditas + Bobot Kriteria | Minggu 4 |
| Fase 4 | Halaman Perhitungan + Hasil & Peringkat + Grafik | Minggu 5–6 |
| Fase 5 | Dashboard + Export PDF/Excel + Polish UI | Minggu 7 |
| Fase 6 | Testing, perbaikan bug, deployment ke Vercel | Minggu 8 |

---