import { useState } from 'react';
import { Star, ThumbsUp, User, Loader2, MessageSquare } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Rating from '@/components/ui/Rating';
import EmptyState from '@/components/ui/EmptyState';
import type { ProductReview } from '@/types/product';

interface ProductReviewsProps {
  reviews: ProductReview[];
  averageRating?: number;
  reviewCount?: number;
  isLoading?: boolean;
  onSubmitReview?: (review: { rating: number; title: string; content: string }) => Promise<void>;
  canReview?: boolean;
}

export function ProductReviews({
  reviews,
  averageRating = 0,
  reviewCount = 0,
  isLoading = false,
  onSubmitReview,
  canReview = false,
}: ProductReviewsProps) {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    content: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmitReview) return;

    if (formData.rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (formData.content.trim().length < 10) {
      setError('Review must be at least 10 characters');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmitReview(formData);
      setFormData({ rating: 5, title: '', content: '' });
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => {
    const count = reviews.filter((r) => Math.floor(r.rating) === rating).length;
    const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
    return { rating, count, percentage };
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-slate-800 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-40 bg-slate-800 rounded" />
          <div className="md:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-slate-800 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section id="reviews" className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          Customer Reviews
          {reviewCount > 0 && (
            <span className="ml-2 text-lg font-normal text-slate-400">
              ({reviewCount})
            </span>
          )}
        </h2>
        {canReview && onSubmitReview && !showForm && (
          <Button onClick={() => setShowForm(true)}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Write a Review
          </Button>
        )}
      </div>

      {/* Review Form */}
      {showForm && onSubmitReview && (
        <form
          onSubmit={handleSubmit}
          className="p-6 bg-slate-800/50 rounded-lg border border-slate-700 space-y-4"
        >
          <h3 className="text-lg font-semibold text-white">Write Your Review</h3>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">
              Your Rating
            </label>
            <Rating
              value={formData.rating}
              onChange={(rating) => setFormData((prev) => ({ ...prev, rating }))}
              size="lg"
              interactive
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">
              Review Title (optional)
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Summarize your experience"
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">
              Your Review
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
              placeholder="Share your thoughts about this product..."
              rows={4}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 resize-none"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowForm(false);
                setError(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {reviews.length === 0 && !showForm ? (
        <EmptyState
          type="products"
          title="No reviews yet"
          description="Be the first to review this product"
          action={
            canReview && onSubmitReview
              ? { label: 'Write a Review', onClick: () => setShowForm(true) }
              : undefined
          }
          icon={MessageSquare}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Rating Summary */}
          <div className="lg:col-span-1 space-y-4">
            <div className="text-center p-6 bg-slate-800/50 rounded-lg">
              <div className="text-5xl font-bold text-white mb-2">
                {averageRating.toFixed(1)}
              </div>
              <Rating value={averageRating} size="lg" />
              <p className="text-slate-400 mt-2">
                Based on {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <button
                  key={rating}
                  className="w-full flex items-center gap-2 text-sm hover:bg-slate-800/50 rounded p-1 transition-colors"
                >
                  <span className="flex items-center gap-1 w-12">
                    {rating}
                    <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                  </span>
                  <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-slate-400">{count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-3 space-y-6">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

interface ReviewCardProps {
  review: ProductReview;
}

function ReviewCard({ review }: ReviewCardProps) {
  const [helpfulCount, setHelpfulCount] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);

  const handleHelpful = () => {
    if (hasVoted) return;
    setHelpfulCount((prev) => prev + 1);
    setHasVoted(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <article className="p-6 bg-slate-800/30 rounded-lg border border-slate-800">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-slate-400" />
          </div>
          <div>
            <p className="font-medium text-white">{review.user_name}</p>
            {review.verified_purchase && (
              <span className="text-xs text-emerald-400">Verified Purchase</span>
            )}
          </div>
        </div>
        <time className="text-sm text-slate-500">{formatDate(review.created_at)}</time>
      </div>

      <div className="mt-4">
        <Rating value={review.rating} size="sm" />
        {review.title && (
          <h3 className="mt-2 font-semibold text-white">{review.title}</h3>
        )}
        <p className="mt-2 text-slate-300 leading-relaxed">{review.comment}</p>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700 flex items-center gap-4">
        <button
          onClick={handleHelpful}
          disabled={hasVoted}
          className={`
            flex items-center gap-1.5 text-sm transition-colors
            ${
              hasVoted
                ? 'text-emerald-400 cursor-default'
                : 'text-slate-400 hover:text-white'
            }
          `}
        >
          <ThumbsUp className={`h-4 w-4 ${hasVoted ? 'fill-current' : ''}`} />
          Helpful ({helpfulCount})
        </button>
      </div>
    </article>
  );
}

export default ProductReviews;
