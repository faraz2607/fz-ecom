"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { BRAND } from "@/config/brand";
import { DUMMY_FABRICS } from "@/features/storefront/data/dummy-products";
import type { Product } from "@/features/products/types/product";

const money = new Intl.NumberFormat(BRAND.locale, {
  style: "currency",
  currency: BRAND.currency,
  maximumFractionDigits: 0,
});

function productImages(product: Product) {
  return [...new Set([product.imageUrl, ...(product.secondaryImageUrls ?? [])].filter(Boolean))];
}

export function Storefront({
  products,
  shopUrl,
  useDemoProducts,
}: {
  products: Product[];
  shopUrl: string;
  useDemoProducts: boolean;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All fabrics");
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [viewerIndex, setViewerIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const catalogProducts = useDemoProducts ? DUMMY_FABRICS : products;
  const categories = useMemo(
    () => [
      "All fabrics",
      ...new Set(catalogProducts.map((product) => product.category)),
    ],
    [catalogProducts],
  );
  const filteredProducts = catalogProducts.filter(
    (product) =>
      (category === "All fabrics" || product.category === category) &&
      `${product.name} ${product.category} ${product.description}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );

  function moveViewer(offset: number) {
    if (!viewingProduct) return;
    const imageCount = productImages(viewingProduct).length;
    setViewerIndex((current) => (current + offset + imageCount) % imageCount);
  }

  return (
    <main className="bg-paper text-ink min-h-screen overflow-hidden">
      <div className="bg-leaf text-forest px-4 py-2 text-center text-[10px] font-semibold tracking-[0.16em] sm:text-xs">
        {BRAND.announcement}
      </div>

      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <Link
          className="flex items-center gap-2.5"
          href="/"
          aria-label={`${BRAND.name} home`}
        >
          <span className="bg-forest text-leaf grid size-9 place-items-center rounded-xl text-sm font-bold">
            {BRAND.shortName}
          </span>
          <span className="font-display text-xl tracking-tight sm:text-2xl">
            {BRAND.name}
          </span>
        </Link>
        <a
          className="text-muted hover:text-forest text-[10px] transition-colors sm:text-xs"
          href={`mailto:${BRAND.supportEmail}`}
          aria-label={`Contact us at ${BRAND.supportEmail}`}
        >
          Contact us{" "}
          <span className="hidden md:inline">· {BRAND.supportEmail}</span>
        </a>
        <a
          className="group border-ink/15 hover:border-forest hover:bg-forest inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold transition-all hover:text-white sm:text-sm"
          href={shopUrl}
          target="_blank"
          rel="noreferrer"
        >
          Shop Meesho{" "}
          <span className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
            ↗
          </span>
        </a>
      </header>

      <section className="bg-forest mx-4 grid max-w-7xl gap-10 overflow-hidden rounded-[2rem] px-6 py-8 text-white sm:mx-6 sm:px-8 md:mx-auto md:grid-cols-[.9fr_1.1fr] md:items-center md:gap-8 md:px-10 md:py-12 lg:px-14">
        <div className="motion-safe:animate-[fade-up_.7s_ease-out_both] md:py-10">
          <span className="border-forest/15 text-forest mb-5 inline-flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1.5 text-[10px] font-bold tracking-[0.15em] sm:text-xs">
            <span className="bg-forest size-1.5 rounded-full" />
            {BRAND.heroKicker}
          </span>
          <h1 className="max-w-xl text-5xl leading-[.98] font-semibold tracking-[-0.07em] sm:text-6xl lg:text-7xl">
            {BRAND.heroHeadline[0]}
            <br />
            {BRAND.heroHeadline[1]}{" "}
            <span className="font-display text-leaf font-normal italic">
              {BRAND.heroHeadline[2]}
            </span>
            <br />
            {BRAND.heroHeadline[3]}
          </h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/65 md:text-base">
            {BRAND.description}
          </p>

          <div className="mt-8 flex items-center gap-3 text-xs font-medium text-white/70">
            <span className="flex -space-x-2">
              <i className="border-forest grid size-8 place-items-center rounded-full border-2 bg-[#e7b999] not-italic">
                ✿
              </i>
              <i className="border-forest grid size-8 place-items-center rounded-full border-2 bg-[#e0e9bd] not-italic">
                ♡
              </i>
              <i className="border-forest grid size-8 place-items-center rounded-full border-2 bg-[#ddc6b4] not-italic">
                ☺
              </i>
            </span>
            {BRAND.communityNote}
          </div>
        </div>
        <div className="relative motion-safe:animate-[float-in_.9s_.1s_ease-out_both]">
          <div className="bg-forest/10 relative h-[390px] overflow-hidden rounded-[2rem] sm:h-[490px] lg:h-[560px]">
            <Image
              className="object-cover"
              src={BRAND.heroImage}
              alt="A colourful edit of everyday style and accessories"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 56vw"
              unoptimized
            />
            <div className="from-forest/35 to-forest/5 absolute inset-0 bg-gradient-to-t via-transparent" />
            <div className="absolute inset-x-5 bottom-5 flex items-end justify-between text-[9px] font-semibold tracking-[0.16em] text-white sm:inset-x-7 sm:bottom-7">
              <span>{BRAND.heroCaptions[0]}</span>
              <span>{BRAND.heroCaptions[1]}</span>
            </div>
          </div>
          <div className="bg-leaf text-forest shadow-forest/15 absolute -bottom-5 -left-2 grid size-28 rotate-[-7deg] place-content-center rounded-[1.7rem] px-4 text-center shadow-xl transition-transform hover:rotate-0 sm:-left-7 sm:size-36">
            <span className="font-display text-sm italic sm:text-base">
              {BRAND.stickerCopy[0]}
            </span>
            <strong className="mt-0.5 text-lg leading-none sm:text-2xl">
              {BRAND.stickerCopy[1]}
              <br />
              {BRAND.stickerCopy[2]}
            </strong>
          </div>
          <span className="text-forest absolute top-5 -right-2 grid size-12 place-items-center rounded-2xl bg-white text-2xl shadow-lg sm:top-10 sm:-right-4">
            ✳
          </span>
        </div>
      </section>

      <section className="border-line border-y bg-white/55" id="our-promise">
        <div className="mx-auto grid max-w-7xl gap-px px-5 sm:grid-cols-3 sm:px-8 lg:px-12">
          {BRAND.promiseItems.map((item) => (
            <div
              className="flex items-center gap-3 py-5 sm:justify-center sm:py-6"
              key={item.title}
            >
              <span className="bg-leaf/50 text-forest grid size-10 shrink-0 place-items-center rounded-2xl text-base">
                {item.icon}
              </span>
              <span>
                <strong className="block text-xs font-bold">
                  {item.title}
                </strong>
                <small className="text-muted mt-1 block text-[11px]">
                  {item.detail}
                </small>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section
        className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24"
        id="discover"
      >
        <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
          <div>
            <span className="text-forest text-[10px] font-bold tracking-[0.17em] sm:text-xs">
              {BRAND.catalogKicker}
            </span>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">
              {BRAND.catalogHeadline[0]}{" "}
              <span className="font-display text-forest font-normal italic">
                {BRAND.catalogHeadline[1]}
              </span>
            </h2>
            <p className="text-muted mt-3 text-sm">{BRAND.catalogSubtitle}</p>
          </div>
          <div className="text-muted hidden items-center gap-2 text-xs sm:flex">
            <strong className="font-display text-forest text-3xl font-normal">
              {catalogProducts.length.toString().padStart(2, "0")}
            </strong>
            <span>
              lovely finds
              <br />
              and counting
            </span>
          </div>
        </div>

        <div className="border-line mb-7 flex flex-col gap-4 border-y py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2" aria-label="Filter by category">
            {categories.map((item) => (
              <button
                className={`rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 ${category === item ? "bg-forest shadow-forest/10 text-white shadow-md" : "text-ink/65 hover:bg-leaf/45 hover:text-forest bg-white"}`}
                key={item}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <label className="border-line text-muted focus-within:border-forest flex h-10 items-center gap-2 rounded-full border bg-white px-4 transition-colors">
            <span className="text-lg" aria-hidden="true">
              ⌕
            </span>
            <input
              className="text-ink placeholder:text-muted w-full bg-transparent text-xs outline-none sm:w-48"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find something lovely"
              aria-label="Search products"
            />
            {query && (
              <button
                className="text-muted hover:text-ink text-lg"
                aria-label="Clear search"
                onClick={() => setQuery("")}
              >
                ×
              </button>
            )}
          </label>
        </div>

        {filteredProducts.length ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 md:gap-y-10">
            {filteredProducts.map((product, index) => {
              const discount = product.discountPercent;
              const productShopUrl = product.meeshoUrl?.trim() || shopUrl;
              return (
                <article
                  className="group min-w-0 motion-safe:animate-[fade-up_.6s_ease-out_both]"
                  key={product.id}
                  style={{ animationDelay: `${Math.min(index * 65, 390)}ms` }}
                >
                  <button
                    className="relative block aspect-[.82] w-full overflow-hidden rounded-2xl bg-[#e8eae0] text-left sm:aspect-[.9]"
                    type="button"
                    onClick={() => { setViewingProduct(product); setViewerIndex(0); }}
                    aria-label={`Take a closer look at ${product.name}`}
                  >
                    <Image
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 48vw, (max-width: 1024px) 31vw, 380px"
                      unoptimized
                      priority={index < 3}
                    />
                    <span className="text-forest absolute top-2.5 left-2.5 rounded-full bg-white/95 px-3 py-1.5 text-[9px] font-bold shadow-sm sm:top-4 sm:left-4 sm:text-[10px]">
                      {product.badge || `${discount}% off`}
                    </span>
                    <span className="absolute inset-x-2.5 bottom-2.5 flex items-center justify-between rounded-xl bg-white/95 px-3 py-3 text-[10px] font-bold shadow-lg transition-all duration-200 sm:inset-x-4 sm:bottom-4 sm:px-4 sm:text-xs">
                      Take a closer look <b className="text-sm">↗</b>
                    </span>
                    {productImages(product).length > 1 && <span className="absolute top-2.5 right-2.5 rounded-full bg-ink/70 px-2.5 py-1 text-[9px] font-semibold text-white">{productImages(product).length} photos</span>}
                  </button>
                  <div className="text-muted mt-3 flex items-center justify-between text-[9px] font-semibold tracking-[0.1em] uppercase sm:mt-4 sm:text-[10px]">
                    <span>{product.category}</span>
                    <span className="text-forest">{discount}% off</span>
                  </div>
                  <h3 className="font-display mt-1.5 truncate text-base sm:text-xl">
                    {product.name}
                  </h3>
                  <p className="text-muted mt-1 truncate text-[10px] sm:text-xs">
                    {product.description}
                  </p>
                  <div className="border-line mt-3 flex items-center justify-between border-t pt-3 sm:mt-4">
                    <span className="flex items-center gap-2">
                      <strong className="text-sm sm:text-base">
                        {money.format(product.price)}
                      </strong>
                      <del className="text-muted text-[10px] sm:text-xs">
                        {money.format(product.originalPrice)}
                      </del>
                    </span>
                  </div>
                    <a className="bg-forest hover:bg-ink mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold text-white transition-all hover:-translate-y-0.5 active:scale-[.98] sm:mt-4" href={productShopUrl} target="_blank" rel="noreferrer">Buy now</a>

                </article>
              );
            })}
          </div>
        ) : (
          <div className="border-line rounded-3xl border border-dashed bg-white/60 px-5 py-16 text-center">
            <span className="text-forest text-3xl">✳</span>
            <h3 className="font-display mt-4 text-2xl">{BRAND.emptyTitle}</h3>
            <p className="text-muted mx-auto mt-2 max-w-sm text-sm leading-6">
              {BRAND.emptyDescription}
            </p>
            <button
              className="bg-forest hover:bg-ink mt-5 rounded-full px-5 py-3 text-xs font-bold text-white transition-all hover:-translate-y-0.5"
              onClick={() => {
                setQuery("");
                setCategory("All fabrics");
              }}
            >
              See all finds
            </button>
          </div>
        )}
      </section>

      {viewingProduct && (
        <div
          className="bg-ink/75 fixed inset-0 z-[70] grid place-items-center overflow-y-auto p-3 backdrop-blur-sm sm:p-6"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setViewingProduct(null);
          }}
        >
          <section
            className="bg-panel my-auto flex max-h-[94dvh] w-full max-w-3xl flex-col overflow-y-auto rounded-2xl shadow-2xl sm:rounded-3xl"
            role="dialog"
            aria-modal="true"
            aria-label={`${viewingProduct.name} photos`}
          >
            <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-6 sm:py-4">
              <div className="min-w-0">
                <h2 className="truncate text-sm font-bold sm:text-base">{viewingProduct.name}</h2>
                <p className="text-muted mt-0.5 text-[10px] sm:text-xs">
                  {viewerIndex + 1} of {productImages(viewingProduct).length} photos
                </p>
              </div>
              <button className="text-muted hover:bg-paper grid size-9 shrink-0 place-items-center rounded-full text-xl transition" type="button" onClick={() => setViewingProduct(null)} aria-label="Close product photos">×</button>
            </header>
            <div
              className="relative min-h-0 flex-1 bg-[#e8eae0]"
              onTouchStart={(event) => {
                touchStartX.current = event.touches[0]?.clientX ?? null;
              }}
              onTouchEnd={(event) => {
                const startX = touchStartX.current;
                const endX = event.changedTouches[0]?.clientX;
                if (startX !== null && endX !== undefined && Math.abs(endX - startX) > 45) {
                  moveViewer(endX < startX ? 1 : -1);
                }
                touchStartX.current = null;
              }}
            >
              <div className="relative h-[52dvh] min-h-64 max-h-[620px] w-full sm:h-[64dvh]">
                <Image className="object-contain" src={productImages(viewingProduct)[viewerIndex] ?? viewingProduct.imageUrl} alt={`${viewingProduct.name}, photo ${viewerIndex + 1}`} fill sizes="(max-width: 768px) 100vw, 720px" unoptimized priority />
              </div>
              {productImages(viewingProduct).length > 1 && <>
                <button className="bg-white/95 text-forest absolute top-1/2 left-2 grid size-10 -translate-y-1/2 place-items-center rounded-full text-xl shadow-lg transition hover:scale-105 sm:left-4 sm:size-12" type="button" onClick={() => moveViewer(-1)} aria-label="Previous product image"><span aria-hidden="true">&larr;</span></button>
                <button className="bg-white/95 text-forest absolute top-1/2 right-2 grid size-10 -translate-y-1/2 place-items-center rounded-full text-xl shadow-lg transition hover:scale-105 sm:right-4 sm:size-12" type="button" onClick={() => moveViewer(1)} aria-label="Next product image"><span aria-hidden="true">&rarr;</span></button>
              </>}
            </div>
            {productImages(viewingProduct).length > 1 && (
              <div className="flex gap-2 overflow-x-auto border-t border-line px-4 py-3 sm:px-6">
                {productImages(viewingProduct).map((imageUrl, index) => (
                  <button className={`relative size-14 shrink-0 overflow-hidden rounded-lg border-2 transition sm:size-16 ${index === viewerIndex ? "border-forest" : "border-transparent opacity-70 hover:opacity-100"}`} key={imageUrl} type="button" onClick={() => setViewerIndex(index)} aria-label={`Show photo ${index + 1}`} aria-current={index === viewerIndex}>
                    <Image src={imageUrl} alt="" fill sizes="64px" className="object-cover" unoptimized />
                  </button>
                ))}
              </div>
            )}
            <footer className="flex items-center justify-between gap-3 border-t border-line px-4 py-3 sm:px-6 sm:py-4">
              <span className="truncate text-[10px] text-muted sm:text-xs">{viewingProduct.category} · {money.format(viewingProduct.price)}</span>
              <a className="bg-forest hover:bg-ink inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-5 text-xs font-bold text-white transition hover:-translate-y-0.5 sm:min-w-40" href={viewingProduct.meeshoUrl?.trim() || shopUrl} target="_blank" rel="noreferrer">Buy now</a>
            </footer>
          </section>
        </div>
      )}

      <section className="bg-leaf mx-5 mb-14 overflow-hidden rounded-[2rem] px-6 py-9 sm:mx-8 sm:px-10 sm:py-11 lg:mx-auto lg:mb-20 lg:max-w-7xl lg:px-14">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <span className="text-forest text-[10px] font-bold tracking-[0.17em]">
              {BRAND.noteKicker}
            </span>
            <h2 className="font-display mt-2 text-3xl sm:text-4xl">
              {BRAND.aboutTitle}
            </h2>
            <p className="text-forest/75 mt-3 text-sm leading-6">
              {BRAND.aboutCopy}
            </p>
          </div>
          <a
            className="group bg-forest hover:bg-ink inline-flex min-h-12 shrink-0 items-center justify-between gap-8 rounded-full px-5 text-xs font-bold text-white transition-all hover:-translate-y-1"
            href="#discover"
          >
            {BRAND.noteAction}
            <span className="transition-transform group-hover:translate-x-1">
              ↗
            </span>
          </a>
        </div>
      </section>

      <footer className="border-line text-muted mx-auto flex max-w-7xl flex-col gap-3 border-t px-5 py-7 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <Link
          className="font-display text-ink flex items-center gap-2 text-lg"
          href="/"
        >
          <span className="bg-forest text-leaf grid size-7 place-items-center rounded-lg text-[9px] font-bold">
            {BRAND.shortName}
          </span>
          {BRAND.name}
        </Link>
        <span>{BRAND.tagline}</span>
        <span>
          {BRAND.footerSignoff} <b className="text-forest">♡</b>
        </span>
      </footer>
    </main>
  );
}
