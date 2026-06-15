import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser, isAdminUser } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export const runtime = "nodejs";

const paramsSchema = z.object({
  id: z.string().uuid()
});

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();

  if (!isAdminUser(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = paramsSchema.parse(params);
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("komoditas").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
