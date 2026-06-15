import Link from "next/link";
import {
  BarChart3,
  Calculator,
  Database,
  Leaf,
  SlidersHorizontal,
  Trophy
} from "lucide-react";

import { AuthStatus } from "@/components/auth-status";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: React.ReactNode;
  active?: "home" | "data" | "weights" | "calculation" | "results";
};

const navItems = [
  {
    href: "/",
    label: "Beranda",
    icon: BarChart3,
    key: "home"
  },
  {
    href: "/data-komoditas",
    label: "Data Komoditas",
    icon: Database,
    key: "data"
  },
  {
    href: "/pengaturan-bobot",
    label: "Bobot Kriteria",
    icon: SlidersHorizontal,
    key: "weights"
  },
  {
    href: "/perhitungan-wp",
    label: "Perhitungan",
    icon: Calculator,
    key: "calculation"
  },
  {
    href: "/hasil-ranking",
    label: "Hasil",
    icon: Trophy,
    key: "results"
  }
] as const;

export function AppShell({ children, active = "home" }: AppShellProps) {
  return (
    <div className="min-h-screen bg-stone-50 text-foreground">
      <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
        <div className="container flex min-h-16 flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between">
          <Link className="flex items-center gap-3" href="/">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Leaf className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold leading-4">
                SPK Buah Parimo
              </span>
              <span className="block text-xs text-muted-foreground">
                Weighted Product
              </span>
            </span>
          </Link>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <nav className="flex flex-wrap gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.key;

                return (
                  <Link
                    className={cn(
                      "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                      isActive && "bg-primary/10 text-primary"
                    )}
                    href={item.href}
                    key={item.href}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <AuthStatus />
          </div>
        </div>
      </header>

      <main className="container py-8">{children}</main>
    </div>
  );
}
