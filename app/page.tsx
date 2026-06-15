import Link from "next/link";
import {
  ArrowRight,
  Award,
  Calculator,
  Database,
  LayoutDashboard,
  LineChart,
  Medal,
  SlidersHorizontal,
  Sprout,
  TrendingUp,
  Trophy
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { DashboardChartsClient } from "@/components/dashboard-charts-client";
import { MetricCard } from "@/components/metric-card";
import { PageHeading } from "@/components/page-heading";
import { StateMessage } from "@/components/state-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCommodityRows } from "@/lib/commodities";
import { formatDecimal, formatNumber } from "@/lib/format";
import { calculateCurrentWpResult } from "@/lib/wp-data";

const quickActions = [
  {
    title: "Data Komoditas",
    label: "Kelola data",
    href: "/data-komoditas",
    icon: Database
  },
  {
    title: "Bobot Kriteria",
    label: "Atur bobot",
    href: "/pengaturan-bobot",
    icon: SlidersHorizontal
  },
  {
    title: "Perhitungan",
    label: "Cek tahapan",
    href: "/perhitungan-wp",
    icon: Calculator
  },
  {
    title: "Hasil Ranking",
    label: "Lihat hasil",
    href: "/hasil-ranking",
    icon: Trophy
  }
];

const years = [2021, 2022, 2023, 2024] as const;

export default async function Home() {
  try {
    const [commodities, wpResult] = await Promise.all([
      getCommodityRows(),
      calculateCurrentWpResult()
    ]);
    const activeCommodities = commodities.filter((row) => row.total > 0).length;
    const totalProduction = commodities.reduce((sum, row) => sum + row.total, 0);
    const topThree = wpResult.rankings.slice(0, 3);
    const productionData = commodities
      .map((row) => ({
        name: row.nama,
        total: row.total
      }))
      .sort((a, b) => b.total - a.total);
    const trendData = years.map((year) => ({
      tahun: String(year),
      total: commodities.reduce((sum, row) => sum + row.produksi[year], 0)
    }));

    return (
      <AppShell active="home">
        <PageHeading
          actions={
            <Button asChild>
              <Link href="/hasil-ranking">
                Lihat Ranking
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          }
          description="Lihat kondisi data, komoditas unggulan, dan ringkasan produksi dalam satu layar."
          eyebrow="Dashboard"
          icon={LayoutDashboard}
          title="Ringkasan komoditas buah Parigi Moutong"
        />

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <MetricCard
            icon={Sprout}
            label="Total komoditas"
            tone="primary"
            value={formatNumber(commodities.length, 0)}
          />
          <MetricCard
            icon={Award}
            label="Komoditas dianalisis"
            tone="sky"
            value={formatNumber(activeCommodities, 0)}
          />
          <MetricCard
            icon={TrendingUp}
            label="Total produksi"
            tone="emerald"
            value={formatNumber(totalProduction)}
          />
        </section>

        <Card className="mb-6 overflow-hidden">
          <CardHeader className="flex flex-col gap-3 border-b bg-muted/20 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Top 3 Komoditas</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Komoditas dengan skor terbaik saat ini.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/perhitungan-wp">
                Lihat Tahapan
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="grid gap-4 p-5 md:grid-cols-3">
            {topThree.map((row) => (
              <div
                className="rounded-lg border bg-white p-4 shadow-sm transition-transform hover:-translate-y-0.5"
                key={row.komoditasId}
              >
                <div className="flex items-center justify-between gap-3">
                  <Badge variant={row.peringkat === 1 ? "default" : "secondary"}>
                    Peringkat {row.peringkat}
                  </Badge>
                  <Medal className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 truncate text-xl font-semibold">{row.nama}</h3>
                <p className="mt-2 font-mono text-sm text-muted-foreground">
                  {formatDecimal(row.nilai_v, 8)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="mb-6">
          <DashboardChartsClient
            productionData={productionData}
            trendData={trendData}
          />
        </div>

        <section className="grid gap-4 md:grid-cols-4">
          {quickActions.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                className="group rounded-lg border border-border/80 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                href={item.href}
                key={item.href}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>
                <h2 className="mt-4 font-semibold">{item.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
              </Link>
            );
          })}
        </section>
      </AppShell>
    );
  } catch (error) {
    return (
      <AppShell active="home">
        <StateMessage
          description={
            error instanceof Error
              ? error.message
              : "Dashboard belum bisa dimuat."
          }
          title="Gagal memuat dashboard"
          type="error"
        />
      </AppShell>
    );
  }
}
