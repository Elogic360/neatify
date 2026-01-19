/**
 * Features Store - Zustand stores for V1.5 features
 * Manages state for wishlists, coupons, loyalty, notifications
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  wishlistService,
  couponService,
  loyaltyService,
  notificationService,
} from '../services/featuresService';
import type {
  WishlistItem,
  Coupon,
  CouponValidationResult,
  LoyaltyBalance,
  LoyaltyTransaction,
  Notification,
} from '../types/features';

// =============================================================================
// WISHLIST STORE
// =============================================================================
interface WishlistState {
  items: WishlistItem[];
  productIds: number[];
  isLoading: boolean;
  error: string | null;
  // Actions
  fetchWishlist: () => Promise<void>;
  addToWishlist: (productId: number) => Promise<boolean>;
  removeFromWishlist: (productId: number) => Promise<boolean>;
  toggleWishlist: (productId: number) => Promise<boolean>;
  isInWishlist: (productId: number) => boolean;
  togglePriceNotification: (productId: number, notify: boolean) => Promise<void>;
  clearError: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      productIds: [],
      isLoading: false,
      error: null,

      fetchWishlist: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await wishlistService.getWishlist();
          set({
            items: response.items,
            productIds: response.items.map((item) => item.product_id),
            isLoading: false,
          });
        } catch (error: any) {
          // Silently fail if wishlist endpoint doesn't exist (404)
          if (error?.response?.status === 404) {
            set({ items: [], productIds: [], isLoading: false });
          } else {
            set({ error: 'Failed to fetch wishlist', isLoading: false });
          }
        }
      },

      addToWishlist: async (productId: number) => {
        try {
          const item = await wishlistService.addToWishlist(productId);
          set((state) => ({
            items: [...state.items, item],
            productIds: [...state.productIds, productId],
          }));
          return true;
        } catch (error) {
          set({ error: 'Failed to add to wishlist' });
          return false;
        }
      },

      removeFromWishlist: async (productId: number) => {
        try {
          await wishlistService.removeFromWishlist(productId);
          set((state) => ({
            items: state.items.filter((item) => item.product_id !== productId),
            productIds: state.productIds.filter((id) => id !== productId),
          }));
          return true;
        } catch (error) {
          set({ error: 'Failed to remove from wishlist' });
          return false;
        }
      },

      toggleWishlist: async (productId: number) => {
        const isIn = get().isInWishlist(productId);
        if (isIn) {
          return get().removeFromWishlist(productId);
        } else {
          return get().addToWishlist(productId);
        }
      },

      isInWishlist: (productId: number) => {
        return get().productIds.includes(productId);
      },

      togglePriceNotification: async (productId: number, notify: boolean) => {
        try {
          const updated = await wishlistService.togglePriceNotification(productId, notify);
          set((state) => ({
            items: state.items.map((item) =>
              item.product_id === productId ? updated : item
            ),
          }));
        } catch (error) {
          set({ error: 'Failed to update notification preference' });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'wishlist-storage',
      partialize: (state) => ({ productIds: state.productIds }),
    }
  )
);

// =============================================================================
// COUPON STORE
// =============================================================================
interface CouponState {
  appliedCoupon: Coupon | null;
  discountAmount: number;
  validationResult: CouponValidationResult | null;
  isValidating: boolean;
  error: string | null;
  // Actions
  validateCoupon: (code: string, cartTotal: number, productIds?: number[]) => Promise<boolean>;
  applyCoupon: (coupon: Coupon, discountAmount: number) => void;
  removeCoupon: () => void;
  clearError: () => void;
}

export const useCouponStore = create<CouponState>()((set) => ({
  appliedCoupon: null,
  discountAmount: 0,
  validationResult: null,
  isValidating: false,
  error: null,

  validateCoupon: async (code: string, cartTotal: number, productIds?: number[]) => {
    set({ isValidating: true, error: null, validationResult: null });
    try {
      const result = await couponService.validateCoupon({
        code,
        cart_total: cartTotal,
        product_ids: productIds,
      });
      set({ validationResult: result, isValidating: false });
      if (result.valid && result.coupon) {
        set({ appliedCoupon: result.coupon, discountAmount: result.discount_amount });
      }
      return result.valid;
    } catch (error) {
      set({ error: 'Failed to validate coupon', isValidating: false });
      return false;
    }
  },

  applyCoupon: (coupon: Coupon, discountAmount: number) => {
    set({ appliedCoupon: coupon, discountAmount });
  },

  removeCoupon: () => {
    set({ appliedCoupon: null, discountAmount: 0, validationResult: null });
  },

  clearError: () => set({ error: null }),
}));

// =============================================================================
// LOYALTY STORE
// =============================================================================
interface LoyaltyState {
  balance: LoyaltyBalance | null;
  history: LoyaltyTransaction[];
  isLoading: boolean;
  error: string | null;
  // Actions
  fetchBalance: () => Promise<void>;
  fetchHistory: (skip?: number, limit?: number) => Promise<void>;
  redeemPoints: (points: number) => Promise<{ success: boolean; discount: number }>;
  clearError: () => void;
}

export const useLoyaltyStore = create<LoyaltyState>()((set, get) => ({
  balance: null,
  history: [],
  isLoading: false,
  error: null,

  fetchBalance: async () => {
    set({ isLoading: true, error: null });
    try {
      const balance = await loyaltyService.getBalance();
      set({ balance, history: balance.history, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch loyalty balance', isLoading: false });
    }
  },

  fetchHistory: async (skip = 0, limit = 50) => {
    set({ isLoading: true, error: null });
    try {
      const history = await loyaltyService.getHistory(skip, limit);
      set({ history, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch loyalty history', isLoading: false });
    }
  },

  redeemPoints: async (points: number) => {
    try {
      const result = await loyaltyService.redeemPoints({ points_to_redeem: points });
      if (result.success) {
        // Refresh balance after redemption
        await get().fetchBalance();
      }
      return { success: result.success, discount: result.discount_amount };
    } catch (error) {
      set({ error: 'Failed to redeem points' });
      return { success: false, discount: 0 };
    }
  },

  clearError: () => set({ error: null }),
}));

// =============================================================================
// NOTIFICATION STORE
// =============================================================================
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  total: number;
  isLoading: boolean;
  error: string | null;
  // Actions
  fetchNotifications: (unreadOnly?: boolean) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearError: () => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  notifications: [],
  unreadCount: 0,
  total: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async (unreadOnly = false) => {
    set({ isLoading: true, error: null });
    try {
      const result = await notificationService.getNotifications({
        unread_only: unreadOnly,
        limit: 50,
      });
      set({
        notifications: result.items,
        unreadCount: result.unread_count,
        total: result.total,
        isLoading: false,
      });
    } catch (error) {
      set({ error: 'Failed to fetch notifications', isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const count = await notificationService.getUnreadCount();
      set({ unreadCount: count });
    } catch (error) {
      // Silently fail for count updates
    }
  },

  markAsRead: async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      set({ error: 'Failed to mark notification as read' });
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationService.markAllAsRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      set({ error: 'Failed to mark all as read' });
    }
  },

  clearError: () => set({ error: null }),
}));
