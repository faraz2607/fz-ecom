"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { BRAND } from "@/config/brand";
import type { Product, ProductInput } from "@/features/products/types/product";
import type { CatalogOptions } from "@/features/products/types/catalog-options";
import { CatalogOptionsManager } from "@/features/admin/components/catalog-options-manager";
import { calculateSalePrice } from "@/features/products/services/pricing";

const blankProduct: ProductInput = {
  name: "",
  description: "",
  category: "Shemaghs",
  badge: "",
  originalPrice: 0,
  discountPercent: 0,
  imageUrl: "",
  secondaryImageUrls: [],
  meeshoUrl: "",
  active: true,
};
const priceFormat = new Intl.NumberFormat(BRAND.locale, {
  style: "currency",
  currency: BRAND.currency,
  maximumFractionDigits: 0,
});
const pageSize = 6;

export function AdminDashboard({
  products: initialProducts,
  catalogOptions: initialOptions,
}: {
  products: Product[];
  catalogOptions: CatalogOptions;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All categories");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<
    (ProductInput & { id: string; createdAt: string }) | null
  >(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [catalogOptions, setCatalogOptions] = useState(initialOptions);
  const [manageOptions, setManageOptions] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkPercent, setBulkPercent] = useState("");

  const categories = ["All categories", ...catalogOptions.categories];
  const filtered = useMemo(
    () =>
      products.filter(
        (product) =>
          (filter === "All categories" || product.category === filter) &&
          product.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [products, filter, search],
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  function openEditor(product?: Product) {
    setEditing(
      product ?? {
        ...blankProduct,
        category: catalogOptions.categories[0] ?? "",
        id: "",
        createdAt: "",
      },
    );
    setError("");
    setNotice("");
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    setBusy(true);
    setError("");
    const { id, ...input } = editing;

    try {
      const response = await fetch(
        id ? `/api/products/${id}` : "/api/products",
        {
          method: id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        },
      );
      const result = (await response.json()) as Product | { error?: string };

      if (!response.ok) {
        setError(
          (result as { error?: string }).error ?? "Could not save product.",
        );
        return;
      }

      const savedProduct = result as Product;
      setProducts((current) =>
        id
          ? current.map((product) =>
              product.id === id ? savedProduct : product,
            )
          : [savedProduct, ...current],
      );
      setNotice(
        id ? "Your product has been updated." : "Your new find is in the shop.",
      );
      setEditing(null);
    } catch {
      setError("Connection issue. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function removeProduct(product: Product) {
    if (!window.confirm(`Remove â€œ${product.name}â€ from your catalog?`))
      return;
    const response = await fetch(`/api/products/${product.id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      setProducts((current) =>
        current.filter((item) => item.id !== product.id),
      );
      setNotice("Product removed from the catalog.");
    } else {
      setError("Could not remove this product.");
    }
  }

  async function toggleActive(product: Product) {
    const { id, ...input } = product;
    const response = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...input, active: !product.active }),
    });
    if (response.ok) {
      const updatedProduct = (await response.json()) as Product;
      setProducts((current) =>
        current.map((item) => (item.id === id ? updatedProduct : item)),
      );
      setNotice(
        updatedProduct.active
          ? "Product is live in the shop."
          : "Product hidden from the shop.",
      );
    }
  }

  async function applyBulkDiscount() {
    const discountPercent = Number(bulkPercent);
    if (
      !selectedIds.length ||
      !Number.isInteger(discountPercent) ||
      discountPercent < 0 ||
      discountPercent > 100
    ) {
      setError("Select products and enter a discount from 0 to 100%.");
      return;
    }
    const response = await fetch("/api/products/bulk-discount", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selectedIds, discountPercent }),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? "Could not apply bulk discount.");
      return;
    }
    const changed = result as Product[];
    setProducts((current) =>
      current.map(
        (product) => changed.find((item) => item.id === product.id) ?? product,
      ),
    );
    setSelectedIds([]);
    setBulkPercent("");
    setNotice(`Discount updated for ${changed.length} products.`);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.reload();
  }

  return (
    <main className="bg-paper text-ink min-h-screen lg:flex">
      <aside className="border-line bg-panel flex items-center justify-between border-b px-5 py-4 lg:fixed lg:inset-y-0 lg:left-0 lg:z-10 lg:w-64 lg:flex-col lg:items-stretch lg:border-r lg:border-b-0 lg:px-5 lg:py-7">
        <Link className="flex items-center gap-2.5" href="/">
          <span className="bg-forest text-leaf grid size-9 place-items-center rounded-xl text-[10px] font-bold">
            {BRAND.shortName}
          </span>
          <span className="font-display text-xl">{BRAND.name}</span>
        </Link>
        <nav
          className="hidden space-y-1 lg:block"
          aria-label="Admin navigation"
        >
          <span className="text-muted mb-3 block px-3 text-[10px] font-bold tracking-[0.15em]">
            YOUR WORKSPACE
          </span>
          <Link
            className="bg-forest flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-semibold text-white"
            href="/admin"
          >
            <span>â–¦</span>Product catalog
          </Link>
          <Link
            className="text-muted hover:bg-paper hover:text-forest flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-medium transition-colors"
            href="/"
            target="_blank"
          >
            <span>â†—</span>View storefront
          </Link>
        </nav>
        <div className="border-line hidden items-center gap-3 border-t pt-5 lg:flex">
          <span className="bg-leaf font-display text-forest grid size-9 place-items-center rounded-full">
            {BRAND.name.charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1">
            <strong className="block truncate text-xs">{BRAND.name}</strong>
            <small className="text-muted mt-0.5 block text-[10px]">
              Store administrator
            </small>
          </span>
          <button
            className="text-muted hover:bg-paper hover:text-forest rounded-lg p-2 transition-colors"
            aria-label="Sign out"
            onClick={logout}
          >
            â†ª
          </button>
        </div>
        <button
          className="border-line text-muted hover:border-forest hover:text-forest rounded-full border px-3 py-2 text-[10px] font-semibold transition-colors lg:hidden"
          onClick={logout}
        >
          Sign out
        </button>
      </aside>

      <section className="min-w-0 flex-1 lg:ml-64">
        <header className="border-line bg-panel flex h-14 items-center justify-between border-b px-5 sm:px-8 lg:px-10">
          <div className="text-muted text-[11px]">
            <span className="hidden sm:inline">
              Your workspace <span className="text-line mx-2">/</span>
            </span>
            <strong className="text-ink font-semibold">Product catalog</strong>
          </div>
          <Link
            className="group text-forest inline-flex items-center gap-2 text-[11px] font-semibold"
            href="/"
            target="_blank"
          >
            View your shop{" "}
            <span className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              â†—
            </span>
          </Link>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-8 sm:py-10 lg:px-10">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-forest text-[10px] font-bold tracking-[0.16em]">
                YOUR LITTLE SPACE, LOOKING LOVELY
              </span>
              <h1 className="font-display mt-2 text-4xl tracking-tight sm:text-5xl">
                Product catalog
              </h1>
              <p className="text-muted mt-2 text-xs sm:text-sm">
                Keep your collection feeling fresh and full of good things.
              </p>
            </div>
            <button
              className="border-line text-forest hover:border-forest hover:bg-leaf/30 h-11 rounded-full border px-5 text-xs font-semibold transition"
              onClick={() => setManageOptions(true)}
            >
              Manage categories & badges
            </button>
            <button
              className="group bg-forest hover:bg-ink hover:shadow-forest/15 inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-xs font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[.98]"
              onClick={() => openEditor()}
            >
              <span className="text-leaf text-base">ï¼‹</span>Add a product
            </button>
          </div>

          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            <div className="border-line bg-panel rounded-2xl border p-4 sm:p-5">
              <span className="text-muted text-[9px] font-bold tracking-[0.15em]">
                ALL PRODUCTS
              </span>
              <strong className="font-display mt-3 block text-3xl">
                {products.length.toString().padStart(2, "0")}
              </strong>
              <small className="text-muted mt-1 block text-[10px]">
                In your collection
              </small>
            </div>
            <div className="border-line bg-panel rounded-2xl border p-4 sm:p-5">
              <span className="text-muted text-[9px] font-bold tracking-[0.15em]">
                LIVE IN SHOP
              </span>
              <strong className="font-display mt-3 block text-3xl">
                {products
                  .filter((product) => product.active)
                  .length.toString()
                  .padStart(2, "0")}
              </strong>
              <small className="text-muted mt-1 block text-[10px]">
                Visible to everyone
              </small>
            </div>
            <div className="bg-leaf/65 flex min-h-28 flex-col justify-between rounded-2xl p-4 sm:p-5">
              <span className="text-forest text-[9px] font-bold tracking-[0.15em]">
                âœ³ A LITTLE REMINDER
              </span>
              <strong className="font-display mt-4 text-xl">
                Good finds deserve a fresh look.
              </strong>
              <small className="text-forest/70 mt-1 text-[10px]">
                Update your edit whenever inspiration strikes.
              </small>
            </div>
          </div>

          <section className="border-line bg-panel overflow-hidden rounded-2xl border">
            <div className="border-line flex flex-col gap-4 border-b px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <h2 className="font-display text-2xl">
                  All the good things{" "}
                  <span className="bg-paper text-muted ml-1 rounded-full px-2 py-1 align-middle font-sans text-[10px]">
                    {filtered.length}
                  </span>
                </h2>
                <p className="text-muted mt-1 text-[10px] sm:text-xs">
                  Every lovely thing in one place.
                </p>
              </div>
              <div className="flex gap-2">
                <label className="border-line text-muted focus-within:border-forest flex h-10 min-w-0 flex-1 items-center gap-2 rounded-full border px-3 sm:w-48 sm:flex-none">
                  <span className="text-lg">âŒ•</span>
                  <input
                    className="text-ink placeholder:text-muted min-w-0 flex-1 bg-transparent text-[11px] outline-none"
                    aria-label="Search products"
                    placeholder="Search products"
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                  />
                </label>
                <select
                  className="border-line text-ink focus:border-forest h-10 max-w-36 rounded-full border bg-white px-3 text-[10px] outline-none sm:max-w-none sm:text-xs"
                  aria-label="Filter category"
                  value={filter}
                  onChange={(event) => {
                    setFilter(event.target.value);
                    setPage(1);
                  }}
                >
                  {categories.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>

            {notice && (
              <p
                className="bg-leaf/35 text-forest mx-4 mt-4 flex items-center justify-between rounded-xl px-4 py-3 text-xs sm:mx-6"
                role="status"
              >
                âœ³ {notice}
                <button
                  className="ml-3 text-base"
                  onClick={() => setNotice("")}
                  aria-label="Dismiss"
                >
                  Ã—
                </button>
              </p>
            )}
            {error && !editing && (
              <p
                className="mx-4 mt-4 flex items-center justify-between rounded-xl bg-red-50 px-4 py-3 text-xs text-red-800 sm:mx-6"
                role="alert"
              >
                {error}
                <button
                  className="ml-3 text-base"
                  onClick={() => setError("")}
                  aria-label="Dismiss"
                >
                  Ã—
                </button>
              </p>
            )}

            {visible.length ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[690px] border-collapse text-left">
                    <thead className="bg-paper/70">
                      <tr className="text-muted h-10 text-[9px] font-bold tracking-[0.13em]">
                        <th className="pl-5">
                          <input
                            type="checkbox"
                            aria-label="Select visible products"
                            checked={
                              visible.length > 0 &&
                              visible.every((p) => selectedIds.includes(p.id))
                            }
                            onChange={(event) =>
                              setSelectedIds(
                                event.target.checked
                                  ? [
                                      ...new Set([
                                        ...selectedIds,
                                        ...visible.map((p) => p.id),
                                      ]),
                                    ]
                                  : selectedIds.filter(
                                      (id) => !visible.some((p) => p.id === id),
                                    ),
                              )
                            }
                          />
                        </th>
                        <th className="pl-6">PRODUCT</th>
                        <th>CATEGORY</th>
                        <th>PRICE</th>
                        <th>STATUS</th>
                        <th className="pr-6 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visible.map((product) => (
                        <tr
                          className="border-line/70 hover:bg-paper/50 border-t transition-colors"
                          key={product.id}
                        >
                          <td className="pl-5">
                            <input
                              type="checkbox"
                              aria-label={`Select ${product.name}`}
                              checked={selectedIds.includes(product.id)}
                              onChange={(event) =>
                                setSelectedIds(
                                  event.target.checked
                                    ? [...selectedIds, product.id]
                                    : selectedIds.filter(
                                        (id) => id !== product.id,
                                      ),
                                )
                              }
                            />
                          </td>
                          <td className="py-3 pl-6">
                            <div className="flex items-center gap-3">
                              <Image
                                className="bg-paper size-11 rounded-xl object-cover"
                                src={product.imageUrl}
                                alt=""
                                width={44}
                                height={44}
                                unoptimized
                              />
                              <span>
                                <strong className="block max-w-52 truncate text-xs font-semibold">
                                  {product.name}
                                </strong>
                                <small className="text-muted mt-1 block text-[10px]">
                                  {product.badge || "Everyday find"}
                                </small>
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className="bg-paper text-muted rounded-full px-3 py-1.5 text-[10px]">
                              {product.category}
                            </span>
                          </td>
                          <td>
                            <strong className="block text-xs">
                              {priceFormat.format(product.price)}
                            </strong>
                            <del className="text-muted mt-1 block text-[10px]">
                              {priceFormat.format(product.originalPrice)}
                            </del>
                          </td>
                          <td>
                            <button
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold transition-colors ${product.active ? "bg-leaf/40 text-forest hover:bg-leaf/70" : "bg-paper text-muted hover:bg-line"}`}
                              onClick={() => toggleActive(product)}
                            >
                              <span
                                className={`size-1.5 rounded-full ${product.active ? "bg-forest" : "bg-muted"}`}
                              />
                              {product.active ? "Live" : "Hidden"}
                            </button>
                          </td>
                          <td className="pr-6">
                            <div className="flex justify-end gap-2">
                              <button
                                className="border-line hover:border-forest hover:bg-forest rounded-full border px-3 py-2 text-[10px] font-semibold transition-all hover:text-white"
                                onClick={() => openEditor(product)}
                              >
                                Edit
                              </button>
                              <button
                                className="border-line text-muted grid size-8 place-items-center rounded-full border text-lg transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                                onClick={() => removeProduct(product)}
                                aria-label={`Delete ${product.name}`}
                              >
                                Ã—
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {selectedIds.length > 0 && (
                  <div className="border-line bg-leaf/20 flex flex-wrap items-center gap-3 border-t px-5 py-3">
                    <strong className="text-xs">
                      {selectedIds.length} selected
                    </strong>
                    <label className="flex items-center gap-2 text-xs">
                      Discount %
                      <input
                        className="border-line w-20 rounded-lg border bg-white px-2 py-2"
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={bulkPercent}
                        onChange={(event) => setBulkPercent(event.target.value)}
                      />
                    </label>
                    <button
                      className="bg-forest rounded-full px-4 py-2 text-xs font-semibold text-white transition hover:-translate-y-0.5"
                      onClick={applyBulkDiscount}
                    >
                      Apply discount
                    </button>
                    <button
                      className="text-muted px-2 text-xs"
                      onClick={() => setSelectedIds([])}
                    >
                      Clear selection
                    </button>
                  </div>
                )}
                <div className="border-line text-muted flex flex-col gap-3 border-t px-4 py-4 text-[10px] sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <span>
                    Showing{" "}
                    {Math.min((page - 1) * pageSize + 1, filtered.length)}â€“
                    {Math.min(page * pageSize, filtered.length)} of{" "}
                    {filtered.length} lovely finds
                  </span>
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <button
                      className="border-line hover:border-forest rounded-full border px-3 py-2 transition-colors disabled:cursor-default disabled:opacity-40"
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                    >
                      â† Previous
                    </button>
                    <span>
                      {page} / {pageCount}
                    </span>
                    <button
                      className="border-line hover:border-forest rounded-full border px-3 py-2 transition-colors disabled:cursor-default disabled:opacity-40"
                      disabled={page >= pageCount}
                      onClick={() => setPage(page + 1)}
                    >
                      Next â†’
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="px-5 py-14 text-center">
                <span className="text-forest text-3xl">âœ³</span>
                <h3 className="font-display mt-3 text-2xl">
                  No products found
                </h3>
                <p className="text-muted mt-2 text-xs">
                  Try another search, or add your first product.
                </p>
                <button
                  className="bg-forest mt-5 rounded-full px-5 py-3 text-xs font-bold text-white transition-transform hover:-translate-y-0.5"
                  onClick={() => openEditor()}
                >
                  ï¼‹ Add a product
                </button>
              </div>
            )}
          </section>
          <footer className="text-muted py-7 text-center text-[10px]">
            {BRAND.footerSignoff} <span className="text-forest">â™¡</span>
          </footer>
        </div>
      </section>

      {editing && (
        <div
          className="bg-ink/55 fixed inset-0 z-50 grid place-items-center overflow-y-auto p-3 backdrop-blur-sm sm:p-6"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setEditing(null);
          }}
        >
          <form
            className="bg-panel shadow-ink/20 my-auto w-full max-w-xl animate-[fade-up_.25s_ease-out_both] rounded-[1.75rem] border border-white/30 p-5 shadow-2xl sm:p-8"
            onSubmit={saveProduct}
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <span className="text-forest text-[9px] font-bold tracking-[0.16em]">
                  YOUR NEXT LOVELY FIND
                </span>
                <h2 className="font-display mt-1 text-3xl">
                  {editing.id ? "Edit product" : "Add a product"}
                </h2>
              </div>
              <button
                type="button"
                className="bg-paper text-muted hover:bg-line hover:text-ink grid size-9 place-items-center rounded-full text-xl transition-colors"
                onClick={() => setEditing(null)}
                aria-label="Close"
              >
                Ã—
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
              <label className="col-span-2 text-[10px] font-semibold">
                Product name
                <input
                  className="border-line focus:border-forest mt-1.5 h-11 w-full rounded-xl border bg-white px-3 text-xs font-normal transition-colors outline-none"
                  required
                  maxLength={100}
                  value={editing.name}
                  onChange={(event) =>
                    setEditing({ ...editing, name: event.target.value })
                  }
                  placeholder="e.g. Everyday cotton kurta"
                />
              </label>
              <label className="text-[10px] font-semibold">
                Category
                <select
                  className="border-line focus:border-forest mt-1.5 h-11 w-full rounded-xl border bg-white px-3 text-xs font-normal outline-none"
                  required
                  value={editing.category}
                  onChange={(event) =>
                    setEditing({ ...editing, category: event.target.value })
                  }
                >
                  {catalogOptions.categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-[10px] font-semibold">
                Badge <span className="text-muted font-normal">optional</span>
                <select
                  className="border-line focus:border-forest mt-1.5 h-11 w-full rounded-xl border bg-white px-3 text-xs font-normal outline-none"
                  value={editing.badge}
                  onChange={(event) =>
                    setEditing({ ...editing, badge: event.target.value })
                  }
                >
                  <option value="">No badge</option>
                  {catalogOptions.badges.map((badge) => (
                    <option key={badge} value={badge}>
                      {badge}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-[10px] font-semibold">
                List price (₹)
                <input
                  className="border-line focus:border-forest mt-1.5 h-11 w-full rounded-xl border bg-white px-3 text-xs font-normal outline-none"
                  required
                  type="number"
                  min="1"
                  step="1"
                  value={editing.originalPrice || ""}
                  onChange={(event) =>
                    setEditing({
                      ...editing,
                      originalPrice: Number(event.target.value),
                    })
                  }
                />
              </label>
              <label className="text-[10px] font-semibold">
                Discount (%)
                <input
                  className="border-line focus:border-forest mt-1.5 h-11 w-full rounded-xl border bg-white px-3 text-xs font-normal outline-none"
                  required
                  type="number"
                  min="1"
                  step="1"
                  value={editing.discountPercent || ""}
                  onChange={(event) =>
                    setEditing({
                      ...editing,
                      discountPercent: Number(event.target.value),
                    })
                  }
                />
              </label>
              <div className="bg-leaf/30 col-span-2 rounded-xl px-4 py-3 text-xs">
                Sale price:{" "}
                <strong>
                  {priceFormat.format(
                    calculateSalePrice(
                      editing.originalPrice || 0,
                      editing.discountPercent || 0,
                    ),
                  )}
                </strong>
              </div>
              <label className="col-span-2 text-[10px] font-semibold">
                Image URL
                <input
                  className="border-line focus:border-forest mt-1.5 h-11 w-full rounded-xl border bg-white px-3 text-xs font-normal outline-none"
                  required
                  type="url"
                  value={editing.imageUrl}
                  onChange={(event) =>
                    setEditing({ ...editing, imageUrl: event.target.value })
                  }
                  placeholder="Public image URL or Google Drive link"
                />
              </label>
              <div className="col-span-2 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold">Additional product images <span className="text-muted font-normal">(up to 5)</span></span>
                  {(editing.secondaryImageUrls?.length ?? 0) < 5 && (
                    <button
                      className="text-forest rounded-full bg-leaf/40 px-3 py-2 text-[10px] font-semibold transition hover:bg-leaf/70"
                      type="button"
                      onClick={() => setEditing({ ...editing, secondaryImageUrls: [...(editing.secondaryImageUrls ?? []), ""] })}
                    >+ Add image</button>
                  )}
                </div>
                {(editing.secondaryImageUrls ?? []).map((imageUrl, index) => (
                  <div className="flex min-w-0 gap-2" key={`secondary-image-${index}`}>
                    <input
                      className="border-line focus:border-forest h-10 min-w-0 flex-1 rounded-xl border bg-white px-3 text-xs font-normal outline-none"
                      type="url"
                      value={imageUrl}
                      onChange={(event) => setEditing({ ...editing, secondaryImageUrls: (editing.secondaryImageUrls ?? []).map((url, imageIndex) => imageIndex === index ? event.target.value : url) })}
                      placeholder={`Google Drive image URL ${index + 2}`}
                      aria-label={`Additional image ${index + 1} URL`}
                    />
                    <button
                      className="text-muted rounded-xl px-3 transition hover:bg-red-50 hover:text-red-700"
                      type="button"
                      onClick={() => setEditing({ ...editing, secondaryImageUrls: (editing.secondaryImageUrls ?? []).filter((_, imageIndex) => imageIndex !== index) })}
                      aria-label={`Remove additional image ${index + 1}`}
                    >×</button>
                  </div>
                ))}
                <p className="text-muted text-[10px]">Add publicly viewable image links. Google Drive images are converted for display.</p>
              </div>
              <label className="col-span-2 text-[10px] font-semibold">
                Meesho product URL{" "}
                <span className="text-muted font-normal">(optional)</span>
                <input
                  className="border-line focus:border-forest mt-1.5 h-11 w-full rounded-xl border bg-white px-3 text-xs font-normal outline-none"
                  type="url"
                  value={editing.meeshoUrl ?? ""}
                  onChange={(event) =>
                    setEditing({ ...editing, meeshoUrl: event.target.value })
                  }
                  placeholder="Leave blank to use the store link"
                />
              </label>
              <label className="col-span-2 text-[10px] font-semibold">
                A little description
                <textarea
                  className="border-line focus:border-forest mt-1.5 w-full resize-y rounded-xl border bg-white px-3 py-3 text-xs font-normal outline-none"
                  maxLength={220}
                  rows={2}
                  value={editing.description}
                  onChange={(event) =>
                    setEditing({ ...editing, description: event.target.value })
                  }
                  placeholder="What makes this find lovely?"
                />
              </label>
              <label className="col-span-2 flex items-center gap-2 text-[10px] font-medium">
                <input
                  className="accent-forest size-4"
                  type="checkbox"
                  checked={editing.active}
                  onChange={(event) =>
                    setEditing({ ...editing, active: event.target.checked })
                  }
                />
                Show this product in the shop
              </label>
            </div>
            {error && (
              <p
                className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-xs text-red-800"
                role="alert"
              >
                {error}
              </p>
            )}
            <div className="border-line mt-6 flex justify-end gap-2 border-t pt-4">
              <button
                className="border-line hover:bg-paper h-10 rounded-full border px-4 text-xs font-semibold transition-colors"
                type="button"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
              <button
                className="group bg-forest hover:bg-ink inline-flex h-10 items-center gap-3 rounded-full px-5 text-xs font-bold text-white transition-all disabled:cursor-wait disabled:opacity-70"
                disabled={busy}
              >
                {busy
                  ? "Savingâ€¦"
                  : editing.id
                    ? "Save changes"
                    : "Add to the shop"}
                <span className="text-leaf">â†’</span>
              </button>
            </div>
          </form>
        </div>
      )}
      {manageOptions && (
        <CatalogOptionsManager
          initial={catalogOptions}
          onClose={() => setManageOptions(false)}
          onSaved={(options) => {
            setCatalogOptions(options);
            setManageOptions(false);
            setNotice("Categories and badges updated.");
          }}
        />
      )}
    </main>
  );
}
