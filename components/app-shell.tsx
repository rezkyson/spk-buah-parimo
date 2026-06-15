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

export function AppShell({ children, active }: AppShellProps) {
  return (
    <div className="min-h-screen text-foreground">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-white/85 shadow-sm backdrop-blur-xl">
        <div className="container flex min-h-16 flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between">
          <Link className="group flex items-center gap-3" href="/">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/20 transition-transform group-hover:-translate-y-0.5">
              <Leaf className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold leading-4 tracking-tight">
                SPK Buah Parimo
              </span>
              <span className="block text-xs text-muted-foreground">
                Komoditas Buah
              </span>
            </span>
          </Link>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <nav className="flex flex-wrap gap-1 rounded-lg border border-border/70 bg-muted/45 p-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.key;

                return (
                  <Link
                    className={cn(
                      "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-white/80 hover:text-foreground",
                      isActive &&
                        "bg-white text-primary shadow-sm ring-1 ring-border/70"
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

      <main className="container py-6 md:py-8">{children}</main>
    </div>
  );
}
