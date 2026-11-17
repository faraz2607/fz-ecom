import { io } from "next/cache";
import { getProducts } from "@/features/products/services/products";
import { isAdmin } from "@/lib/auth";
import { AdminDashboard } from "@/features/admin/components/admin-dashboard";
import { AdminLogin } from "@/features/admin/components/admin-login";
import { getCatalogOptions } from "@/features/products/services/catalog-options";

export const instant = false;

export default async function AdminPage() {
  await io();
  if (!(await isAdmin())) return <AdminLogin />;
  const [products, options] = await Promise.all([
    getProducts(),
    getCatalogOptions(),
  ]);
  return <AdminDashboard products={products} catalogOptions={options} />;
}
