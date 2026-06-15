import { createClient } from "@/lib/supabase/server";
import { productionYears, type ProductionYear } from "@/lib/excel";

export type CommodityRow = {
  id: string;
  nama: string;
  nama_en: string | null;
  produksi: Record<ProductionYear, number>;
  total: number;
};

type KomoditasRecord = {
  id: string;
  nama: string;
  nama_en: string | null;
};

type ProduksiRecord = {
  komoditas_id: string;
  tahun: number;
  nilai: number;
};

export async function getCommodityRows(): Promise<CommodityRow[]> {
  const supabase = createClient();

  const [
    { data: komoditasData, error: komoditasError },
    { data: produksiData, error: produksiError }
  ] =
    await Promise.all([
      supabase.from("komoditas").select("id,nama,nama_en").order("nama", {
        ascending: true
      }),
      supabase.from("produksi").select("komoditas_id,tahun,nilai")
    ]);

  if (komoditasError) {
    throw komoditasError;
  }

  if (produksiError) {
    throw produksiError;
  }

  const komoditas = (komoditasData ?? []) as KomoditasRecord[];
  const produksi = (produksiData ?? []) as ProduksiRecord[];
  const produksiByCommodity = new Map<string, Record<ProductionYear, number>>();

  for (const item of produksi) {
    const tahun = item.tahun as ProductionYear;

    if (!productionYears.includes(tahun)) {
      continue;
    }

    const current =
      produksiByCommodity.get(item.komoditas_id) ?? createEmptyProduction();
    current[tahun] = Number(item.nilai);
    produksiByCommodity.set(item.komoditas_id, current);
  }

  return komoditas.map((item) => {
    const production = produksiByCommodity.get(item.id) ?? createEmptyProduction();
    const total = productionYears.reduce((sum, year) => sum + production[year], 0);

    return {
      id: item.id,
      nama: item.nama,
      nama_en: item.nama_en,
      produksi: production,
      total
    };
  });
}

function createEmptyProduction(): Record<ProductionYear, number> {
  return {
    2021: 0,
    2022: 0,
    2023: 0,
    2024: 0
  };
}
