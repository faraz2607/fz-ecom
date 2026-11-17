import { isAdmin } from "@/lib/auth";
import {
  getCatalogOptions,
  saveCatalogOptions,
} from "@/features/products/services/catalog-options";
import type { CatalogOptions } from "@/features/products/types/catalog-options";

export async function GET() {
  if (!(await isAdmin()))
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json(await getCatalogOptions());
}

export async function PUT(request: Request) {
  if (!(await isAdmin()))
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json()) as {
    options?: CatalogOptions;
    categoryRenames?: Record<string, string>;
    badgeRenames?: Record<string, string>;
  };
  const clean = (items: unknown) =>
    Array.isArray(items)
      ? [
          ...new Set(
            items
              .filter((x): x is string => typeof x === "string")
              .map((x) => x.trim())
              .filter(Boolean),
          ),
        ].slice(0, 30)
      : [];
  const options = {
    categories: clean(body.options?.categories),
    badges: clean(body.options?.badges),
  };
  if (!options.categories.length)
    return Response.json(
      { error: "Add at least one category." },
      { status: 400 },
    );
  try {
    return Response.json(
      await saveCatalogOptions(
        options,
        body.categoryRenames ?? {},
        body.badgeRenames ?? {},
      ),
    );
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Could not save options.",
      },
      { status: 400 },
    );
  }
}
