import Link from "next/link";

import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/logout-button";
import { getCurrentUser, isAdminUser } from "@/lib/auth";

export async function AuthStatus() {
  const user = await getCurrentUser();

  if (!isAdminUser(user)) {
    return (
      <Button asChild size="sm" variant="outline">
        <Link href="/login">Login Admin</Link>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden max-w-48 truncate text-sm text-muted-foreground md:block">
        {user?.email}
      </span>
      <LogoutButton />
    </div>
  );
}
