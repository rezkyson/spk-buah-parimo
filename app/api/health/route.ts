import { NextResponse } from "next/server";

export function GET() {
  const hasSupabaseUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasSupabaseAnonKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return NextResponse.json({
    ok: true,
    service: "spk-buah-parimo",
    supabase: {
      hasUrl: hasSupabaseUrl,
      hasAnonKey: hasSupabaseAnonKey
    }
  });
}
