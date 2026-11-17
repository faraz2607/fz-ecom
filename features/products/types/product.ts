export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  badge: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  imageUrl: string;
  secondaryImageUrls?: string[];
  meeshoUrl?: string | null;
  active: boolean;
  createdAt: string;
}

export type ProductInput = Omit<Product, "id" | "createdAt" | "price">;
