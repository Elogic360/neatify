# ShopHub E-Commerce v1.5 Feature Expansion

## Overview

Version 1.5 brings significant feature enhancements to the ShopHub platform without incorporating AI features (reserved for v2.0). This upgrade adds customer engagement features, analytics, order management improvements, and real-time capabilities.

## New Features

### 1. Wishlists
- Users can save products to wishlists
- Price tracking for wishlist items
- Price drop notifications

**API Endpoints:**
- `GET /api/v1/wishlist` - Get user's wishlist
- `POST /api/v1/wishlist` - Add product to wishlist
- `DELETE /api/v1/wishlist/{product_id}` - Remove from wishlist
- `GET /api/v1/wishlist/{product_id}/check` - Check if product is in wishlist

### 2. Coupons & Discounts
- Support for percentage, fixed amount, and free shipping discounts
- Min purchase requirements
- Max discount caps
- Usage limits (global and per-user)
- Category and product-specific coupons
- Validity periods

**API Endpoints:**
- `POST /api/v1/coupons/validate` - Validate a coupon code
- `GET /api/v1/coupons` - List active coupons (admin)
- `POST /api/v1/coupons` - Create coupon (admin)
- `PUT /api/v1/coupons/{id}` - Update coupon (admin)
- `DELETE /api/v1/coupons/{id}` - Deactivate coupon (admin)

### 3. Loyalty Points
- Earn points on purchases
- Redeem points for discounts
- Multiple transaction types (earned, redeemed, expired, adjusted)
- Point expiration support
- Tier system (bronze, silver, gold, platinum)

**API Endpoints:**
- `GET /api/v1/loyalty/balance` - Get user's point balance
- `GET /api/v1/loyalty/history` - Get points transaction history
- `POST /api/v1/loyalty/redeem` - Redeem points

### 4. Notifications
- In-app notification system
- Multiple notification types (order, promo, system, price_alert)
- Read/unread tracking
- JSON metadata support

**API Endpoints:**
- `GET /api/v1/notifications` - Get user notifications
- `GET /api/v1/notifications/unread-count` - Get unread count
- `PUT /api/v1/notifications/{id}/read` - Mark as read
- `PUT /api/v1/notifications/mark-all-read` - Mark all as read

### 5. Analytics Dashboard (Admin)
- Revenue tracking
- Order statistics
- Product view analytics
- Customer growth metrics
- Top products reporting

**API Endpoints:**
- `POST /api/v1/admin/analytics/track-view` - Track product view
- `GET /api/v1/admin/analytics/dashboard` - Get dashboard summary
- `GET /api/v1/admin/analytics/revenue` - Revenue over time
- `GET /api/v1/admin/analytics/top-products` - Best selling products
- `GET /api/v1/admin/analytics/product-views` - Product view statistics

### 6. Returns Management
- Customer return requests
- Admin approval workflow
- Status tracking (pending, approved, rejected, completed)
- Refund amount tracking

**API Endpoints:**
- `POST /api/v1/returns` - Create return request
- `GET /api/v1/returns` - List user's return requests
- `GET /api/v1/returns/{id}` - Get return details
- `PUT /api/v1/returns/{id}/status` - Update return status (admin)

### 7. Shipping Zones
- Region-based shipping rates
- Country, state, postal code targeting
- Base rate + per-item rate
- Free shipping thresholds
- Delivery time estimates

**API Endpoints:**
- `GET /api/v1/admin/shipping/zones` - List shipping zones
- `POST /api/v1/admin/shipping/zones` - Create zone
- `PUT /api/v1/admin/shipping/zones/{id}` - Update zone
- `DELETE /api/v1/admin/shipping/zones/{id}` - Delete zone
- `POST /api/v1/admin/shipping/calculate` - Calculate shipping cost

### 8. WebSocket Real-Time Updates
- Live inventory updates
- Order status notifications
- Price alert notifications
- Admin broadcast capability

**WebSocket Endpoints:**
- `ws://host/ws` - Main WebSocket connection
- `ws://host/ws/admin` - Admin-only WebSocket

**WebSocket Actions:**
- `subscribe` / `unsubscribe` - Channel subscription
- `watch_product` / `unwatch_product` - Product inventory alerts
- `watch_order` / `unwatch_order` - Order status updates
- `ping` - Keepalive

## Database Changes

### New Tables
1. `wishlists` - User product wishlists
2. `coupons` - Discount coupon definitions
3. `coupon_usage` - Coupon usage tracking
4. `loyalty_points` - Point transactions
5. `notifications` - User notifications
6. `product_views` - Analytics tracking
7. `price_history` - Product price changes
8. `abandoned_carts` - Abandoned cart recovery
9. `shipping_zones` - Shipping rate zones
10. `tax_rates` - Tax configuration
11. `return_requests` - Return management
12. `product_bundles` - Bundle definitions
13. `bundle_products` - Bundle product associations

### Enhanced Tables
- `users` - Added loyalty_tier, loyalty_points, last_seen_at, preferred_currency
- `products` - Added view_count, tags, meta_title, meta_description, weight, dimensions
- `orders` - Added tracking_number, carrier, estimated_delivery, coupon_code, discount_amount, loyalty_points_earned/used

## Migration

Run the following to apply v1.5 database changes:

```bash
cd backend
alembic upgrade head
```

## Configuration

No new environment variables required for v1.5 core features.

Optional settings can be added to `.env`:
```
# Loyalty Program
LOYALTY_POINTS_PER_DOLLAR=1
LOYALTY_REDEMPTION_RATE=0.01

# Shipping
DEFAULT_SHIPPING_ZONE=1
```

## API Documentation

After starting the server, view the updated API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Version History

- **v1.0.0** - Initial release
- **v1.5.0** - Feature expansion (current)
  - Wishlists with price tracking
  - Coupons & discount system
  - Loyalty points program
  - Notification system
  - Analytics dashboard
  - Returns management
  - Shipping zones
  - Real-time WebSocket updates
