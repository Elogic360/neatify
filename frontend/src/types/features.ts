/**
 * Types for V1.5 Features
 * Wishlists, Coupons, Loyalty, Notifications, Returns, Shipping
 */

// =============================================================================
// WISHLIST TYPES
// =============================================================================
export interface WishlistItem {
  id: number;
  user_id: number;
  product_id: number;
  added_at: string;
  price_at_addition: number | null;
  notify_on_price_drop: boolean;
  product?: {
    id: number;
    name: string;
    price: number;
    original_price?: number;
    primary_image?: string;
    is_active: boolean;
    stock: number;
  };
}

export interface WishlistResponse {
  items: WishlistItem[];
  total: number;
}

// =============================================================================
// COUPON TYPES
// =============================================================================
export interface Coupon {
  id: number;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed' | 'free_shipping';
  discount_value: number;
  min_purchase_amount?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  usage_count: number;
  valid_from?: string;
  valid_until?: string;
  applicable_categories: number[];
  applicable_products: number[];
  is_active: boolean;
  created_at: string;
}

export interface CouponValidation {
  code: string;
  cart_total: number;
  product_ids?: number[];
  category_ids?: number[];
}

export interface CouponValidationResult {
  valid: boolean;
  discount_amount: number;
  message: string;
  coupon?: Coupon;
}

export interface CouponCreate {
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed' | 'free_shipping';
  discount_value: number;
  min_purchase_amount?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  valid_from?: string;
  valid_until?: string;
  applicable_categories?: number[];
  applicable_products?: number[];
  is_active?: boolean;
}

// =============================================================================
// LOYALTY TYPES
// =============================================================================
export interface LoyaltyTransaction {
  id: number;
  user_id: number;
  points: number;
  transaction_type: 'earned' | 'redeemed' | 'expired' | 'adjusted';
  reference_id?: number;
  description?: string;
  expires_at?: string;
  created_at: string;
}

export interface LoyaltyBalance {
  total_points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  points_to_next_tier: number;
  history: LoyaltyTransaction[];
}

export interface LoyaltyRedemption {
  points_to_redeem: number;
}

export interface LoyaltyRedemptionResult {
  success: boolean;
  points_redeemed: number;
  discount_amount: number;
  remaining_points: number;
  message: string;
}

// =============================================================================
// NOTIFICATION TYPES
// =============================================================================
export interface Notification {
  id: number;
  user_id: number;
  type: 'order' | 'promo' | 'system' | 'price_alert' | 'stock_alert';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  is_read: boolean;
  sent_at?: string;
  created_at: string;
}

export interface NotificationList {
  items: Notification[];
  unread_count: number;
  total: number;
}

// =============================================================================
// RETURN REQUEST TYPES
// =============================================================================
export interface ReturnRequest {
  id: number;
  order_id: number;
  user_id: number;
  reason: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  refund_amount?: number;
  approved_by?: number;
  approved_at?: string;
  created_at: string;
}

export interface ReturnRequestCreate {
  order_id: number;
  reason: string;
  description?: string;
}

// =============================================================================
// SHIPPING TYPES
// =============================================================================
export interface ShippingZone {
  id: number;
  name: string;
  countries: string[];
  states?: string[];
  postal_codes?: string[];
  base_rate: number;
  per_item_rate: number;
  free_shipping_threshold?: number;
  estimated_days_min?: number;
  estimated_days_max?: number;
  is_active: boolean;
}

export interface ShippingCalculation {
  country: string;
  state?: string;
  postal_code?: string;
  item_count: number;
  cart_total: number;
}

export interface ShippingCalculationResult {
  zone_id: number;
  zone_name: string;
  shipping_cost: number;
  is_free_shipping: boolean;
  estimated_days_min?: number;
  estimated_days_max?: number;
}

// =============================================================================
// ANALYTICS TYPES (Admin)
// =============================================================================
export interface AnalyticsSummary {
  total_orders: number;
  total_revenue: number;
  total_customers: number;
  total_products: number;
  orders_today: number;
  revenue_today: number;
  top_products: Array<{
    id: number;
    name: string;
    sales: number;
    revenue: number;
  }>;
  recent_orders: Array<{
    id: number;
    order_number: string;
    total: number;
    status: string;
    created_at: string;
  }>;
}

export interface ProductViewStats {
  product_id: number;
  total_views: number;
  unique_users: number;
  avg_duration?: number;
}

// =============================================================================
// WEBSOCKET TYPES
// =============================================================================
export interface WebSocketMessage {
  type: string;
  data?: unknown;
  product_id?: number;
  order_id?: number;
}

export type WebSocketAction =
  | { action: 'ping' }
  | { action: 'subscribe'; channel: string }
  | { action: 'unsubscribe'; channel: string }
  | { action: 'watch_product'; product_id: number }
  | { action: 'unwatch_product'; product_id: number }
  | { action: 'watch_order'; order_id: number }
  | { action: 'unwatch_order'; order_id: number };
