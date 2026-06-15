import Link from "next/link";
import {
  ArrowRight,
  Calculator,
  Database,
  SlidersHorizontal,
  Trophy
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { DashboardChartsClient } from "@/components/dashboard-charts-client";
import { StateMessage } from "@/components/state-message";
import { Button } from "@/components/ui/button";
import { getCommodityRows } from "@/lib/commodities";
import { formatDecimal, formatNumber } from "@/lib/format";
import { calculateCurrentWpResult } from "@/lib/wp-data";

const quickActions = [
  {
    title: "Data Komoditas",
    description: "Kelola data produksi 2021-2024.",
    href: "/data-komoditas",
    icon: Database
  },
  {
    title: "Bobot Kriteria",
    description: "Sesuaikan bobot C1-C4.",
    href: "/pengaturan-bobot",
    icon: SlidersHorizontal
  },
  {
    title: "Perhitungan WP",
    description: "Lihat proses S dan V.",
    href: "/perhitungan-wp",
    icon: Calculator
  },
  {
    title: "Hasil Ranking",
    description: "Buka ranking dan export.",
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
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase text-primary">
              Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-semibold">
              Ringkasan komoditas buah Parigi Moutong
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Pantau data produksi, komoditas unggulan, dan tren tahunan sebelum
              masuk ke detail perhitungan Weighted Product.
            </p>
          </div>
          <Button asChild>
            <Link href="/hasil-ranking">
              Lihat Ranking
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <section className="mb-6 grid gap-3 md:grid-cols-3">
          <Metric label="Total komoditas" value={formatNumber(commodities.length, 0)} />
          <Metric
            label="Komoditas dianalisis"
            value={formatNumber(activeCommodities, 0)}
          />
          <Metric label="Total produksi" value={formatNumber(totalProduction)} />
        </section>

        <section className="mb-6 rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-semibold">Top 3 Komoditas</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Berdasarkan nilai V terbaru dengan bobot aktif.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/perhitungan-wp">Lihat Tahapan</Link>
            </Button>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {topThree.map((row) => (
              <div className="rounded-lg border bg-muted/20 p-4" key={row.komoditasId}>
                <p className="text-sm text-muted-foreground">
                  Peringkat {row.peringkat}
                </p>
                <h3 className="mt-2 text-xl font-semibold">{row.nama}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Nilai V: {formatDecimal(row.nilai_v, 8)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="mb-6">
          <DashboardChartsClient
            productionData={productionData}
            trendData={trendData}
          />
        </div>

        <section className="grid gap-3 md:grid-cols-4">
          {quickActions.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                className="rounded-lg border bg-white p-4 shadow-sm transition-colors hover:border-primary/40"
                href={item.href}
                key={item.href}
              >
                <Icon className="h-5 w-5 text-primary" />
                <h2 className="mt-3 font-semibold">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
