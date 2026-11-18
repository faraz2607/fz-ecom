"use client";

import { useState } from "react";
import { FiX } from "react-icons/fi";
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
  const [categories, setCategories] = useState(initial.categories);
  const [badges, setBadges] = useState(initial.badges);
  const [categoryInput, setCategoryInput] = useState("");
  const [badgeInput, setBadgeInput] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const addOption = (type: "category" | "badge") => {
    const value = (type === "category" ? categoryInput : badgeInput).trim();
    const values = type === "category" ? categories : badges;
    if (
      !value ||
      values.some((item) => item.toLowerCase() === value.toLowerCase())
    )
      return;
    if (type === "category") {
      setCategories([...categories, value]);
      setCategoryInput("");
    } else {
      setBadges([...badges, value]);
      setBadgeInput("");
    }
  };
  const save = async () => {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/catalog-options", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          options: { categories, badges },
          categoryRenames: {},
          badgeRenames: {},
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
    type: "category" | "badge",
    values: string[],
  ) => {
    const input = type === "category" ? categoryInput : badgeInput;
    const setInput = type === "category" ? setCategoryInput : setBadgeInput;
    const setValues = type === "category" ? setCategories : setBadges;
    return (
      <section className="space-y-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <div className="flex gap-2">
          <input
            className="border-line min-w-0 flex-1 rounded-xl border bg-white px-3 py-2 text-sm"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addOption(type);
              }
            }}
            placeholder={`Add ${type}`}
            aria-label={`Add ${type}`}
          />
          <button
            className="text-forest bg-leaf/40 rounded-xl px-4 py-2 text-xs font-semibold"
            type="button"
            onClick={() => addOption(type)}
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <span
              className="border-ink/25 bg-paper text-ink inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs"
              key={value}
            >
              {value}
              <button
                className="text-muted hover:text-red-700"
                type="button"
                onClick={() =>
                  setValues(values.filter((item) => item !== value))
                }
                aria-label={`Remove ${value}`}
              >
                <FiX aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      </section>
    );
  };
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
            className="bg-paper text-muted grid size-9 place-items-center rounded-full"
            onClick={onClose}
            aria-label="Close"
          >
            <FiX aria-hidden="true" />
          </button>
        </div>
        {listEditor("Categories", "category", categories)}
        {listEditor("Badges", "badge", badges)}
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
