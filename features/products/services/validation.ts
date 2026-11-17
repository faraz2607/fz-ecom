import type { ProductInput } from "@/features/products/types/product";

export function validateProduct(
  value: unknown,
): { product: ProductInput } | { error: string } {
  if (!value || typeof value !== "object")
    return { error: "Enter product details." };
  const data = value as Record<string, unknown>;
  const text = (key: string, maxLength: number) =>
    typeof data[key] === "string" ? data[key].trim().slice(0, maxLength) : "";
  const name = text("name", 100);
  const category = text("category", 40);
  const imageUrl = text("imageUrl", 1000);
  const secondaryImageUrls = Array.isArray(data.secondaryImageUrls)
    ? data.secondaryImageUrls
        .filter((url): url is string => typeof url === "string")
        .map((url) => url.trim())
        .filter(Boolean)
        .slice(0, 5)
    : [];
  const meeshoUrl = text("meeshoUrl", 1000);
  const originalPrice = Number(data.originalPrice);
  const discountPercent = Number(data.discountPercent);
  if (!name || !category || !imageUrl)
    return { error: "Name, category, and image URL are required." };
  try {
    if (
      ![imageUrl, meeshoUrl, ...secondaryImageUrls]
        .filter(Boolean)
        .every((url) => ["http:", "https:"].includes(new URL(url).protocol))
    )
      return { error: "URLs must use http or https." };
  } catch {
    return {
      error: "Enter a valid image URL and, if supplied, a valid shop URL.",
    };
  }
  if (
    !Number.isFinite(originalPrice) ||
    !Number.isInteger(discountPercent) ||
    originalPrice <= 0 ||
    discountPercent < 0 ||
    discountPercent > 100
  )
    return {
      error: "Enter a valid list price and a discount from 0 to 100%.",
    };
  const toDisplayUrl = (url: string) => {
    const parsedUrl = new URL(url);
    const driveFileId =
      parsedUrl.hostname === "drive.google.com"
        ? (parsedUrl.pathname.match(/\/file\/d\/([^/]+)/)?.[1] ??
          parsedUrl.searchParams.get("id"))
        : null;
    return driveFileId
      ? `https://drive.google.com/uc?export=view&id=${encodeURIComponent(driveFileId)}`
      : url;
  };
  return {
    product: {
      name,
      category,
      imageUrl: toDisplayUrl(imageUrl),
      secondaryImageUrls: secondaryImageUrls.map(toDisplayUrl),
      meeshoUrl,
      description: text("description", 220),
      badge: text("badge", 30),
      originalPrice,
      discountPercent,
      active: data.active !== false,
    },
  };
}
