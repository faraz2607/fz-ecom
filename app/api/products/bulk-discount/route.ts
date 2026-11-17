import { isAdmin } from "@/lib/auth";
import { applyBulkDiscount } from "@/features/products/services/products";

export async function PUT(request: Request) {
  if (!(await isAdmin()))
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json()) as {
    ids?: unknown;
    discountPercent?: unknown;
  };
  if (
    !Array.isArray(body.ids) ||
    !body.ids.length ||
    body.ids.some((id) => typeof id !== "string") ||
    !Number.isInteger(body.discountPercent) ||
    Number(body.discountPercent) < 0 ||
    Number(body.discountPercent) > 100
  )
    return Response.json(
      { error: "Select products and enter a discount from 0 to 100%." },
      { status: 400 },
    );
  return Response.json(
    await applyBulkDiscount(body.ids as string[], Number(body.discountPercent)),
  );
}
