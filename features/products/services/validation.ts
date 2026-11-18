import type { ProductInput } from "@/features/products/types/product";
import { toDisplayImageUrl } from "@/features/products/services/image-url";

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
  const isDisplayImagePath = (url: string) =>
    /^\/api\/images\/drive\/[A-Za-z0-9_-]{10,200}$/.test(url);
  try {
    if (
      ![imageUrl, ...secondaryImageUrls].every(
        (url) =>
          isDisplayImagePath(url) ||
          ["http:", "https:"].includes(new URL(url).protocol),
      ) ||
      (meeshoUrl && !["http:", "https:"].includes(new URL(meeshoUrl).protocol))
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
  return {
    product: {
      name,
      category,
      imageUrl: toDisplayImageUrl(imageUrl),
      secondaryImageUrls: secondaryImageUrls.map(toDisplayImageUrl),
      meeshoUrl,
      description: text("description", 220),
      badge: text("badge", 30),
      originalPrice,
      discountPercent,
      active: data.active !== false,
    },
  };
}
