"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatNumber } from "@/lib/format";
import type { CriteriaRow } from "@/lib/criteria";

type WeightSettingsClientProps = {
  rows: CriteriaRow[];
  isAdmin: boolean;
};

const defaultWeights = {
  C1: 30,
  C2: 25,
  C3: 25,
  C4: 20
};

type WeightState = Record<keyof typeof defaultWeights, number>;

export function WeightSettingsClient({
  rows,
  isAdmin
}: WeightSettingsClientProps) {
  const router = useRouter();
  const [weights, setWeights] = useState<WeightState>(() =>
    rows.reduce(
      (acc, row) => ({
        ...acc,
        [row.kode]: Number(row.bobot)
      }),
      { ...defaultWeights }
    )
  );
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const total = useMemo(
    () => Object.values(weights).reduce((sum, value) => sum + value, 0),
    [weights]
  );
  const isValid = Math.abs(total - 100) < 0.000001;

  function updateWeight(kode: keyof WeightState, value: number) {
    setWeights((current) => ({
      ...current,
      [kode]: Number.isFinite(value) ? value : 0
    }));
  }

  async function saveWeights() {
    setStatus(null);
    setError(null);

    if (!isValid) {
      setError("Total bobot harus tepat 100% sebelum disimpan.");
      return;
    }

    const response = await fetch("/api/kriteria", {
      body: JSON.stringify({
        weights: Object.entries(weights).map(([kode, bobot]) => ({
          kode,
          bobot
        }))
      }),
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST"
    });
    const result = await response.json();

    if (!response.ok) {
      setError(result.error ?? "Bobot kriteria gagal disimpan.");
      return;
    }

    setStatus("Bobot kriteria berhasil disimpan.");
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Total bobot</p>
          <p className="mt-2 text-2xl font-semibold">
            {formatNumber(total)}%
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Status validasi</p>
          <p
            className={
              isValid
                ? "mt-2 text-lg font-semibold text-primary"
                : "mt-2 text-lg font-semibold text-destructive"
            }
          >
            {isValid ? "Valid" : "Belum 100%"}
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Mode akses</p>
          <p className="mt-2 text-lg font-semibold">
            {isAdmin ? "Admin" : "Baca saja"}
          </p>
        </div>
      </section>

      <section className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-base font-semibold">Bobot Kriteria WP</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              Sesuaikan bobot C1 sampai C4. Perhitungan hanya bisa dijalankan
              jika total bobot tepat 100%.
            </p>
          </div>
          {isAdmin ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                onClick={() => {
                  setWeights({ ...defaultWeights });
                  setStatus(null);
                  setError(null);
                }}
                type="button"
                variant="outline"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset Default
              </Button>
              <Button
                disabled={!isValid || isPending}
                onClick={() => void saveWeights()}
                type="button"
              >
                <Save className="mr-2 h-4 w-4" />
                Simpan
              </Button>
            </div>
          ) : null}
        </div>

        {status ? (
          <p className="mt-4 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">
            {status}
          </p>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <div className="mt-5 space-y-4">
          {rows.map((row) => {
            const kode = row.kode as keyof WeightState;
            const value = weights[kode] ?? 0;

            return (
              <div className="rounded-lg border bg-muted/20 p-4" key={row.id}>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold">
                      {row.kode} - {row.nama}
                    </p>
                    <p className="mt-1 text-sm capitalize text-muted-foreground">
                      Tipe: {row.tipe}
                    </p>
                  </div>
                  <div className="w-full max-w-xs">
                    <Label htmlFor={`bobot-${row.kode}`}>Bobot (%)</Label>
                    <div className="mt-2 flex items-center gap-3">
                      <input
                        className="h-2 flex-1 accent-primary"
                        disabled={!isAdmin}
                        id={`bobot-range-${row.kode}`}
                        max="100"
                        min="0"
                        onChange={(event) =>
                          updateWeight(kode, Number(event.target.value))
                        }
                        step="1"
                        type="range"
                        value={value}
                      />
                      <Input
                        className="w-24 text-right"
                        disabled={!isAdmin}
                        id={`bobot-${row.kode}`}
                        max="100"
                        min="0"
                        onChange={(event) =>
                          updateWeight(kode, Number(event.target.value))
                        }
                        step="1"
                        type="number"
                        value={value}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
