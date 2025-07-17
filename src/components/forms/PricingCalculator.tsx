'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { calculateQuoteAction, saveQuoteAction } from '@/lib/actions/quoteActions';
import { RampConfiguration } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/pricing';
import { Plus, Minus, Calculator, Save } from 'lucide-react';

interface PricingCalculatorProps {
  inquiryId?: number;
  defaultAddress?: string;
  onQuoteSaved?: () => void;
}

interface PricingResult {
  deliveryFee: number;
  installFee: number;
  monthlyRate: number;
  upfrontTotal: number;
  surcharge: number;
  distance?: number;
}

export function PricingCalculator({ inquiryId, defaultAddress: _defaultAddress, onQuoteSaved }: PricingCalculatorProps) {
  const [rampConfig, setRampConfig] = useState<RampConfiguration>({
    platforms: [{ size: '5x5', quantity: 1 }],
    ramps: [{ length: 6, quantity: 1 }],
  });
  const [pricing, setPricing] = useState<PricingResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const platformSizes = ['4x4', '5x5', '6x6', '8x8'];

  const addPlatform = () => {
    setRampConfig(prev => ({
      ...prev,
      platforms: [...prev.platforms, { size: '5x5', quantity: 1 }],
    }));
  };

  const removePlatform = (index: number) => {
    setRampConfig(prev => ({
      ...prev,
      platforms: prev.platforms.filter((_, i) => i !== index),
    }));
  };

  const updatePlatform = (index: number, field: 'size' | 'quantity', value: string | number) => {
    setRampConfig(prev => ({
      ...prev,
      platforms: prev.platforms.map((platform, i) =>
        i === index ? { ...platform, [field]: value } : platform
      ),
    }));
  };

  const addRamp = () => {
    setRampConfig(prev => ({
      ...prev,
      ramps: [...prev.ramps, { length: 6, quantity: 1 }],
    }));
  };

  const removeRamp = (index: number) => {
    setRampConfig(prev => ({
      ...prev,
      ramps: prev.ramps.filter((_, i) => i !== index),
    }));
  };

  const updateRamp = (index: number, field: 'length' | 'quantity', value: number) => {
    setRampConfig(prev => ({
      ...prev,
      ramps: prev.ramps.map((ramp, i) =>
        i === index ? { ...ramp, [field]: value } : ramp
      ),
    }));
  };

  const calculatePricing = async () => {
    if (!inquiryId) {
      setError('Inquiry ID is required');
      return;
    }

    setIsCalculating(true);
    setError(null);

    try {
      const result = await calculateQuoteAction(inquiryId, rampConfig);
      
      if (result.success) {
        setPricing(result.data as PricingResult);
      } else {
        setError(result.error || 'Failed to calculate pricing');
      }
    } catch (_err) {
      setError('An error occurred while calculating pricing');
    } finally {
      setIsCalculating(false);
    }
  };

  const saveQuote = async () => {
    if (!inquiryId || !pricing) {
      setError('Missing required data to save quote');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const result = await saveQuoteAction(inquiryId, {
        ...pricing,
        rampConfig,
      });

      if (result.success) {
        onQuoteSaved?.();
      } else {
        setError(result.error || 'Failed to save quote');
      }
    } catch (_err) {
      setError('An error occurred while saving quote');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Ramp Configuration</h3>
        
        {/* Platforms */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-medium">Platforms</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPlatform}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Platform
            </Button>
          </div>
          
          <div className="space-y-3">
            {rampConfig.platforms.map((platform, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Select
                  value={platform.size}
                  onChange={(e) => updatePlatform(index, 'size', e.target.value)}
                >
                  {platformSizes.map(size => (
                    <option key={size} value={size}>
                      {size} feet
                    </option>
                  ))}
                </Select>
                
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={platform.quantity}
                  onChange={(e) => updatePlatform(index, 'quantity', parseInt(e.target.value) || 1)}
                  className="w-20"
                />
                
                {rampConfig.platforms.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removePlatform(index)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Ramps */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-medium">Ramps</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRamp}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Ramp
            </Button>
          </div>
          
          <div className="space-y-3">
            {rampConfig.ramps.map((ramp, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    min="2"
                    max="32"
                    step="2"
                    value={ramp.length}
                    onChange={(e) => updateRamp(index, 'length', parseInt(e.target.value) || 6)}
                    className="w-20"
                  />
                  <span className="text-sm text-gray-500">feet</span>
                </div>
                
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={ramp.quantity}
                  onChange={(e) => updateRamp(index, 'quantity', parseInt(e.target.value) || 1)}
                  className="w-20"
                />
                
                {rampConfig.ramps.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeRamp(index)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        </div>
      )}

      <div className="flex space-x-3">
        <Button
          onClick={calculatePricing}
          disabled={isCalculating || !inquiryId}
        >
          <Calculator className="h-4 w-4 mr-2" />
          {isCalculating ? 'Calculating...' : 'Calculate Quote'}
        </Button>

        {pricing && (
          <Button
            onClick={saveQuote}
            disabled={isSaving}
            variant="outline"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Quote'}
          </Button>
        )}
      </div>

      {pricing && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Pricing Breakdown</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Delivery Fee:</span>
                <span className="text-sm font-medium">
                  {formatCurrency(pricing.deliveryFee)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Installation Fee:</span>
                <span className="text-sm font-medium">
                  {formatCurrency(pricing.installFee)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Monthly Rate:</span>
                <span className="text-sm font-medium">
                  {formatCurrency(pricing.monthlyRate)}
                </span>
              </div>
              
              {pricing.surcharge > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Distance Surcharge:</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(pricing.surcharge)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="border-l pl-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">Upfront Total:</span>
                <span className="text-xl font-bold text-blue-600">
                  {formatCurrency(pricing.upfrontTotal)}
                </span>
              </div>
              
              {pricing.distance && (
                <p className="text-sm text-gray-500 mt-2">
                  Distance: {pricing.distance.toFixed(1)} miles
                </p>
              )}
              
              <p className="text-xs text-gray-500 mt-2">
                Monthly billing of {formatCurrency(pricing.monthlyRate)} will begin after installation
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}