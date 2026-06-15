import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return data.user;
}

export function isAdminUser(user: User | null) {
  return Boolean(user);
}

export async function requireAdminUser() {
  const user = await getCurrentUser();

  if (!isAdminUser(user)) {
    throw new Error("Unauthorized");
  }

  return user;
}
