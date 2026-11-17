import "server-only";
import { BRAND } from "@/config/brand";
import { getProducts } from "@/features/products/services/products";
import type { CatalogOptions } from "@/features/products/types/catalog-options";
import { MongoClient } from "mongodb";

const globalMongo = globalThis as typeof globalThis & {
  mongoClientPromise?: Promise<MongoClient>;
};
async function database() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is missing.");
  globalMongo.mongoClientPromise ??= new MongoClient(uri).connect();
  return (await globalMongo.mongoClientPromise).db(
    process.env.MONGODB_DB ?? "FzEcomDev",
  );
}

export async function getCatalogOptions(): Promise<CatalogOptions> {
  const db = await database();
  const stored = await db
    .collection<CatalogOptions & { _id: string }>("settings")
    .findOne({ _id: "catalog-options" });
  const products = await getProducts();
  return {
    categories: [
      ...new Set(
        [
          ...(stored?.categories ?? BRAND.productCategories),
          ...products.map((p) => p.category),
        ].filter(Boolean),
      ),
    ],
    badges: [
      ...new Set(
        [
          ...(stored?.badges ?? BRAND.productBadges),
          ...products.map((p) => p.badge),
        ].filter(Boolean),
      ),
    ],
  };
}

export async function saveCatalogOptions(
  options: CatalogOptions,
  categoryRenames: Record<string, string>,
  badgeRenames: Record<string, string>,
) {
  const db = await database();
  const products = db.collection("products");
  for (const [from, to] of Object.entries(categoryRenames))
    await products.updateMany({ category: from }, { $set: { category: to } });
  for (const [from, to] of Object.entries(badgeRenames))
    await products.updateMany({ badge: from }, { $set: { badge: to } });
  const removedUsedCategory = await products.findOne({
    category: { $nin: options.categories },
  });
  if (removedUsedCategory)
    throw new Error(
      "Rename or move products out of a category before removing it.",
    );
  const removedBadges = await products.updateMany(
    { badge: { $nin: options.badges } },
    { $set: { badge: "" } },
  );
  void removedBadges;
  await db
    .collection<CatalogOptions & { _id: string }>("settings")
    .updateOne({ _id: "catalog-options" }, { $set: options }, { upsert: true });
  return getCatalogOptions();
}
