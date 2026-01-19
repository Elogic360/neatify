/**
 * useProductDetail - Custom hook for single product operations
 */
import { useEffect, useState, useCallback } from 'react';
import { useProductStore } from '../stores/productStore';
import { productService } from '../services/productService';
import type { ProductReview, CreateReviewPayload, ReviewsResponse } from '../types/product';

export function useProductDetail(productId: number | string | undefined) {
  const {
    currentProduct,
    relatedProducts,
    productLoading,
    productError,
    fetchProductById,
  } = useProductStore();

  const [reviews, setReviews] = useState<ReviewsResponse>({
    items: [],
    total: 0,
    average_rating: 0,
    rating_distribution: {},
  });
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  // Track if we've already fetched for this product ID to prevent duplicate calls
  const [fetchedProductId, setFetchedProductId] = useState<number | null>(null);

  // Fetch product on ID change (with deduplication)
  useEffect(() => {
    if (productId) {
      const id = typeof productId === 'string' ? parseInt(productId, 10) : productId;
      if (!isNaN(id) && id !== fetchedProductId) {
        setFetchedProductId(id);
        fetchProductById(id);
        setSelectedImage(0);
        setQuantity(1);
        setSelectedVariation(null);
        // Reset reviews when changing products
        setReviews({ items: [], total: 0, average_rating: 0, rating_distribution: {} });
      }
    }
  }, [productId, fetchProductById, fetchedProductId]);

  // Fetch reviews function - only fetch if not already loaded by getProductDetail
  const fetchReviews = useCallback(async (page: number = 1) => {
    if (!productId) return;
    
    const id = typeof productId === 'string' ? parseInt(productId, 10) : productId;
    if (isNaN(id)) return;

    setReviewsLoading(true);
    try {
      const response = await productService.getProductReviews(id, page, 10);
      setReviews(response);
      setReviewsPage(page);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  }, [productId]);

  // Submit review
  const submitReview = useCallback(async (review: CreateReviewPayload): Promise<ProductReview | null> => {
    if (!productId) return null;
    
    const id = typeof productId === 'string' ? parseInt(productId, 10) : productId;
    if (isNaN(id)) return null;

    try {
      const newReview = await productService.createReview(id, review);
      // Refresh reviews
      await fetchReviews(1);
      return newReview;
    } catch (error) {
      console.error('Failed to submit review:', error);
      throw error;
    }
  }, [productId, fetchReviews]);

  // Calculate effective price with variation modifier
  const effectivePrice = currentProduct
    ? (() => {
        const basePrice = currentProduct.price;
        const variation = currentProduct.variations.find((v) => v.id === selectedVariation);
        const modifier = variation?.price_modifier || 0;
        return basePrice + modifier;
      })()
    : 0;

  // Check stock availability
  const stockAvailable = currentProduct
    ? (() => {
        if (selectedVariation) {
          const variation = currentProduct.variations.find((v) => v.id === selectedVariation);
          return variation?.stock || 0;
        }
        return currentProduct.stock;
      })()
    : 0;

  // Check if in stock
  const inStock = stockAvailable > 0;

  // Can add to cart
  const canAddToCart = inStock && quantity <= stockAvailable;

  // Update quantity
  const updateQuantity = useCallback((delta: number) => {
    setQuantity((prev) => {
      const newVal = prev + delta;
      if (newVal < 1) return 1;
      if (newVal > stockAvailable) return stockAvailable;
      return newVal;
    });
  }, [stockAvailable]);

  // Set exact quantity
  const setExactQuantity = useCallback((qty: number) => {
    if (qty < 1) qty = 1;
    if (qty > stockAvailable) qty = stockAvailable;
    setQuantity(qty);
  }, [stockAvailable]);

  // Get add to cart payload
  const getAddToCartPayload = useCallback(() => {
    if (!currentProduct) return null;
    return {
      product_id: currentProduct.id,
      variation_id: selectedVariation || undefined,
      quantity,
    };
  }, [currentProduct, selectedVariation, quantity]);

  // Navigation helpers for images
  const nextImage = useCallback(() => {
    if (!currentProduct) return;
    const maxIndex = currentProduct.images.length - 1;
    setSelectedImage((prev) => (prev < maxIndex ? prev + 1 : 0));
  }, [currentProduct]);

  const prevImage = useCallback(() => {
    if (!currentProduct) return;
    const maxIndex = currentProduct.images.length - 1;
    setSelectedImage((prev) => (prev > 0 ? prev - 1 : maxIndex));
  }, [currentProduct]);

  return {
    // Product data
    product: currentProduct,
    relatedProducts,
    
    // Loading states
    isLoading: productLoading,
    error: productError,
    
    // Reviews
    reviews,
    reviewsLoading,
    reviewsPage,
    fetchReviews,
    submitReview,
    
    // Variations
    selectedVariation,
    setSelectedVariation,
    
    // Images
    selectedImage,
    setSelectedImage,
    nextImage,
    prevImage,
    
    // Quantity
    quantity,
    updateQuantity,
    setExactQuantity,
    
    // Computed values
    effectivePrice,
    stockAvailable,
    inStock,
    canAddToCart,
    
    // Cart helper
    getAddToCartPayload,
  };
}

export type UseProductDetailReturn = ReturnType<typeof useProductDetail>;

export default useProductDetail;
