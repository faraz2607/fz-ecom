import { isAdmin } from "@/lib/auth";
import {
  createProduct,
  getProducts,
} from "@/features/products/services/products";
import { validateProduct } from "@/features/products/services/validation";
import { getCatalogOptions } from "@/features/products/services/catalog-options";

export async function GET() {
  return Response.json(
    (await getProducts()).filter((product) => product.active),
  );
}

export async function POST(request: Request) {
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
  return Response.json(await createProduct(result.product), { status: 201 });
}
