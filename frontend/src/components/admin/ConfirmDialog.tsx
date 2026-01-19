/**
 * ConfirmDialog - Confirmation dialog component
 */
import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';
import { X, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import Button from '@/components/ui/Button';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  // Focus trap
  useEffect(() => {
    if (open && dialogRef.current) {
      const focusableElements = dialogRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      firstElement?.focus();
    }
  }, [open]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const icons = {
    danger: <AlertTriangle className="h-6 w-6 text-red-400" />,
    warning: <AlertCircle className="h-6 w-6 text-amber-400" />,
    info: <Info className="h-6 w-6 text-blue-400" />,
  };

  const iconBg = {
    danger: 'bg-red-500/10',
    warning: 'bg-amber-500/10',
    info: 'bg-blue-500/10',
  };

  const confirmVariant = {
    danger: 'danger',
    warning: 'primary',
    info: 'primary',
  } as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-message"
        className="relative w-full max-w-md animate-in fade-in zoom-in-95 rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-xl"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-700 hover:text-white"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="flex gap-4">
          <div className={clsx('flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full', iconBg[variant])}>
            {icons[variant]}
          </div>
          <div className="flex-1">
            <h3 id="dialog-title" className="text-lg font-semibold text-white">
              {title}
            </h3>
            <p id="dialog-message" className="mt-2 text-sm text-slate-400">
              {message}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button variant={confirmVariant[variant]} onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Processing...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
