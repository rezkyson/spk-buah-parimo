import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";
import type { ExcelProduksiRow } from "@/lib/excel";

type TypedSupabase = SupabaseClient<Database>;

export async function importProduksiRows(
  supabase: TypedSupabase,
  rows: ExcelProduksiRow[]
) {
  const komoditasPayload = rows.map((row) => ({
    nama: row.nama,
    nama_en: row.nama_en
  }));

  const { data: komoditas, error: komoditasError } = await supabase
    .from("komoditas")
    .upsert(komoditasPayload, { onConflict: "nama" })
    .select("id,nama");

  if (komoditasError) {
    throw komoditasError;
  }

  const komoditasByName = new Map(
    (komoditas ?? []).map((item) => [item.nama, item.id])
  );

  const produksiPayload = rows.flatMap((row) => {
    const komoditasId = komoditasByName.get(row.nama);

    if (!komoditasId) {
      throw new Error(`Komoditas gagal dibuat: ${row.nama}`);
    }

    return Object.entries(row.produksi).map(([tahun, nilai]) => ({
      komoditas_id: komoditasId,
      tahun: Number(tahun),
      nilai
    }));
  });

  const { error: produksiError } = await supabase
    .from("produksi")
    .upsert(produksiPayload, { onConflict: "komoditas_id,tahun" });

  if (produksiError) {
    throw produksiError;
  }

  return {
    importedKomoditas: komoditas?.length ?? 0,
    importedProduksi: produksiPayload.length
  };
}
