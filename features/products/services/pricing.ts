export function calculateSalePrice(
  originalPrice: number,
  discountPercent: number,
): number {
  return Math.round(originalPrice * (1 - discountPercent / 100));
}
