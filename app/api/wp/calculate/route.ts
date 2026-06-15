import { NextResponse } from "next/server";

import { getCurrentUser, isAdminUser } from "@/lib/auth";
import { calculateAndPersistWpResult } from "@/lib/wp-data";

export const runtime = "nodejs";

export async function POST() {
  const user = await getCurrentUser();

  if (!isAdminUser(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await calculateAndPersistWpResult();

    return NextResponse.json({
      ok: true,
      rankings: result.rankings.length,
      top: result.rankings[0] ?? null
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Perhitungan WP gagal dijalankan."
      },
      { status: 400 }
    );
  }
}
