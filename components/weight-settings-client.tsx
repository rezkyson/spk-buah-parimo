"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Gauge,
  RotateCcw,
  Save,
  SlidersHorizontal,
  Target
} from "lucide-react";

import { MetricCard } from "@/components/metric-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
      <section className="grid gap-4 md:grid-cols-2">
        <MetricCard
          hint="Total seluruh kriteria"
          icon={Gauge}
          label="Total bobot"
          tone={isValid ? "primary" : "amber"}
          value={`${formatNumber(total)}%`}
        />
        <MetricCard
          hint={isValid ? "Siap disimpan" : "Sesuaikan bobot terlebih dahulu"}
          icon={Target}
          label="Status validasi"
          tone={isValid ? "emerald" : "amber"}
          value={isValid ? "Valid" : "Belum 100%"}
        />
      </section>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col gap-4 border-b bg-muted/20 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
              <SlidersHorizontal className="h-5 w-5" />
            </span>
            <div>
              <CardTitle>Bobot Kriteria</CardTitle>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant={isValid ? "success" : "warning"}>
                  {isValid ? "Valid" : "Perlu disesuaikan"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {formatNumber(total)}%
                </span>
              </div>
            </div>
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
        </CardHeader>

        <CardContent className="p-5">
          <Progress className="mb-5" value={total} />

          {status ? (
            <p className="mb-4 flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">
              <CheckCircle2 className="h-4 w-4" />
              {status}
            </p>
          ) : null}

          {error ? (
            <p className="mb-4 flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </p>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            {rows.map((row) => {
              const kode = row.kode as keyof WeightState;
              const value = weights[kode] ?? 0;

              return (
                <div className="rounded-lg border bg-white p-4 shadow-sm" key={row.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Badge variant="outline">{row.kode}</Badge>
                      <p className="mt-3 font-semibold">{row.nama}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatNumber(value)}%
                      </p>
                    </div>
                    <Input
                      className="w-24 text-right font-semibold"
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
                  <div className="mt-4 space-y-3">
                    <Progress value={value} />
                    <div className="flex items-center gap-3">
                      <Label
                        className="sr-only"
                        htmlFor={`bobot-range-${row.kode}`}
                      >
                        Bobot {row.nama}
                      </Label>
                      <input
                        className="h-2 w-full accent-primary"
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
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
