create extension if not exists pgcrypto;

create table if not exists public.komoditas (
  id uuid primary key default gen_random_uuid(),
  nama varchar not null unique,
  nama_en varchar,
  created_at timestamptz not null default now()
);

create table if not exists public.produksi (
  id uuid primary key default gen_random_uuid(),
  komoditas_id uuid not null references public.komoditas(id) on delete cascade,
  tahun integer not null check (tahun between 2021 and 2024),
  nilai numeric not null default 0 check (nilai >= 0),
  created_at timestamptz not null default now(),
  unique (komoditas_id, tahun)
);

create table if not exists public.kriteria (
  id uuid primary key default gen_random_uuid(),
  kode varchar not null unique,
  nama varchar not null,
  tipe varchar not null default 'benefit' check (tipe in ('benefit', 'cost')),
  bobot numeric not null check (bobot >= 0 and bobot <= 100),
  created_at timestamptz not null default now()
);

create table if not exists public.hasil_wp (
  id uuid primary key default gen_random_uuid(),
  komoditas_id uuid not null references public.komoditas(id) on delete cascade,
  nilai_s numeric not null,
  nilai_v numeric not null,
  peringkat integer not null,
  bobot_snapshot jsonb not null,
  calculated_at timestamptz not null default now()
);

create index if not exists produksi_komoditas_id_idx on public.produksi(komoditas_id);
create index if not exists produksi_tahun_idx on public.produksi(tahun);
create index if not exists hasil_wp_komoditas_id_idx on public.hasil_wp(komoditas_id);
create index if not exists hasil_wp_peringkat_idx on public.hasil_wp(peringkat);

insert into public.kriteria (kode, nama, tipe, bobot)
values
  ('C1', 'Produksi', 'benefit', 30),
  ('C2', 'Pertumbuhan Produksi', 'benefit', 25),
  ('C3', 'Rata-rata Produksi', 'benefit', 25),
  ('C4', 'Konsistensi Produksi', 'benefit', 20)
on conflict (kode) do update
set
  nama = excluded.nama,
  tipe = excluded.tipe,
  bobot = excluded.bobot;

alter table public.komoditas enable row level security;
alter table public.produksi enable row level security;
alter table public.kriteria enable row level security;
alter table public.hasil_wp enable row level security;

drop policy if exists "Public read komoditas" on public.komoditas;
create policy "Public read komoditas"
on public.komoditas for select
using (true);

drop policy if exists "Public read produksi" on public.produksi;
create policy "Public read produksi"
on public.produksi for select
using (true);

drop policy if exists "Public read kriteria" on public.kriteria;
create policy "Public read kriteria"
on public.kriteria for select
using (true);

drop policy if exists "Public read hasil_wp" on public.hasil_wp;
create policy "Public read hasil_wp"
on public.hasil_wp for select
using (true);

drop policy if exists "Authenticated write komoditas" on public.komoditas;
create policy "Authenticated write komoditas"
on public.komoditas for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated write produksi" on public.produksi;
create policy "Authenticated write produksi"
on public.produksi for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated write kriteria" on public.kriteria;
create policy "Authenticated write kriteria"
on public.kriteria for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated write hasil_wp" on public.hasil_wp;
create policy "Authenticated write hasil_wp"
on public.hasil_wp for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');
