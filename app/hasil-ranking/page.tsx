import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { RecalculateButton } from "@/components/recalculate-button";
import { StateMessage } from "@/components/state-message";
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
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase text-primary">
              Hasil Ranking
            </p>
            <h1 className="mt-2 text-3xl font-semibold">
              Peringkat komoditas buah terbaik
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Ranking dihitung dari nilai V tertinggi menggunakan bobot kriteria
              terbaru.
            </p>
            {savedAt ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Hasil terakhir disimpan pada{" "}
                {new Intl.DateTimeFormat("id-ID", {
                  dateStyle: "medium",
                  timeStyle: "short"
                }).format(new Date(savedAt))}.
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                Hasil belum pernah disimpan. Perhitungan yang tampil adalah hasil
                terbaru dari data saat ini.
              </p>
            )}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:items-start">
            <Button asChild variant="outline">
              <Link href="/perhitungan-wp">Lihat Perhitungan</Link>
            </Button>
            <RecalculateButton isAdmin={isAdmin} />
          </div>
        </div>

        <section className="mb-6 grid gap-3 md:grid-cols-3">
          <Metric
            label="Komoditas dianalisis"
            value={formatNumber(result.rankings.length, 0)}
          />
          <Metric label="Peringkat 1" value={top?.nama ?? "-"} />
          <Metric
            label="Nilai V tertinggi"
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
