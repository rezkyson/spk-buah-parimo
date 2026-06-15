import { getCommodityRows } from "@/lib/commodities";
import { getCriteriaRows } from "@/lib/criteria";
import { productionYears, type ProductionYear } from "@/lib/excel";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import {
  calculateWeightedProduct,
  type CommodityProductionInput,
  type CriteriaCode,
  type CriteriaWeightInput,
  type WeightedProductResult
} from "@/lib/wp";
import type { Json } from "@/types/database";

export type SavedWpResultRow = {
  id: string;
  komoditas_id: string;
  nama: string;
  nama_en: string | null;
  nilai_s: number;
  nilai_v: number;
  peringkat: number;
  bobot_snapshot: Json;
  calculated_at: string;
};

export async function getWpInputs() {
  const [commodities, criteriaRows] = await Promise.all([
    getCommodityRows(),
    getCriteriaRows()
  ]);

  const alternatives: CommodityProductionInput[] = commodities.map((row) => ({
    komoditasId: row.id,
    nama: row.nama,
    nama_en: row.nama_en,
    produksi: row.produksi
  }));

  const weights: CriteriaWeightInput[] = criteriaRows.map((row) => ({
    kode: row.kode as CriteriaCode,
    nama: row.nama,
    tipe: row.tipe,
    bobot: Number(row.bobot)
  }));

  return {
    alternatives,
    weights
  };
}

export async function calculateCurrentWpResult() {
  const { alternatives, weights } = await getWpInputs();
  return calculateWeightedProduct(alternatives, weights);
}

export async function calculateAndPersistWpResult() {
  const { alternatives, weights } = await getWpInputsWithServiceRole();
  const result = calculateWeightedProduct(alternatives, weights);
  await persistWpResult(result);
  return result;
}

async function getWpInputsWithServiceRole() {
  const supabase = createServiceRoleClient();
  const [
    { data: komoditasData, error: komoditasError },
    { data: produksiData, error: produksiError },
    { data: kriteriaData, error: kriteriaError }
  ] = await Promise.all([
    supabase.from("komoditas").select("id,nama,nama_en").order("nama"),
    supabase.from("produksi").select("komoditas_id,tahun,nilai"),
    supabase.from("kriteria").select("kode,nama,tipe,bobot").order("kode")
  ]);

  if (komoditasError) {
    throw komoditasError;
  }

  if (produksiError) {
    throw produksiError;
  }

  if (kriteriaError) {
    throw kriteriaError;
  }

  const produksiByCommodity = new Map<string, Record<ProductionYear, number>>();

  for (const item of produksiData ?? []) {
    const tahun = item.tahun as ProductionYear;

    if (!productionYears.includes(tahun)) {
      continue;
    }

    const current =
      produksiByCommodity.get(item.komoditas_id) ?? createEmptyProduction();
    current[tahun] = Number(item.nilai);
    produksiByCommodity.set(item.komoditas_id, current);
  }

  const alternatives: CommodityProductionInput[] = (komoditasData ?? []).map(
    (row) => ({
      komoditasId: row.id,
      nama: row.nama,
      nama_en: row.nama_en,
      produksi: produksiByCommodity.get(row.id) ?? createEmptyProduction()
    })
  );
  const weights: CriteriaWeightInput[] = (kriteriaData ?? []).map((row) => ({
    kode: row.kode as CriteriaCode,
    nama: row.nama,
    tipe: row.tipe,
    bobot: Number(row.bobot)
  }));

  return {
    alternatives,
    weights
  };
}

export async function persistWpResult(result: WeightedProductResult) {
  const supabase = createServiceRoleClient();
  const calculatedAt = new Date().toISOString();
  const bobotSnapshot = {
    weights: result.bobotSnapshot,
    adjustments: result.criteriaAdjustments,
    calculatedAt
  } satisfies Json;

  const { error: deleteError } = await supabase
    .from("hasil_wp")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (deleteError) {
    throw deleteError;
  }

  const payload = result.rankings.map((row) => ({
    komoditas_id: row.komoditasId,
    nilai_s: row.nilai_s,
    nilai_v: row.nilai_v,
    peringkat: row.peringkat,
    bobot_snapshot: bobotSnapshot,
    calculated_at: calculatedAt
  }));

  const { error: insertError } = await supabase.from("hasil_wp").insert(payload);

  if (insertError) {
    throw insertError;
  }
}

export async function getLatestSavedWpResults(): Promise<SavedWpResultRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("hasil_wp")
    .select(
      "id,komoditas_id,nilai_s,nilai_v,peringkat,bobot_snapshot,calculated_at,komoditas(nama,nama_en)"
    )
    .order("peringkat", { ascending: true });

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as Array<{
    id: string;
    komoditas_id: string;
    nilai_s: number;
    nilai_v: number;
    peringkat: number;
    bobot_snapshot: Json;
    calculated_at: string;
    komoditas: { nama: string; nama_en: string | null } | null;
  }>).map((row) => ({
    id: row.id,
    komoditas_id: row.komoditas_id,
    nama: row.komoditas?.nama ?? "-",
    nama_en: row.komoditas?.nama_en ?? null,
    nilai_s: Number(row.nilai_s),
    nilai_v: Number(row.nilai_v),
    peringkat: row.peringkat,
    bobot_snapshot: row.bobot_snapshot,
    calculated_at: row.calculated_at
  }));
}

function createEmptyProduction(): Record<ProductionYear, number> {
  return {
    2021: 0,
    2022: 0,
    2023: 0,
    2024: 0
  };
}
