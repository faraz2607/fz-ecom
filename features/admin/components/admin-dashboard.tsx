"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiArrowUpRight,
  FiBox,
  FiCopy,
  FiCheck,
  FiHeart,
  FiPlus,
  FiClipboard,
  FiSearch,
  FiX,
} from "react-icons/fi";
import { CustomSelect } from "@/components/common/custom-select";
import { ProductImage } from "@/components/common/product-image";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
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
  const [badgeFilter, setBadgeFilter] = useState("All badges");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
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
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [confirmDeleteSelected, setConfirmDeleteSelected] = useState(false);
  const [confirmResetIds, setConfirmResetIds] = useState(false);
  const [copiedProductId, setCopiedProductId] = useState<string | null>(null);

  useEffect(() => {
    const refreshSession = () => {
      if (document.visibilityState === "visible")
        void fetch("/api/auth/refresh", { method: "POST" });
    };
    const timer = window.setInterval(refreshSession, 15 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  const categories = ["All categories", ...catalogOptions.categories];
  const filtered = useMemo(
    () =>
      products.filter(
        (product) =>
          (filter === "All categories" || product.category === filter) &&
          (badgeFilter === "All badges" || product.badge === badgeFilter) &&
          `${product.productCode ?? ""} ${product.name} ${product.category} ${product.badge}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
    [products, filter, badgeFilter, search],
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  async function pasteProduct() {
    try {
      const value = await navigator.clipboard.readText();
      const parsed = JSON.parse(value) as Partial<ProductInput>;
      if (!parsed || typeof parsed !== "object") throw new Error();
      setEditing({
        ...blankProduct,
        ...parsed,
        category: parsed.category ?? catalogOptions.categories[0] ?? "",
        secondaryImageUrls: parsed.secondaryImageUrls ?? [],
        id: "",
        createdAt: "",
      });
      setError("");
    } catch {
      setError("Clipboard must contain copied product details in JSON format.");
    }
  }

  async function copyProductDetails(product: Product) {
    try {
      await navigator.clipboard.writeText(JSON.stringify(product, null, 2));
      setCopiedProductId(product.id);
      window.setTimeout(() => {
        setCopiedProductId((current) =>
          current === product.id ? null : current,
        );
      }, 1800);
    } catch {
      setError("Could not copy product details to the clipboard.");
    }
  }

  async function deleteSelected() {
    if (!selectedIds.length) return;
    const results = await Promise.all(
      selectedIds.map((id) =>
        fetch(`/api/products/${id}`, { method: "DELETE" }),
      ),
    );
    const failedIds = selectedIds.filter((_, index) => !results[index]?.ok);
    const deletedIds = selectedIds.filter((id) => !failedIds.includes(id));
    if (deletedIds.length) {
      setProducts((current) =>
        current.filter((product) => !deletedIds.includes(product.id)),
      );
    }
    if (failedIds.length) {
      setSelectedIds(failedIds);
      setError("Some selected products could not be deleted.");
      return;
    }
    setNotice(`${deletedIds.length} products deleted.`);
    setSelectedIds([]);
  }

  async function resetProductIds() {
    const response = await fetch("/api/products/reset-codes", {
      method: "POST",
    });
    const result = (await response.json()) as Product[] | { error?: string };
    if (!response.ok) {
      setError(
        (result as { error?: string }).error ?? "Could not reset product IDs.",
      );
      return;
    }
    setProducts(result as Product[]);
    setNotice("Product IDs reset.");
  }

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
      <aside className="border-line bg-panel flex items-center justify-between border-b px-5 py-4 lg:fixed lg:inset-y-0 lg:left-0 lg:z-10 lg:w-64 lg:flex-col lg:items-stretch lg:justify-start lg:gap-10 lg:border-r lg:border-b-0 lg:px-5 lg:py-7">
        <Link className="flex items-center gap-2.5" href="/">
          <span className="bg-forest text-leaf grid size-9 place-items-center rounded-xl text-[10px] font-bold">
            {BRAND.shortName}
          </span>
          <span className="font-sans text-xl font-semibold">
            <span className="text-forest">{BRAND.name.split(" ")[0]}</span>{" "}
            <span className="text-leaf">
              {BRAND.name.split(" ").slice(1).join(" ")}
            </span>
          </span>
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
            <FiBox aria-hidden="true" />
            Product catalog
          </Link>
          <Link
            className="text-muted hover:bg-paper hover:text-forest flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-medium transition-colors"
            href="/"
            target="_blank"
          >
            <FiArrowUpRight aria-hidden="true" />
            View storefront
          </Link>
        </nav>
        <div className="border-line mt-auto hidden items-center gap-3 border-t pt-5 lg:flex">
          <span className="bg-leaf text-forest grid size-9 place-items-center rounded-full font-sans">
            {BRAND.name.charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1">
            <strong className="block truncate text-xs">
              <span className="text-forest">{BRAND.name.split(" ")[0]}</span>{" "}
              <span className="text-leaf">
                {BRAND.name.split(" ").slice(1).join(" ")}
              </span>
            </strong>
            <small className="text-muted mt-0.5 block text-[10px]">
              Store administrator
            </small>
          </span>
          <button
            className="text-muted hover:bg-paper hover:text-forest rounded-lg p-2 transition-colors"
            aria-label="Sign out"
            onClick={logout}
          >
            <FiX aria-hidden="true" />
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
            View your shop <FiArrowUpRight aria-hidden="true" />
          </Link>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-8 sm:py-10 lg:px-10">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-forest text-[10px] font-bold tracking-[0.16em]">
                YOUR LITTLE SPACE, LOOKING LOVELY
              </span>
              <h1 className="font-display mt-2 text-4xl tracking-tight sm:text-5xl">
                <FiBox className="text-forest mr-2 inline" aria-hidden="true" />
                Product catalog
              </h1>
              <p className="text-muted mt-2 text-xs sm:text-sm">
                Manage fabric listings, pricing, and availability.
              </p>
            </div>
            <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:justify-end">
              <button
                className="border-ink/35 text-forest hover:border-forest hover:bg-leaf/30 h-11 w-full rounded-xl border px-4 text-xs font-semibold transition sm:w-auto sm:rounded-full"
                onClick={() => setManageOptions(true)}
              >
                Manage categories & badges
              </button>
              <button
                className="border-line text-muted h-11 w-full rounded-xl border px-4 text-xs font-semibold sm:w-auto sm:rounded-full"
                onClick={() => setConfirmResetIds(true)}
              >
                Reset product IDs
              </button>
              <button
                className="group bg-forest hover:bg-ink hover:shadow-forest/15 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-5 text-xs font-bold text-white transition-all active:scale-[.98] sm:w-auto sm:rounded-full sm:hover:-translate-y-0.5 sm:hover:shadow-lg"
                onClick={() => openEditor()}
              >
                <FiPlus className="text-leaf" aria-hidden="true" /> Add a
                product
              </button>
            </div>
          </div>

          <section className="border-line bg-panel relative rounded-2xl border">
            <div className="border-line flex flex-col gap-4 border-b px-4 py-5 md:flex-row md:items-center md:justify-between md:px-6">
              <div>
                <h2 className="font-display text-2xl">
                  All the good things{" "}
                  <span className="bg-paper text-muted ml-1 rounded-full px-2 py-1 align-middle font-sans text-[10px]">
                    {filtered.length}
                  </span>
                  <span className="text-forest ml-2 align-middle font-sans text-xs font-semibold">
                    Live {products.filter((product) => product.active).length}
                  </span>
                </h2>
                <p className="text-muted mt-1 text-[10px] sm:text-xs">
                  Search and manage your catalog.
                </p>
              </div>
              <div className="flex min-w-0 flex-col gap-2 md:w-[34rem] md:flex-row">
                <label className="border-line text-muted focus-within:border-forest flex h-12 w-full min-w-0 flex-1 items-center gap-2 rounded-xl border px-3 md:min-w-48 md:rounded-full">
                  <FiSearch aria-hidden="true" />
                  <input
                    className="text-ink placeholder:text-muted min-w-0 flex-1 bg-transparent text-[11px] outline-none h-[inherit]"
                    aria-label="Search name or product ID"
                    placeholder="Search name or product ID"
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                  />
                </label>
                <div className="grid min-w-0 grid-cols-2 gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                  <CustomSelect
                    className="h-12 w-full text-[11px] sm:text-xs"
                    aria-label="Filter category"
                    value={filter}
                    onChange={(value) => {
                      setFilter(value);
                      setPage(1);
                    }}
                  >
                    {categories.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </CustomSelect>
                  <CustomSelect
                    className="h-12 w-full text-[11px] sm:text-xs"
                    aria-label="Filter badge"
                    value={badgeFilter}
                    onChange={(value) => {
                      setBadgeFilter(value);
                      setPage(1);
                    }}
                  >
                    {["All badges", ...catalogOptions.badges].map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </CustomSelect>
                </div>
              </div>
            </div>

            {notice && (
              <p
                className="bg-leaf/35 text-forest mx-4 mt-4 flex items-center justify-between rounded-xl px-4 py-3 text-xs sm:mx-6"
                role="status"
              >
                {notice}
                <button
                  className="ml-3 text-base"
                  onClick={() => setNotice("")}
                  aria-label="Dismiss"
                >
                  <FiX aria-hidden="true" />
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
                  <FiX aria-hidden="true" />
                </button>
              </p>
            )}

            {selectedIds.length > 0 && (
              <div className="border-line bg-leaf/20 grid grid-cols-1 gap-4 border-b px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-6">
                <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-3">
                  <strong className="shrink-0 text-xs">
                    {selectedIds.length} selected
                  </strong>
                  <label className="flex items-center gap-2 text-xs">
                    Discount %
                    <input
                      className="border-line h-10 w-20 rounded-xl border bg-white px-3 text-xs"
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={bulkPercent}
                      onChange={(event) => setBulkPercent(event.target.value)}
                    />
                  </label>
                  <button
                    className="bg-forest h-10 rounded-xl px-4 text-xs font-semibold whitespace-nowrap text-white sm:rounded-full"
                    onClick={applyBulkDiscount}
                  >
                    Apply discount
                  </button>
                  <button
                    className="text-muted h-10 px-2 text-xs whitespace-nowrap"
                    onClick={() => setSelectedIds([])}
                  >
                    Clear selection
                  </button>
                </div>
                <button
                  className="h-10 justify-self-end rounded-xl bg-red-700 px-4 text-xs font-semibold whitespace-nowrap text-white hover:bg-red-800 sm:rounded-full"
                  onClick={() => setConfirmDeleteSelected(true)}
                >
                  Delete selected
                </button>
              </div>
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
                        <th>DISCOUNT</th>
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
                              <ProductImage
                                className="bg-paper size-11 rounded-xl object-cover"
                                src={product.imageUrl}
                                alt=""
                                width={44}
                                height={44}
                                sizes="44px"
                              />
                              <span>
                                <strong className="block max-w-52 truncate text-xs font-semibold">
                                  {product.name}
                                </strong>
                                <small className="text-muted mt-1 block text-[10px]">
                                  {product.productCode ?? "FE----"} ·{" "}
                                  {product.badge || "No badge"}
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
                            <div className="flex items-center gap-2 whitespace-nowrap">
                              <strong className="text-xs">
                                {priceFormat.format(product.price)}
                              </strong>
                              <del className="text-muted text-[10px]">
                                {priceFormat.format(product.originalPrice)}
                              </del>
                            </div>
                          </td>
                          <td>
                            <span className="text-forest bg-leaf/35 rounded-full px-2.5 py-1.5 text-[10px] font-bold">
                              {product.discountPercent}% off
                            </span>
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
                              {selectedIds.includes(product.id) && (
                                <button
                                  className={`border-line grid size-8 place-items-center rounded-full border transition-colors ${copiedProductId === product.id ? "border-forest bg-leaf/40 text-forest" : "text-muted"}`}
                                  onClick={() =>
                                    void copyProductDetails(product)
                                  }
                                  aria-label={`Copy ${product.name}`}
                                  title={
                                    copiedProductId === product.id
                                      ? "Copied"
                                      : "Copy product details"
                                  }
                                >
                                  {copiedProductId === product.id ? (
                                    <FiCheck aria-hidden="true" />
                                  ) : (
                                    <FiCopy aria-hidden="true" />
                                  )}
                                </button>
                              )}
                              {copiedProductId === product.id && (
                                <span
                                  className="text-forest text-[10px] font-semibold"
                                  role="status"
                                >
                                  Copied
                                </span>
                              )}
                              <button
                                className="border-line hover:border-forest hover:bg-forest rounded-full border px-3 py-2 text-[10px] font-semibold transition-all hover:text-white"
                                onClick={() => openEditor(product)}
                              >
                                Edit
                              </button>
                              <button
                                className="border-line text-muted grid size-8 place-items-center rounded-full border text-lg transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                                onClick={() => setProductToDelete(product)}
                                aria-label={`Delete ${product.name}`}
                              >
                                <FiX aria-hidden="true" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="border-line text-muted flex flex-col gap-3 border-t px-4 py-4 text-[10px] sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <span>
                    Showing{" "}
                    {Math.min((page - 1) * pageSize + 1, filtered.length)}-
                    {Math.min(page * pageSize, filtered.length)} of{" "}
                    {filtered.length} products
                  </span>
                  <div className="flex flex-row justify-between gap-4 sm:gap-6">
                    <label className="flex shrink-0 items-center justify-center gap-1.5 sm:justify-start">
                      Rows
                      <span className="w-20">
                        <CustomSelect
                          className="h-9 w-full text-xs"
                          value={pageSize}
                          aria-label="Rows per page"
                          placement="top"
                          onChange={(value) => {
                            setPageSize(Number(value));
                            setPage(1);
                          }}
                        >
                          {[10, 20, 50, 100].map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </CustomSelect>
                      </span>
                    </label>
                    <div className="flex items-center justify-center gap-2 sm:justify-end">
                      <button
                        className="border-ink/25 text-ink hover:border-forest hover:text-forest disabled:bg-paper disabled:text-muted/70 inline-flex h-10 items-center justify-center gap-1 rounded-xl border px-2 transition-colors disabled:cursor-default sm:rounded-full sm:px-3"
                        disabled={page <= 1}
                        aria-label="Previous page"
                        onClick={() => setPage(page - 1)}
                      >
                        <FiArrowLeft className="shrink-0" aria-hidden="true" />
                        <span className="hidden sm:inline">Previous</span>
                      </button>
                      <span className="min-w-10 text-center">
                        {page} / {pageCount}
                      </span>
                      <button
                        className="border-ink/25 text-ink hover:border-forest hover:text-forest disabled:bg-paper disabled:text-muted/70 inline-flex h-10 items-center justify-center gap-1 rounded-xl border px-2 transition-colors disabled:cursor-default sm:rounded-full sm:px-3"
                        disabled={page >= pageCount}
                        aria-label="Next page"
                        onClick={() => setPage(page + 1)}
                      >
                        <span className="hidden sm:inline">Next</span>
                        <FiArrowRight className="shrink-0" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="px-5 py-14 text-center">
                <FiBox
                  className="text-forest mx-auto text-3xl"
                  aria-hidden="true"
                />
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
                  <FiPlus aria-hidden="true" /> Add a product
                </button>
              </div>
            )}
          </section>
          <footer className="text-muted py-7 text-center text-[10px]">
            {BRAND.footerSignoff}{" "}
            <FiHeart className="text-forest inline" aria-hidden="true" />
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
              <div className="flex items-center gap-2">
                {!editing.id && (
                  <button
                    type="button"
                    className="border-line text-muted flex h-9 items-center gap-2 rounded-full border px-3 text-[10px] font-semibold"
                    onClick={() => void pasteProduct()}
                  >
                    <FiClipboard aria-hidden="true" /> Paste details
                  </button>
                )}
                <button
                  type="button"
                  className="bg-paper text-muted hover:bg-line hover:text-ink grid size-9 place-items-center rounded-full text-xl transition-colors"
                  onClick={() => setEditing(null)}
                  aria-label="Close"
                >
                  <FiX aria-hidden="true" />
                </button>
              </div>
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
                <CustomSelect
                  className="border-line focus:border-forest mt-1.5 h-11 w-full rounded-xl border bg-white px-3 text-xs font-normal outline-none"
                  required
                  value={editing.category}
                  onChange={(value) =>
                    setEditing({ ...editing, category: value })
                  }
                >
                  {catalogOptions.categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </CustomSelect>
              </label>
              <label className="text-[10px] font-semibold">
                Badge <span className="text-muted font-normal">optional</span>
                <CustomSelect
                  className="border-line focus:border-forest mt-1.5 h-11 w-full rounded-xl border bg-white px-3 text-xs font-normal outline-none"
                  aria-label="Product badge"
                  value={editing.badge}
                  onChange={(value) => setEditing({ ...editing, badge: value })}
                >
                  <option value="">No badge</option>
                  {catalogOptions.badges.map((badge) => (
                    <option key={badge} value={badge}>
                      {badge}
                    </option>
                  ))}
                </CustomSelect>
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
                  type="text"
                  value={editing.imageUrl}
                  onChange={(event) =>
                    setEditing({ ...editing, imageUrl: event.target.value })
                  }
                  placeholder="Public image URL or Google Drive share link"
                />
                <small className="text-muted mt-1 block font-normal">
                  For Drive images, set General access to Anyone with the link
                  (Viewer).
                </small>
              </label>
              <div className="col-span-2 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold">
                    Additional product images{" "}
                    <span className="text-muted font-normal">(up to 5)</span>
                  </span>
                  {(editing.secondaryImageUrls?.length ?? 0) < 5 && (
                    <button
                      className="text-forest bg-leaf/40 hover:bg-leaf/70 rounded-full px-3 py-2 text-[10px] font-semibold transition"
                      type="button"
                      onClick={() =>
                        setEditing({
                          ...editing,
                          secondaryImageUrls: [
                            ...(editing.secondaryImageUrls ?? []),
                            "",
                          ],
                        })
                      }
                    >
                      + Add image
                    </button>
                  )}
                </div>
                {(editing.secondaryImageUrls ?? []).map((imageUrl, index) => (
                  <div
                    className="flex min-w-0 gap-2"
                    key={`secondary-image-${index}`}
                  >
                    <input
                      className="border-line focus:border-forest h-10 min-w-0 flex-1 rounded-xl border bg-white px-3 text-xs font-normal outline-none"
                      type="text"
                      value={imageUrl}
                      onChange={(event) =>
                        setEditing({
                          ...editing,
                          secondaryImageUrls: (
                            editing.secondaryImageUrls ?? []
                          ).map((url, imageIndex) =>
                            imageIndex === index ? event.target.value : url,
                          ),
                        })
                      }
                      placeholder={`Google Drive image URL ${index + 2}`}
                      aria-label={`Additional image ${index + 1} URL`}
                    />
                    <button
                      className="text-muted rounded-xl px-3 transition hover:bg-red-50 hover:text-red-700"
                      type="button"
                      onClick={() =>
                        setEditing({
                          ...editing,
                          secondaryImageUrls: (
                            editing.secondaryImageUrls ?? []
                          ).filter((_, imageIndex) => imageIndex !== index),
                        })
                      }
                      aria-label={`Remove additional image ${index + 1}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <p className="text-muted text-[10px]">
                  Drive images must allow Anyone with the link (Viewer); pasted
                  share links are converted for display.
                </p>
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
                  placeholder="Describe the fabric, weave, or feel"
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
                  ? "Saving..."
                  : editing.id
                    ? "Save changes"
                    : "Add to the shop"}
                <FiArrowUpRight className="text-leaf" aria-hidden="true" />
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
      {productToDelete && (
        <ConfirmDialog
          title="Remove this product?"
          description={`“${productToDelete.name}” will be removed from your catalog.`}
          confirmLabel="Remove product"
          onCancel={() => setProductToDelete(null)}
          onConfirm={() => {
            const product = productToDelete;
            setProductToDelete(null);
            void removeProduct(product);
          }}
        />
      )}
      {confirmDeleteSelected && (
        <ConfirmDialog
          title={`Delete ${selectedIds.length} selected products?`}
          description="These products will be removed from the catalog. This action cannot be undone."
          confirmLabel="Delete selected"
          onCancel={() => setConfirmDeleteSelected(false)}
          onConfirm={() => {
            setConfirmDeleteSelected(false);
            void deleteSelected();
          }}
        />
      )}
      {confirmResetIds && (
        <ConfirmDialog
          title="Reset product IDs?"
          description="All product IDs will be reassigned in order, starting with FE0001."
          confirmLabel="Reset IDs"
          onCancel={() => setConfirmResetIds(false)}
          onConfirm={() => {
            setConfirmResetIds(false);
            void resetProductIds();
          }}
        />
      )}
    </main>
  );
}
