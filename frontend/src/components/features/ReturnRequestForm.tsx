/**
 * ReturnRequestForm - Create a return request for an order
 */
import React, { useState } from 'react';
import { Package, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import clsx from 'clsx';
import { returnService } from '../../services/featuresService';
import { ReturnRequest } from '../../types/features';

interface ReturnRequestFormProps {
  orderId: number;
  orderItems: Array<{
    id: number;
    product_name: string;
    quantity: number;
    price: number;
  }>;
  onSuccess?: (returnRequest: ReturnRequest) => void;
  onCancel?: () => void;
  className?: string;
}

const RETURN_REASONS = [
  { value: 'defective', label: 'Defective/Damaged Product' },
  { value: 'wrong_item', label: 'Wrong Item Received' },
  { value: 'not_as_described', label: 'Not As Described' },
  { value: 'changed_mind', label: 'Changed My Mind' },
  { value: 'size_issue', label: 'Size/Fit Issue' },
  { value: 'quality', label: 'Quality Not Satisfactory' },
  { value: 'other', label: 'Other' },
];

const ReturnRequestForm: React.FC<ReturnRequestFormProps> = ({
  orderId,
  orderItems,
  onSuccess,
  onCancel,
  className,
}) => {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleItemToggle = (itemId: number) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }
    setImages((prev) => [...prev, ...files].slice(0, 5));
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (selectedItems.length === 0) {
      setError('Please select at least one item to return');
      return;
    }

    if (!reason) {
      setError('Please select a reason for return');
      return;
    }

    setIsSubmitting(true);

    try {
      const returnRequest = await returnService.createReturn({
        order_id: orderId,
        reason,
        description,
      });

      setSuccess(true);
      onSuccess?.(returnRequest);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit return request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className={clsx('rounded-xl border bg-green-50 p-6 text-center', className)}>
        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
        <h3 className="mt-4 text-lg font-semibold text-green-800">
          Return Request Submitted
        </h3>
        <p className="mt-2 text-green-600">
          We'll review your request and get back to you within 24-48 hours.
        </p>
        <button
          onClick={onCancel}
          className="mt-4 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={clsx('rounded-xl border bg-white p-6', className)}
    >
      <div className="flex items-center gap-3 border-b pb-4">
        <Package className="h-6 w-6 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">Request Return</h2>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Select Items */}
      <div className="mt-6">
        <label className="text-sm font-medium text-gray-700">
          Select items to return
        </label>
        <div className="mt-2 space-y-2">
          {orderItems.map((item) => (
            <label
              key={item.id}
              className={clsx(
                'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors',
                selectedItems.includes(item.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:bg-gray-50'
              )}
            >
              <input
                type="checkbox"
                checked={selectedItems.includes(item.id)}
                onChange={() => handleItemToggle(item.id)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{item.product_name}</p>
                <p className="text-sm text-gray-500">
                  Qty: {item.quantity} × TZS {item.price.toLocaleString()}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Reason */}
      <div className="mt-6">
        <label
          htmlFor="return-reason"
          className="text-sm font-medium text-gray-700"
        >
          Reason for return
        </label>
        <select
          id="return-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          required
        >
          <option value="">Select a reason</option>
          {RETURN_REASONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div className="mt-4">
        <label
          htmlFor="return-description"
          className="text-sm font-medium text-gray-700"
        >
          Additional details (optional)
        </label>
        <textarea
          id="return-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Please provide any additional details about your return request..."
        />
      </div>

      {/* Image Upload */}
      <div className="mt-4">
        <label className="text-sm font-medium text-gray-700">
          Upload images (optional, max 5)
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {images.map((file, index) => (
            <div key={index} className="relative h-20 w-20">
              <img
                src={URL.createObjectURL(file)}
                alt={`Upload ${index + 1}`}
                className="h-full w-full rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
              >
                <span className="sr-only">Remove</span>
                ×
              </button>
            </div>
          ))}
          {images.length < 5 && (
            <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-500">
              <Upload className="h-6 w-6" />
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                aria-label="Upload return images"
              />
            </label>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Submitting...
            </span>
          ) : (
            'Submit Request'
          )}
        </button>
      </div>
    </form>
  );
};

export default ReturnRequestForm;
