/**
 * SearchBar - Product search with suggestions and recent searches
 */
import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { Search, X, Clock, TrendingUp } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  recentSearches?: string[];
  onClearRecent?: () => void;
  placeholder?: string;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSubmit,
  recentSearches = [],
  onClearRecent,
  placeholder = 'Search products...',
  className,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFocus = () => {
    setIsFocused(true);
    if (recentSearches.length > 0 && !value) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowSuggestions(!newValue && recentSearches.length > 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit && value.trim()) {
      onSubmit(value.trim());
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
    setShowSuggestions(recentSearches.length > 0);
  };

  const handleSelectRecent = (search: string) => {
    onChange(search);
    if (onSubmit) {
      onSubmit(search);
    }
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={wrapperRef} className={clsx('relative', className)}>
      <form onSubmit={handleSubmit}>
        <div
          className={clsx(
            'flex items-center gap-3 rounded-xl border bg-white px-4 py-3 transition-all',
            isFocused
              ? 'border-orange-400 ring-2 ring-orange-100'
              : 'border-gray-200 hover:border-gray-300'
          )}
        >
          <Search
            className={clsx(
              'h-5 w-5 flex-shrink-0 transition-colors',
              isFocused ? 'text-orange-500' : 'text-gray-400'
            )}
          />
          
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
            aria-label="Search products"
          />

          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="flex-shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          <button
            type="submit"
            className={clsx(
              'flex-shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              value.trim()
                ? 'bg-orange-500 text-white hover:bg-orange-600'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            )}
            disabled={!value.trim()}
          >
            Search
          </button>
        </div>
      </form>

      {/* Recent searches dropdown */}
      {showSuggestions && recentSearches.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <Clock className="h-4 w-4" />
              Recent Searches
            </div>
            {onClearRecent && (
              <button
                type="button"
                onClick={() => {
                  onClearRecent();
                  setShowSuggestions(false);
                }}
                className="text-xs text-orange-500 hover:text-orange-600"
              >
                Clear all
              </button>
            )}
          </div>
          
          <ul className="max-h-64 overflow-y-auto">
            {recentSearches.map((search, index) => (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => handleSelectRecent(search)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                  {search}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
