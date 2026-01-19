// src/types/index.ts
export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  stock: number;
  sku: string;
  brand?: string;
  is_active: boolean;
  is_featured: boolean;
  rating: number;
  review_count: number;
  primary_image?: string;
  images: ProductImage[];
  categories: Category[];
  variations: ProductVariation[];
}

export interface ProductImage {
  id: number;
  image_url: string;
  is_primary: boolean;
  alt_text?: string;
}

export interface ProductVariation {
  id: number;
  name: string;
  value: string;
  price_adjustment: number;
  stock: number;
  sku?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
}

export interface CartItem {
  id: number;
  product_id: number;
  variation_id?: number;
  quantity: number;
  product: Product;
  variation?: ProductVariation;
}

export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  status: string;
  total_amount: number;
  shipping_cost: number;
  tax_amount: number;
  payment_method: string;
  payment_status: string;
  items: OrderItem[];
  created_at: string;
}

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  product: Product;
}
