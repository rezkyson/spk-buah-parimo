"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Calculator } from "lucide-react";

import { Button } from "@/components/ui/button";

export function RecalculateButton({ isAdmin }: { isAdmin: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function calculate() {
    setMessage(null);
    setError(null);

    const response = await fetch("/api/wp/calculate", {
      method: "POST"
    });
    const result = await response.json();

    if (!response.ok) {
      setError(result.error ?? "Perhitungan gagal dijalankan.");
      return;
    }

    setMessage(`Hasil terbaru disimpan untuk ${result.rankings} komoditas.`);
    startTransition(() => router.refresh());
  }

  if (!isAdmin) {
    return (
      <div className="space-y-2">
        <Button asChild variant="outline">
          <Link href="/login?redirectTo=/perhitungan-wp">Login untuk Hitung Ulang</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button disabled={isPending} onClick={() => void calculate()} type="button">
        <Calculator className="mr-2 h-4 w-4" />
        {isPending ? "Menghitung..." : "Hitung Ulang"}
      </Button>
      {message ? <p className="text-sm text-primary">{message}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
