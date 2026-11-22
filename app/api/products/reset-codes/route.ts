import {
  getProducts,
  resetProductCodes,
} from "@/features/products/services/products";
import { isAdmin } from "@/lib/auth";

export async function POST() {
  if (!(await isAdmin()))
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await resetProductCodes();
    return Response.json(await getProducts());
  } catch {
    return Response.json(
      { error: "Could not reset product IDs." },
      { status: 500 },
    );
  }
}
