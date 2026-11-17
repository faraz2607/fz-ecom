import { isAdmin } from "@/lib/auth";
import {
  deleteProduct,
  updateProduct,
} from "@/features/products/services/products";
import { validateProduct } from "@/features/products/services/validation";
import { getCatalogOptions } from "@/features/products/services/catalog-options";

type RouteProps = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: RouteProps) {
  if (!(await isAdmin()))
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const result = validateProduct(await request.json());
  if ("error" in result)
    return Response.json({ error: result.error }, { status: 400 });
  const options = await getCatalogOptions();
  if (
    !options.categories.includes(result.product.category) ||
    (result.product.badge && !options.badges.includes(result.product.badge))
  )
    return Response.json(
      { error: "Choose a category and badge from the catalog options." },
      { status: 400 },
    );
  const { id } = await params;
  const product = await updateProduct(id, result.product);
  return product
    ? Response.json(product)
    : Response.json({ error: "Product not found" }, { status: 404 });
}

export async function DELETE(_request: Request, { params }: RouteProps) {
  if (!(await isAdmin()))
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const deleted = await deleteProduct(id);
  return deleted
    ? Response.json({ success: true })
    : Response.json({ error: "Product not found" }, { status: 404 });
}
