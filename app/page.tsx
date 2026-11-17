import { io } from "next/cache";
import { BRAND } from "@/config/brand";
import { getProducts } from "@/features/products/services/products";
import { Storefront } from "@/features/storefront/components/storefront";

export const instant = false;

export default async function HomePage() {
  await io();
  const products = await getProducts();
  return (
    <Storefront
      products={products.filter((product) => product.active)}
      useDemoProducts={products.length === 0}
      shopUrl={process.env.MEESHO_SHOP_URL || BRAND.defaultShopUrl}
    />
  );
}
