import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import {
  Calculator,
  CalendarClock,
  Database,
  Percent,
  Sigma,
  TableProperties
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { PageHeading } from "@/components/page-heading";
import { RecalculateButton } from "@/components/recalculate-button";
import { StateMessage } from "@/components/state-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { getCurrentUser, isAdminUser } from "@/lib/auth";
import { formatDecimal, formatNumber } from "@/lib/format";
import {
  calculateCurrentWpResult,
  getLatestSavedWpResults
} from "@/lib/wp-data";
import { getOrderedCriteriaCodes } from "@/lib/wp-labels";

export default async function PerhitunganWpPage() {
  const user = await getCurrentUser();
  const isAdmin = isAdminUser(user);

  try {
    const [result, savedRows] = await Promise.all([
      calculateCurrentWpResult(),
      getLatestSavedWpResults()
    ]);
    const lastCalculatedAt = savedRows[0]?.calculated_at;
    const criteriaCodes = getOrderedCriteriaCodes();

    return (
      <AppShell active="calculation">
        <PageHeading
          actions={
            <>
              <Button asChild variant="outline">
                <Link href="/hasil-ranking">Lihat Hasil</Link>
              </Button>
              <RecalculateButton isAdmin={isAdmin} />
            </>
          }
          description="Tinjau nilai kriteria, bobot, dan skor yang membentuk peringkat akhir."
          eyebrow="Perhitungan"
          icon={Calculator}
          meta={
            lastCalculatedAt ? (
              <Badge className="gap-1.5" variant="outline">
                <CalendarClock className="h-3.5 w-3.5" />
                {new Intl.DateTimeFormat("id-ID", {
                  dateStyle: "medium",
                  timeStyle: "short"
                }).format(new Date(lastCalculatedAt))}
              </Badge>
            ) : null
          }
          title="Tahapan perhitungan"
          tone="amber"
        />

        <section className="mb-6 grid gap-4 md:grid-cols-2">
          <MetricCard
            icon={Database}
            label="Komoditas dianalisis"
            tone="primary"
            value={formatNumber(result.rankings.length, 0)}
          />
          <MetricCard
            icon={Percent}
            label="Total bobot"
            tone="amber"
            value={`${formatNumber(
              result.normalizedWeights.reduce((sum, row) => sum + row.bobot, 0),
              0
            )}%`}
          />
        </section>

        <div className="space-y-6">
          <TableSection icon={TableProperties} title="Nilai Kriteria">
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>Komoditas</TableHead>
                {criteriaCodes.map((kode) => (
                  <TableHead className="text-right" key={kode}>
                    {kode}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.criteriaTable.map((row) => (
                <TableRow key={row.komoditasId}>
                  <TableCell className="font-medium">{row.nama}</TableCell>
                  {criteriaCodes.map((kode) => (
                    <TableCell className="text-right tabular-nums" key={kode}>
                      {formatDecimal(row.kriteria[kode], 4)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </TableSection>

          <TableSection icon={Percent} title="Bobot Kriteria">
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>Kode</TableHead>
                <TableHead>Kriteria</TableHead>
                <TableHead className="text-right">Bobot</TableHead>
                <TableHead className="text-right">Porsi bobot</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.normalizedWeights.map((row) => (
                <TableRow key={row.kode}>
                  <TableCell>
                    <Badge variant="outline">{row.kode}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{row.nama}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatNumber(row.bobot)}%
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatDecimal(row.normalizedWeight, 6)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </TableSection>

          <TableSection icon={Sigma} title="Skor S">
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>Komoditas</TableHead>
                <TableHead className="text-right">Nilai S</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.vectorS.map((row) => (
                <TableRow key={row.komoditasId}>
                  <TableCell className="font-medium">{row.nama}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatDecimal(row.nilai_s, 8)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </TableSection>

          <TableSection icon={Sigma} title="Skor V">
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>Komoditas</TableHead>
                <TableHead className="text-right">Nilai V</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.vectorV.map((row) => (
                <TableRow key={row.komoditasId}>
                  <TableCell className="font-medium">{row.nama}</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {formatDecimal(row.nilai_v, 8)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </TableSection>
        </div>
      </AppShell>
    );
  } catch (error) {
    return (
      <AppShell active="calculation">
        <StateMessage
          description={
            error instanceof Error
              ? error.message
              : "Perhitungan belum bisa dijalankan."
          }
          title="Gagal menghitung"
          type="error"
        />
      </AppShell>
    );
  }
}

function TableSection({
  children,
  icon: Icon,
  title
}: {
  children: ReactNode;
  icon: ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-center gap-3 border-b bg-muted/20 space-y-0">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <Table className="min-w-[760px]">{children}</Table>
    </Card>
  );
}
