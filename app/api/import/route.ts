import { NextResponse } from "next/server";

import { parseExcelBuffer } from "@/lib/excel";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { importProduksiRows } from "@/lib/supabase/import-produksi";
import { getCurrentUser, isAdminUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    message: "Import file Excel tersedia melalui halaman Data Komoditas."
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!isAdminUser(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Field file wajib diisi dengan file .xlsx." },
      { status: 400 }
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const rows = parseExcelBuffer(Buffer.from(arrayBuffer));
  const supabase = createServiceRoleClient();
  const result = await importProduksiRows(supabase, rows);

  return NextResponse.json({
    imported: result.importedKomoditas,
    produksiRows: result.importedProduksi
  });
}
