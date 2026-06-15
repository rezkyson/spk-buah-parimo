import Link from "next/link";
import {
  BarChart3,
  CalendarClock,
  Medal,
  Trophy,
  UsersRound
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { PageHeading } from "@/components/page-heading";
import { RecalculateButton } from "@/components/recalculate-button";
import { StateMessage } from "@/components/state-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WpResultsClient } from "@/components/wp-results-client";
import { getCurrentUser, isAdminUser } from "@/lib/auth";
import { formatDecimal, formatNumber } from "@/lib/format";
import {
  calculateCurrentWpResult,
  getLatestSavedWpResults
} from "@/lib/wp-data";

export default async function HasilRankingPage() {
  const user = await getCurrentUser();
  const isAdmin = isAdminUser(user);

  try {
    const [result, savedRows] = await Promise.all([
      calculateCurrentWpResult(),
      getLatestSavedWpResults()
    ]);
    const savedAt = savedRows[0]?.calculated_at ?? null;
    const top = result.rankings[0];

    return (
      <AppShell active="results">
        <PageHeading
          actions={
            <>
              <Button asChild variant="outline">
                <Link href="/perhitungan-wp">Lihat Perhitungan</Link>
              </Button>
              <RecalculateButton isAdmin={isAdmin} />
            </>
          }
          description="Urutan komoditas terbaik berdasarkan data dan bobot yang aktif."
          eyebrow="Hasil Ranking"
          icon={Trophy}
          meta={
            savedAt ? (
              <Badge className="gap-1.5" variant="outline">
                <CalendarClock className="h-3.5 w-3.5" />
                {new Intl.DateTimeFormat("id-ID", {
                  dateStyle: "medium",
                  timeStyle: "short"
                }).format(new Date(savedAt))}
              </Badge>
            ) : (
              <Badge variant="warning">Belum tersimpan</Badge>
            )
          }
          title="Peringkat komoditas buah terbaik"
        />

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <MetricCard
            icon={UsersRound}
            label="Komoditas dianalisis"
            tone="primary"
            value={formatNumber(result.rankings.length, 0)}
          />
          <MetricCard
            icon={Medal}
            label="Peringkat 1"
            tone="emerald"
            value={top?.nama ?? "-"}
          />
          <MetricCard
            icon={BarChart3}
            label="Nilai V tertinggi"
            tone="sky"
            value={top ? formatDecimal(top.nilai_v, 8) : "-"}
          />
        </section>

        <WpResultsClient result={result} savedAt={savedAt} />
      </AppShell>
    );
  } catch (error) {
    return (
      <AppShell active="results">
        <StateMessage
          description={
            error instanceof Error
              ? error.message
              : "Hasil ranking belum bisa ditampilkan."
          }
          title="Gagal memuat hasil"
          type="error"
        />
      </AppShell>
    );
  }
}
