/**
 * Select - Dropdown select component
 */
import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: SelectOption[];
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  error?: string;
  label?: string;
  fullWidth?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options,
      placeholder,
      size = 'md',
      error,
      label,
      fullWidth = false,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeStyles = {
      sm: 'px-2.5 py-1.5 text-xs',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-2.5 text-base',
    };

    return (
      <div className={clsx('relative', fullWidth && 'w-full')}>
        {label && (
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            disabled={disabled}
            className={clsx(
              'appearance-none rounded-lg border bg-white pr-10 transition-colors',
              'focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200',
              sizeStyles[size],
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                : 'border-gray-300',
              disabled && 'cursor-not-allowed bg-gray-100 opacity-60',
              fullWidth && 'w-full',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className={clsx(
              'pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400',
              size === 'sm' && 'h-3.5 w-3.5',
              size === 'md' && 'h-4 w-4',
              size === 'lg' && 'h-5 w-5'
            )}
          />
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
