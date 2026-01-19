/**
 * Rating - Star rating display and input component
 */
import React from 'react';
import clsx from 'clsx';
import { Star } from 'lucide-react';

interface RatingProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  showCount?: boolean;
  count?: number;
  interactive?: boolean;
  onChange?: (value: number) => void;
  className?: string;
}

const Rating: React.FC<RatingProps> = ({
  value,
  max = 5,
  size = 'md',
  showValue = false,
  showCount = false,
  count = 0,
  interactive = false,
  onChange,
  className,
}) => {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);

  const sizeStyles = {
    sm: 'h-3.5 w-3.5',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const textStyles = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  // Ensure value is always a valid number
  const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
  const displayValue = hoverValue ?? safeValue;

  const handleClick = (starValue: number) => {
    if (interactive && onChange) {
      onChange(starValue);
    }
  };

  const handleMouseEnter = (starValue: number) => {
    if (interactive) {
      setHoverValue(starValue);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverValue(null);
    }
  };

  return (
    <div className={clsx('flex items-center gap-1', className)}>
      <div className="flex" onMouseLeave={handleMouseLeave}>
        {Array.from({ length: max }).map((_, i) => {
          const starValue = i + 1;
          const isFilled = starValue <= displayValue;
          const isHalf = !isFilled && starValue - 0.5 <= displayValue;

          return (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              className={clsx(
                'relative',
                interactive && 'cursor-pointer transition-transform hover:scale-110',
                !interactive && 'cursor-default'
              )}
              aria-label={`${starValue} star${starValue !== 1 ? 's' : ''}`}
            >
              {/* Empty star (background) */}
              <Star
                className={clsx(
                  sizeStyles[size],
                  'text-gray-300'
                )}
                fill="currentColor"
              />
              
              {/* Filled star (overlay) */}
              <div
                className={clsx(
                  'absolute inset-0 overflow-hidden',
                  isFilled ? 'rating-fill-full' : isHalf ? 'rating-fill-half' : 'rating-fill-empty'
                )}
              >
                <Star
                  className={clsx(
                    sizeStyles[size],
                    'text-yellow-400'
                  )}
                  fill="currentColor"
                />
              </div>
            </button>
          );
        })}
      </div>

      {showValue && safeValue > 0 && (
        <span className={clsx('font-medium text-gray-700', textStyles[size])}>
          {safeValue.toFixed(1)}
        </span>
      )}

      {showCount && count > 0 && (
        <span className={clsx('text-gray-500', textStyles[size])}>
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
};

export default Rating;
