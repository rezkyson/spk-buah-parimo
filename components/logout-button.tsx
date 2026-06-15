"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/browser";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <Button onClick={handleLogout} size="sm" variant="outline">
      Keluar
    </Button>
  );
}
