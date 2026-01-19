/**
 * CouponInput - Coupon code input with validation
 */
import React, { useState } from 'react';
import { Tag, X, Check, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { useCouponStore } from '../../stores/featuresStore';

interface CouponInputProps {
  cartTotal: number;
  productIds?: number[];
  className?: string;
  onApply?: (discountAmount: number) => void;
}

const CouponInput: React.FC<CouponInputProps> = ({
  cartTotal,
  productIds,
  className,
  onApply,
}) => {
  const [code, setCode] = useState('');
  const {
    appliedCoupon,
    discountAmount,
    validationResult,
    isValidating,
    validateCoupon,
    removeCoupon,
  } = useCouponStore();

  const handleApply = async () => {
    if (!code.trim()) return;
    const isValid = await validateCoupon(code.trim(), cartTotal, productIds);
    if (isValid && onApply) {
      onApply(discountAmount);
    }
  };

  const handleRemove = () => {
    removeCoupon();
    setCode('');
    if (onApply) {
      onApply(0);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApply();
    }
  };

  // Applied coupon display
  if (appliedCoupon) {
    return (
      <div
        className={clsx(
          'flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
            <Tag className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-green-700">
                {appliedCoupon.code}
              </span>
              <Check className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-sm text-green-600">
              {appliedCoupon.discount_type === 'percentage'
                ? `${appliedCoupon.discount_value}% off`
                : appliedCoupon.discount_type === 'fixed'
                ? `TZS ${appliedCoupon.discount_value.toLocaleString()} off`
                : 'Free shipping'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-lg font-bold text-green-700">
            -TZS {discountAmount.toLocaleString()}
          </span>
          <button
            onClick={handleRemove}
            className="rounded-full p-1 text-green-600 hover:bg-green-100"
            aria-label="Remove coupon"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            placeholder="Enter coupon code"
            className={clsx(
              'w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2',
              validationResult && !validationResult.valid
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:border-orange-500 focus:ring-orange-200'
            )}
          />
        </div>
        <button
          onClick={handleApply}
          disabled={isValidating || !code.trim()}
          className={clsx(
            'rounded-lg px-6 py-2.5 text-sm font-medium transition-colors',
            isValidating || !code.trim()
              ? 'cursor-not-allowed bg-gray-200 text-gray-400'
              : 'bg-orange-500 text-white hover:bg-orange-600'
          )}
        >
          {isValidating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Apply'
          )}
        </button>
      </div>
      {validationResult && !validationResult.valid && (
        <p className="mt-2 text-sm text-red-500">{validationResult.message}</p>
      )}
    </div>
  );
};

export default CouponInput;
