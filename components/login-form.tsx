"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/browser";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/data-komoditas";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(mode: "login" | "signup") {
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();
    const response =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setIsSubmitting(false);

    if (response.error) {
      setError(response.error.message);
      return;
    }

    if (mode === "signup" && !response.data.session) {
      setMessage("Akun dibuat. Cek email untuk konfirmasi sebelum login.");
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Login Admin</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Gunakan akun Supabase Auth untuk mengelola data dan bobot kriteria.
        </p>
      </div>

      <form
        className="mt-6 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit("login");
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            autoComplete="email"
            id="email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            autoComplete="current-password"
            id="password"
            minLength={6}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </div>

        {error ? (
          <p className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        {message ? (
          <p className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">
            {message}
          </p>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button className="sm:flex-1" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Memproses..." : "Masuk"}
          </Button>
          <Button
            disabled={isSubmitting}
            onClick={() => void handleSubmit("signup")}
            type="button"
            variant="outline"
          >
            Buat Akun
          </Button>
        </div>
      </form>
    </div>
  );
}
