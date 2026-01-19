/**
 * Product Types - Comprehensive type definitions for the product catalog
 */

// =============================================================================
// PRODUCT TYPES
// =============================================================================

export interface ProductImage {
  id: number;
  url: string;
  alt_text?: string;
  is_primary: boolean;
  sort_order: number;
}

export interface ProductVariation {
  id: number;
  name: string;
  value: string;
  sku?: string;
  price_modifier?: number;
  stock: number;
  is_active: boolean;
}

export interface ProductReview {
  id: number;
  user_id: number;
  user_name: string;
  rating: number;
  title?: string;
  comment?: string;
  created_at: string;
  verified_purchase: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: number;
  product_count?: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  sku: string;
  price: number;
  original_price?: number;
  cost_price?: number;
  stock: number;
  low_stock_threshold: number;
  is_active: boolean;
  is_featured: boolean;
  category_id?: number;
  category?: Category;
  brand?: string;
  weight?: number;
  dimensions?: string;
  primary_image?: string;
  thumbnail?: string;
  images: ProductImage[];
  variations: ProductVariation[];
  rating_average: number;
  rating_count: number;
  sales_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProductSummary {
  id: number;
  name: string;
  slug: string;
  price: number;
  original_price?: number;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  category?: string;
  primary_image?: string;
  thumbnail?: string;
  rating_average: number;
  rating_count: number;
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface ProductListResponse {
  items: ProductSummary[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ProductDetailResponse {
  product: Product;
  related_products: ProductSummary[];
  recent_reviews: ProductReview[];
}

// =============================================================================
// FILTER & SORT TYPES
// =============================================================================

export type SortOption = 
  | 'newest'
  | 'oldest'
  | 'price_low'
  | 'price_high'
  | 'name_asc'
  | 'name_desc'
  | 'rating'
  | 'popular';

export interface ProductFilters {
  search: string;
  category_id?: number;
  min_price?: number;
  max_price?: number;
  in_stock_only: boolean;
  is_featured?: boolean;
  rating_min?: number;
  brand?: string;
}

export interface ProductQueryParams extends ProductFilters {
  page: number;
  page_size: number;
  sort_by: SortOption;
}

// =============================================================================
// UI STATE TYPES
// =============================================================================

export type ViewMode = 'grid' | 'list';

export interface PriceRange {
  min: number;
  max: number;
}

export interface FilterBadge {
  key: string;
  label: string;
  value: string | number | boolean;
}

// =============================================================================
// CART RELATED TYPES
// =============================================================================

export interface AddToCartPayload {
  product_id: number;
  variation_id?: number;
  quantity: number;
}

export interface CartItemProduct {
  id: number;
  name: string;
  price: number;
  primary_image?: string;
  stock: number;
}

// =============================================================================
// REVIEW TYPES
// =============================================================================

export interface CreateReviewPayload {
  rating: number;
  title?: string;
  comment?: string;
}

export interface ReviewsResponse {
  items: ProductReview[];
  total: number;
  average_rating: number;
  rating_distribution: Record<number, number>;
}
