import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { RecalculateButton } from "@/components/recalculate-button";
import { StateMessage } from "@/components/state-message";
import { Button } from "@/components/ui/button";
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
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase text-primary">
              Perhitungan WP
            </p>
            <h1 className="mt-2 text-3xl font-semibold">
              Tahapan perhitungan Weighted Product
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Halaman ini menampilkan nilai kriteria asli, bobot ternormalisasi,
              vektor S, dan vektor V sebelum hasil dirangking.
            </p>
            {lastCalculatedAt ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Hasil terakhir disimpan pada{" "}
                {new Intl.DateTimeFormat("id-ID", {
                  dateStyle: "medium",
                  timeStyle: "short"
                }).format(new Date(lastCalculatedAt))}.
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:items-start">
            <Button asChild variant="outline">
              <Link href="/hasil-ranking">Lihat Hasil</Link>
            </Button>
            <RecalculateButton isAdmin={isAdmin} />
          </div>
        </div>

        <section className="mb-6 grid gap-3 md:grid-cols-3">
          <Metric
            label="Komoditas dianalisis"
            value={formatNumber(result.rankings.length, 0)}
          />
          <Metric
            label="Total bobot"
            value={`${formatNumber(
              result.normalizedWeights.reduce((sum, row) => sum + row.bobot, 0),
              0
            )}%`}
          />
          <Metric
            label="Offset kriteria"
            value={formatNumber(
              result.criteriaAdjustments.filter((row) => row.offset > 0).length,
              0
            )}
          />
        </section>

        {result.criteriaAdjustments.some((row) => row.offset > 0) ? (
          <section className="mb-6 rounded-lg border bg-white p-4 text-sm shadow-sm">
            <h2 className="font-semibold">Penyesuaian nilai WP</h2>
            <p className="mt-2 leading-6 text-muted-foreground">
              WP membutuhkan nilai positif. Nilai asli tetap ditampilkan apa
              adanya, sedangkan matriks yang masuk rumus diberi offset jika ada
              nilai 0 atau negatif.
            </p>
            <div className="mt-3 grid gap-2 md:grid-cols-4">
              {result.criteriaAdjustments.map((row) => (
                <div className="rounded-md bg-muted/50 p-3" key={row.kode}>
                  <p className="font-medium">{row.kode}</p>
                  <p className="text-muted-foreground">
                    Offset: {formatDecimal(row.offset, 4)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <div className="space-y-6">
          <TableSection title="Nilai asli setiap kriteria">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className="px-3 py-3 font-semibold">Komoditas</th>
                {criteriaCodes.map((kode) => (
                  <th className="px-3 py-3 text-right font-semibold" key={kode}>
                    {kode}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.criteriaTable.map((row) => (
                <tr className="border-b last:border-0" key={row.komoditasId}>
                  <td className="px-3 py-3 font-medium">{row.nama}</td>
                  {criteriaCodes.map((kode) => (
                    <td className="px-3 py-3 text-right" key={kode}>
                      {formatDecimal(row.kriteria[kode], 4)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </TableSection>

          <TableSection title="Normalisasi bobot">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className="px-3 py-3 font-semibold">Kode</th>
                <th className="px-3 py-3 font-semibold">Kriteria</th>
                <th className="px-3 py-3 text-right font-semibold">Bobot</th>
                <th className="px-3 py-3 text-right font-semibold">
                  Bobot normal
                </th>
                <th className="px-3 py-3 text-right font-semibold">Eksponen</th>
              </tr>
            </thead>
            <tbody>
              {result.normalizedWeights.map((row) => (
                <tr className="border-b last:border-0" key={row.kode}>
                  <td className="px-3 py-3 font-medium">{row.kode}</td>
                  <td className="px-3 py-3">{row.nama}</td>
                  <td className="px-3 py-3 text-right">{formatNumber(row.bobot)}%</td>
                  <td className="px-3 py-3 text-right">
                    {formatDecimal(row.normalizedWeight, 6)}
                  </td>
                  <td className="px-3 py-3 text-right">
                    {formatDecimal(row.exponent, 6)}
                  </td>
                </tr>
              ))}
            </tbody>
          </TableSection>

          <TableSection title="Vektor S">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className="px-3 py-3 font-semibold">Komoditas</th>
                <th className="px-3 py-3 text-right font-semibold">Nilai S</th>
              </tr>
            </thead>
            <tbody>
              {result.vectorS.map((row) => (
                <tr className="border-b last:border-0" key={row.komoditasId}>
                  <td className="px-3 py-3 font-medium">{row.nama}</td>
                  <td className="px-3 py-3 text-right">
                    {formatDecimal(row.nilai_s, 8)}
                  </td>
                </tr>
              ))}
            </tbody>
          </TableSection>

          <TableSection title="Vektor V">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className="px-3 py-3 font-semibold">Komoditas</th>
                <th className="px-3 py-3 text-right font-semibold">Nilai V</th>
              </tr>
            </thead>
            <tbody>
              {result.vectorV.map((row) => (
                <tr className="border-b last:border-0" key={row.komoditasId}>
                  <td className="px-3 py-3 font-medium">{row.nama}</td>
                  <td className="px-3 py-3 text-right">
                    {formatDecimal(row.nilai_v, 8)}
                  </td>
                </tr>
              ))}
            </tbody>
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
              : "Perhitungan WP belum bisa dijalankan."
          }
          title="Gagal menghitung WP"
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

function TableSection({
  children,
  title
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-lg border bg-white shadow-sm">
      <div className="border-b px-4 py-3">
        <h2 className="font-semibold">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          {children}
        </table>
      </div>
    </section>
  );
}
