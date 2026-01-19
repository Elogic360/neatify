/**
 * EmptyState - Empty state placeholder component
 */
import React from 'react';
import clsx from 'clsx';
import { Package, Search, ShoppingCart, AlertCircle, LucideIcon } from 'lucide-react';
import Button from './Button';

type EmptyStateType = 'products' | 'search' | 'cart' | 'error' | 'custom';

interface EmptyStateProps {
  type?: EmptyStateType;
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const defaultContent: Record<EmptyStateType, { icon: LucideIcon; title: string; description: string }> = {
  products: {
    icon: Package,
    title: 'No products found',
    description: 'Try adjusting your filters or search terms to find what you\'re looking for.',
  },
  search: {
    icon: Search,
    title: 'No search results',
    description: 'We couldn\'t find any products matching your search. Try different keywords.',
  },
  cart: {
    icon: ShoppingCart,
    title: 'Your cart is empty',
    description: 'Looks like you haven\'t added any items to your cart yet.',
  },
  error: {
    icon: AlertCircle,
    title: 'Something went wrong',
    description: 'We encountered an error while loading. Please try again.',
  },
  custom: {
    icon: Package,
    title: 'Nothing here',
    description: 'This section is empty.',
  },
};

const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'products',
  icon: CustomIcon,
  title,
  description,
  action,
  secondaryAction,
  className,
}) => {
  const defaults = defaultContent[type];
  const Icon = CustomIcon || defaults.icon;
  const displayTitle = title || defaults.title;
  const displayDescription = description || defaults.description;

  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center rounded-xl bg-gray-50 px-6 py-16 text-center',
        className
      )}
    >
      <div className="mb-4 rounded-full bg-gray-100 p-4">
        <Icon className="h-10 w-10 text-gray-400" strokeWidth={1.5} />
      </div>
      
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{displayTitle}</h3>
      
      <p className="mb-6 max-w-md text-sm text-gray-500">{displayDescription}</p>

      {(action || secondaryAction) && (
        <div className="flex flex-col gap-3 sm:flex-row">
          {action && (
            <Button onClick={action.onClick} variant="primary">
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button onClick={secondaryAction.onClick} variant="secondary">
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
