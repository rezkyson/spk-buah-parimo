import { NextResponse } from "next/server";
import { z } from "zod";

import { productionYears } from "@/lib/excel";
import { getCurrentUser, isAdminUser } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export const runtime = "nodejs";

const productionSchema = z.object({
  "2021": z.coerce.number().min(0),
  "2022": z.coerce.number().min(0),
  "2023": z.coerce.number().min(0),
  "2024": z.coerce.number().min(0)
});

const commoditySchema = z.object({
  id: z.string().uuid().optional(),
  nama: z.string().trim().min(1, "Nama komoditas wajib diisi."),
  nama_en: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null)),
  produksi: productionSchema
});

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!isAdminUser(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = commoditySchema.parse(await request.json());
  const supabase = createServiceRoleClient();

  const komoditasResult = payload.id
    ? await supabase
        .from("komoditas")
        .update({
          nama: payload.nama,
          nama_en: payload.nama_en
        })
        .eq("id", payload.id)
        .select("id")
        .single()
    : await supabase
        .from("komoditas")
        .insert({
          nama: payload.nama,
          nama_en: payload.nama_en
        })
        .select("id")
        .single();

  if (komoditasResult.error) {
    return NextResponse.json(
      { error: komoditasResult.error.message },
      { status: 400 }
    );
  }

  const komoditasId = komoditasResult.data.id;
  const produksiPayload = productionYears.map((tahun) => ({
    komoditas_id: komoditasId,
    tahun,
    nilai: payload.produksi[tahun]
  }));

  const { error: produksiError } = await supabase
    .from("produksi")
    .upsert(produksiPayload, { onConflict: "komoditas_id,tahun" });

  if (produksiError) {
    return NextResponse.json({ error: produksiError.message }, { status: 400 });
  }

  return NextResponse.json({
    id: komoditasId,
    ok: true
  });
}
