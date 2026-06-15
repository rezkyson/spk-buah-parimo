import Link from "next/link";
import { ShieldCheck, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/components/logout-button";
import { getCurrentUser, isAdminUser } from "@/lib/auth";

export async function AuthStatus() {
  const user = await getCurrentUser();

  if (!isAdminUser(user)) {
    return (
      <Button asChild size="sm" variant="outline">
        <Link href="/login">
          <UserRound className="mr-2 h-4 w-4" />
          Login Admin
        </Link>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Badge className="hidden gap-1.5 md:inline-flex" variant="success">
        <ShieldCheck className="h-3.5 w-3.5" />
        Admin
      </Badge>
      <span className="hidden max-w-44 truncate text-sm text-muted-foreground xl:block">
        {user?.email}
      </span>
      <LogoutButton />
    </div>
  );
}
