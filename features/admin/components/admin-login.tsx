"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { BRAND } from "@/config/brand";

export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(result.error ?? "Could not sign in.");
      } else {
        const session = await fetch("/api/auth/refresh", { method: "POST" });
        if (!session.ok) {
          setError("Your session could not be confirmed. Please try again.");
          return;
        }
        router.replace(`/admin?session=${Date.now()}`);
      }
    } catch {
      setError("Connection issue. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="bg-paper text-ink grid min-h-screen lg:grid-cols-[1.05fr_.95fr]">
      <section className="bg-forest relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col lg:justify-between lg:p-16">
        <div className="absolute -top-28 -right-28 size-[30rem] rounded-full border border-white/10" />
        <div className="absolute -bottom-40 -left-20 size-[33rem] rounded-full border border-white/10" />
        <Link className="relative z-10 flex items-center gap-3" href="/">
          <span className="bg-leaf text-forest grid size-11 place-items-center rounded-2xl font-bold">
            {BRAND.shortName}
          </span>
          <span className="font-sans text-2xl font-semibold">{BRAND.name}</span>
        </Link>
        <div className="relative z-10 max-w-xl motion-safe:animate-[fade-up_.7s_ease-out_both]">
          <span className="text-leaf rounded-full border border-white/20 px-3 py-2 text-[10px] font-semibold tracking-[0.16em]">
            YOUR LITTLE CORNER OF THE INTERNET
          </span>
          <h1 className="font-display mt-8 text-6xl leading-[.98]">
            Make room
            <br />
            for <em className="text-leaf font-normal">lovely.</em>
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-7 text-white/65">
            A thoughtful edit of everyday things, ready whenever inspiration
            strikes.
          </p>
        </div>
        <span className="relative z-10 text-xs text-white/50">
          {BRAND.name} · {BRAND.tagline}
        </span>
      </section>

      <section className="flex min-h-screen flex-col items-center justify-center px-5 py-10 sm:px-8">
        <Link className="mb-10 flex items-center gap-2.5 lg:hidden" href="/">
          <span className="bg-forest text-leaf grid size-9 place-items-center rounded-xl text-xs font-bold">
            {BRAND.shortName}
          </span>
          <span className="font-sans text-xl font-semibold">{BRAND.name}</span>
        </Link>
        <form
          className="border-line bg-panel w-full max-w-md rounded-[2rem] border p-7 shadow-[0_28px_90px_-50px_rgba(24,61,52,.3)] motion-safe:animate-[fade-up_.6s_ease-out_both] sm:p-10"
          onSubmit={submit}
        >
          <span className="bg-leaf/45 text-forest grid size-12 place-items-center rounded-2xl text-xl">
            ✳
          </span>
          <span className="text-forest mt-7 block text-[10px] font-bold tracking-[0.17em]">
            A LITTLE SPACE FOR YOU
          </span>
          <h2 className="font-display mt-2 text-4xl">Welcome back.</h2>
          <p className="text-muted mt-2 text-sm leading-6">
            Sign in to tend to {BRAND.name}.
          </p>
          <label
            className="mt-8 block text-xs font-semibold"
            htmlFor="admin-password"
          >
            Admin password
          </label>
          <input
            className="border-line bg-paper placeholder:text-muted/70 focus:border-forest mt-2 h-12 w-full rounded-xl border px-4 text-sm transition-colors focus:bg-white focus:outline-none"
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoFocus
          />
          {error && (
            <p
              className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-xs text-red-800"
              role="alert"
            >
              {error}
            </p>
          )}
          <button
            className="group bg-forest hover:bg-ink hover:shadow-forest/15 mt-5 flex h-12 w-full items-center justify-between rounded-full px-5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[.99] disabled:cursor-wait disabled:opacity-70"
            disabled={busy}
          >
            {busy ? "Opening your dashboard…" : "Enter dashboard"}
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </button>
          <Link
            className="text-muted hover:text-forest mt-6 block text-center text-xs font-medium transition-colors"
            href="/"
          >
            ← Back to the shop
          </Link>
        </form>
        <span className="text-muted mt-8 text-[10px]">
          {BRAND.name} admin space · Keep it lovely
        </span>
      </section>
    </main>
  );
}
