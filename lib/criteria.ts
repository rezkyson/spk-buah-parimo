import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type CriteriaRow = Database["public"]["Tables"]["kriteria"]["Row"];

export async function getCriteriaRows() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("kriteria")
    .select("id,kode,nama,tipe,bobot,created_at")
    .order("kode", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as CriteriaRow[];
}
