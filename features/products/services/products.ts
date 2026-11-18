import "server-only";

import { MongoClient, ObjectId, type Collection } from "mongodb";
import type { Product, ProductInput } from "@/features/products/types/product";
import { calculateSalePrice } from "@/features/products/services/pricing";
import { toDisplayImageUrl } from "@/features/products/services/image-url";

type StoredProduct = Omit<Product, "id"> & { _id: ObjectId };

const globalMongo = globalThis as typeof globalThis & {
  mongoClientPromise?: Promise<MongoClient>;
};

function getClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri)
    throw new Error(
      "MONGODB_URI is missing. Add it to your environment to connect the product catalog.",
    );

  if (!globalMongo.mongoClientPromise) {
    const client = new MongoClient(uri);
    globalMongo.mongoClientPromise = client.connect();
  }

  return globalMongo.mongoClientPromise;
}

async function getCollection(): Promise<Collection<StoredProduct>> {
  const client = await getClient();
  const database = client.db(process.env.MONGODB_DB ?? "FzEcomDev");
  return database.collection<StoredProduct>("products");
}

async function nextProductCode(): Promise<string> {
  const client = await getClient();
  const counter = await client
    .db(process.env.MONGODB_DB ?? "FzEcomDev")
    .collection<{ _id: string; value: number }>("counters")
    .findOneAndUpdate(
      { _id: "product-code" },
      { $inc: { value: 1 } },
      { upsert: true, returnDocument: "after" },
    );
  const sequence = counter?.value ?? 1;
  if (sequence > 9999) throw new Error("Product code limit reached.");
  return `${(process.env.BRAND_SHORT_NAME ?? "ET").slice(0, 2).toUpperCase()}${String(sequence).padStart(4, "0")}`;
}

function toProduct(document: StoredProduct): Product {
  const { _id, ...fields } = document;
  const discountPercent =
    fields.discountPercent ??
    (fields.originalPrice
      ? Math.round((1 - fields.price / fields.originalPrice) * 100)
      : 0);
  return {
    ...fields,
    imageUrl: toDisplayImageUrl(fields.imageUrl),
    secondaryImageUrls: fields.secondaryImageUrls?.map(toDisplayImageUrl),
    discountPercent,
    id: _id.toString(),
  };
}

export async function getProducts(): Promise<Product[]> {
  const collection = await getCollection();
  const documents = await collection.find().sort({ createdAt: -1 }).toArray();
  const brandPrefix = (process.env.BRAND_SHORT_NAME ?? "ET")
    .slice(0, 2)
    .toUpperCase();
  const sequencePattern = new RegExp(`^${brandPrefix}(\\d{4})$`);
  let sequence = documents.reduce((maximum, product) => {
    const match = product.productCode?.match(sequencePattern);
    return Math.max(maximum, match ? Number(match[1]) : 0);
  }, 0);
  const counters = (await getClient())
    .db(process.env.MONGODB_DB ?? "FzEcomDev")
    .collection<{ _id: string; value: number }>("counters");
  for (const document of documents) {
    if (document.productCode) continue;
    document.productCode = await nextProductCode();
    await collection.updateOne(
      { _id: document._id },
      { $set: { productCode: document.productCode } },
    );
  }
  await counters.updateOne(
    { _id: "product-code" },
    { $max: { value: sequence } },
    { upsert: true },
  );
  return documents.map(toProduct);
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const collection = await getCollection();
  const document: StoredProduct = {
    ...input,
    productCode: await nextProductCode(),
    price: calculateSalePrice(input.originalPrice, input.discountPercent),
    _id: new ObjectId(),
    createdAt: new Date().toISOString(),
  };
  await collection.insertOne(document);
  return toProduct(document);
}

export async function updateProduct(
  id: string,
  input: ProductInput,
): Promise<Product | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getCollection();
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...input,
        price: calculateSalePrice(input.originalPrice, input.discountPercent),
      },
    },
    { returnDocument: "after" },
  );
  return result ? toProduct(result) : null;
}

export async function applyBulkDiscount(
  ids: string[],
  discountPercent: number,
): Promise<Product[]> {
  const collection = await getCollection();
  const objectIds = ids.filter(ObjectId.isValid).map((id) => new ObjectId(id));
  const selected = await collection.find({ _id: { $in: objectIds } }).toArray();
  if (!selected.length) return [];
  await collection.bulkWrite(
    selected.map((product) => ({
      updateOne: {
        filter: { _id: product._id },
        update: {
          $set: {
            discountPercent,
            price: calculateSalePrice(product.originalPrice, discountPercent),
          },
        },
      },
    })),
  );
  return (await collection.find({ _id: { $in: objectIds } }).toArray()).map(
    toProduct,
  );
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const collection = await getCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}
