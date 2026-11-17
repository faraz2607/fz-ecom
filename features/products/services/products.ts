import "server-only";

import { MongoClient, ObjectId, type Collection } from "mongodb";
import type { Product, ProductInput } from "@/features/products/types/product";
import { calculateSalePrice } from "@/features/products/services/pricing";

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

function toProduct(document: StoredProduct): Product {
  const { _id, ...fields } = document;
  const discountPercent =
    fields.discountPercent ??
    (fields.originalPrice
      ? Math.round((1 - fields.price / fields.originalPrice) * 100)
      : 0);
  return { ...fields, discountPercent, id: _id.toString() };
}

export async function getProducts(): Promise<Product[]> {
  const collection = await getCollection();
  const documents = await collection.find().sort({ createdAt: -1 }).toArray();
  return documents.map(toProduct);
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const collection = await getCollection();
  const document: StoredProduct = {
    ...input,
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
