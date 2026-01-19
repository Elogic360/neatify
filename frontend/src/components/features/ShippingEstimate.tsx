/**
 * ShippingEstimate - Display shipping options and costs
 */
import React, { useState, useEffect } from 'react';
import { Truck, Clock, MapPin, Package, Check } from 'lucide-react';
import clsx from 'clsx';
import { shippingService } from '../../services/featuresService';
import { ShippingZone } from '../../types/features';

interface ShippingEstimateProps {
  subtotal: number;
  weight?: number;
  destinationCity?: string;
  onSelectShipping?: (zone: ShippingZone) => void;
  selectedZoneId?: number;
  className?: string;
}

const ShippingEstimate: React.FC<ShippingEstimateProps> = ({
  subtotal,
  weight = 1,
  destinationCity,
  onSelectShipping,
  selectedZoneId,
  className,
}) => {
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchZones = async () => {
      try {
        setIsLoading(true);
        const data = await shippingService.getAllZones();
        setZones(data);
      } catch (err) {
        setError('Failed to load shipping options');
      } finally {
        setIsLoading(false);
      }
    };
    fetchZones();
  }, []);

  const calculateShippingCost = (zone: ShippingZone): number => {
    // Base rate + per-item calculation
    let cost = zone.base_rate;
    if (zone.per_item_rate && weight > 0) {
      cost += zone.per_item_rate * weight;
    }
    return cost;
  };

  const isFreeShipping = (zone: ShippingZone): boolean => {
    return zone.free_shipping_threshold !== null && 
           zone.free_shipping_threshold !== undefined &&
           subtotal >= zone.free_shipping_threshold;
  };

  if (isLoading) {
    return (
      <div className={clsx('space-y-3', className)}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse rounded-lg bg-gray-100 p-4">
            <div className="h-4 w-24 rounded bg-gray-200" />
            <div className="mt-2 h-3 w-16 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={clsx('rounded-lg bg-red-50 p-4 text-red-600', className)}>
        {error}
      </div>
    );
  }

  return (
    <div className={clsx('space-y-3', className)}>
      <div className="flex items-center gap-2 text-gray-700">
        <Truck className="h-5 w-5" />
        <h3 className="font-medium">Shipping Options</h3>
      </div>

      {destinationCity && (
        <p className="flex items-center gap-1 text-sm text-gray-500">
          <MapPin className="h-4 w-4" />
          Shipping to: {destinationCity}
        </p>
      )}

      <div className="space-y-2">
        {zones.map((zone) => {
          const cost = calculateShippingCost(zone);
          const free = isFreeShipping(zone);
          const isSelected = selectedZoneId === zone.id;

          return (
            <label
              key={zone.id}
              className={clsx(
                'flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all',
                isSelected
                  ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              )}
            >
              <input
                type="radio"
                name="shipping"
                checked={isSelected}
                onChange={() => onSelectShipping?.(zone)}
                className="mt-1 h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{zone.name}</span>
                  <span
                    className={clsx(
                      'font-semibold',
                      free ? 'text-green-600' : 'text-gray-900'
                    )}
                  >
                    {free ? 'FREE' : `TZS ${cost.toLocaleString()}`}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {zone.estimated_days_min}-{zone.estimated_days_max} days
                  </span>
                </div>
                {free && zone.free_shipping_threshold && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                    <Check className="h-3 w-3" />
                    Free shipping on orders over TZS {zone.free_shipping_threshold.toLocaleString()}
                  </div>
                )}
                {!free && zone.free_shipping_threshold && (
                  <div className="mt-2 text-xs text-gray-400">
                    Add TZS {(zone.free_shipping_threshold - subtotal).toLocaleString()} more
                    for free shipping
                  </div>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {/* Weight info */}
      {weight > 0 && (
        <p className="flex items-center gap-1 text-xs text-gray-400">
          <Package className="h-3 w-3" />
          Estimated package weight: {weight.toFixed(2)} kg
        </p>
      )}
    </div>
  );
};

export default ShippingEstimate;
