"use client";

import { useState } from "react";
import type { CatalogOptions } from "@/features/products/types/catalog-options";

export function CatalogOptionsManager({
  initial,
  onClose,
  onSaved,
}: {
  initial: CatalogOptions;
  onClose: () => void;
  onSaved: (options: CatalogOptions) => void;
}) {
  const [categories, setCategories] = useState<
    { original: string | null; value: string }[]
  >(initial.categories.map((value) => ({ original: value, value })));
  const [badges, setBadges] = useState<
    { original: string | null; value: string }[]
  >(initial.badges.map((value) => ({ original: value, value })));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    setError("");
    const renames = (entries: { original: string | null; value: string }[]) =>
      Object.fromEntries(
        entries
          .filter(
            (entry) =>
              entry.original &&
              entry.value.trim() &&
              entry.original !== entry.value,
          )
          .map((entry) => [entry.original, entry.value.trim()]),
      );
    try {
      const response = await fetch("/api/admin/catalog-options", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          options: {
            categories: categories
              .map((entry) => entry.value.trim())
              .filter(Boolean),
            badges: badges.map((entry) => entry.value.trim()).filter(Boolean),
          },
          categoryRenames: renames(categories),
          badgeRenames: renames(badges),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? "Could not save catalog options.");
        return;
      }
      onSaved(result as CatalogOptions);
    } catch {
      setError("Connection issue. Please try again.");
    } finally {
      setBusy(false);
    }
  };
  const listEditor = (
    title: string,
    values: { original: string | null; value: string }[],
    setter: (values: { original: string | null; value: string }[]) => void,
  ) => (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <button
          className="text-forest bg-leaf/40 rounded-full px-3 py-2 text-xs font-semibold"
          onClick={() =>
            setter([...values, { original: null, value: "New option" }])
          }
        >
          + Add
        </button>
      </div>
      {values.map((entry, index) => (
        <div className="flex gap-2" key={`${title}-${index}`}>
          <input
            className="border-line min-w-0 flex-1 rounded-xl border bg-white px-3 py-2 text-sm"
            value={entry.value}
            onChange={(event) =>
              setter(
                values.map((item, i) =>
                  i === index ? { ...item, value: event.target.value } : item,
                ),
              )
            }
            aria-label={`${title} option ${index + 1}`}
          />
          <button
            className="text-muted rounded-xl px-3 hover:bg-red-50 hover:text-red-700"
            onClick={() => setter(values.filter((_, i) => i !== index))}
            aria-label={`Remove ${entry.value}`}
          >
            ×
          </button>
        </div>
      ))}
    </section>
  );
  return (
    <div className="bg-ink/55 fixed inset-0 z-[60] grid place-items-center overflow-y-auto p-4 backdrop-blur-sm">
      <div className="bg-panel my-auto w-full max-w-lg space-y-6 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-forest text-[10px] font-bold tracking-widest">
              STOREFRONT SETTINGS
            </span>
            <h2 className="font-display mt-1 text-3xl">Categories & badges</h2>
          </div>
          <button
            className="bg-paper rounded-full px-3 py-2"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        {listEditor("Categories", categories, setCategories)}
        {listEditor("Badges", badges, setBadges)}
        {error && (
          <p
            className="rounded-xl bg-red-50 p-3 text-xs text-red-800"
            role="alert"
          >
            {error}
          </p>
        )}
        <div className="border-line flex justify-end gap-2 border-t pt-4">
          <button
            className="border-line rounded-full border px-4 py-2 text-xs"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-forest rounded-full px-5 py-2 text-xs font-semibold text-white transition hover:-translate-y-0.5 disabled:opacity-60"
            disabled={busy}
            onClick={save}
          >
            {busy ? "Saving…" : "Save options"}
          </button>
        </div>
      </div>
    </div>
  );
}
