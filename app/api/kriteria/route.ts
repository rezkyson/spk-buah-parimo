import { NextResponse } from "next/server";
import { z } from "zod";

import { criteriaCodes } from "@/lib/wp";
import { getCurrentUser, isAdminUser } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export const runtime = "nodejs";

const criteriaSchema = z.object({
  weights: z.array(
    z.object({
      kode: z.enum(criteriaCodes),
      bobot: z.coerce.number().min(0).max(100)
    })
  )
});

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!isAdminUser(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = criteriaSchema.parse(await request.json());
  const total = payload.weights.reduce((sum, item) => sum + item.bobot, 0);

  if (Math.abs(total - 100) > 0.000001) {
    return NextResponse.json(
      { error: "Total bobot kriteria harus 100%." },
      { status: 400 }
    );
  }

  const supabase = createServiceRoleClient();

  for (const item of payload.weights) {
    const { error } = await supabase
      .from("kriteria")
      .update({ bobot: item.bobot })
      .eq("kode", item.kode);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  return NextResponse.json({ ok: true });
}
