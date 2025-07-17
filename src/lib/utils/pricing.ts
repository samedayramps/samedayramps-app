import { RampConfiguration } from '@/lib/types';

// Pricing constants
const PRICING_CONFIG = {
  DELIVERY_PER_MILE: 0.50, // $0.50 per mile
  DELIVERY_MINIMUM: 25, // $25 minimum delivery fee
  INSTALL_BASE: 75, // $75 base installation fee
  INSTALL_PER_PLATFORM: 25, // $25 per platform
  INSTALL_PER_RAMP_SECTION: 15, // $15 per ramp section
  MONTHLY_RATE_BASE: 100, // $100 base monthly rate
  MONTHLY_RATE_PER_PLATFORM: 20, // $20 per platform per month
  MONTHLY_RATE_PER_RAMP_FOOT: 5, // $5 per foot of ramp per month
  SURCHARGE_THRESHOLD: 15, // Surcharge if distance > 15 miles
  SURCHARGE_AMOUNT: 25, // $25 surcharge
};

export function calculateDeliveryFee(distanceInMiles: number): number {
  const fee = Math.max(
    distanceInMiles * PRICING_CONFIG.DELIVERY_PER_MILE,
    PRICING_CONFIG.DELIVERY_MINIMUM
  );
  return Math.round(fee * 100); // Return in cents
}

export function calculateInstallFee(rampConfig: RampConfiguration): number {
  const platformCount = rampConfig.platforms.reduce((sum, p) => sum + p.quantity, 0);
  const rampSections = rampConfig.ramps.reduce((sum, r) => sum + r.quantity, 0);

  const fee = 
    PRICING_CONFIG.INSTALL_BASE +
    (platformCount * PRICING_CONFIG.INSTALL_PER_PLATFORM) +
    (rampSections * PRICING_CONFIG.INSTALL_PER_RAMP_SECTION);

  return Math.round(fee * 100); // Return in cents
}

export function calculateMonthlyRate(rampConfig: RampConfiguration): number {
  const platformCount = rampConfig.platforms.reduce((sum, p) => sum + p.quantity, 0);
  const totalRampFeet = rampConfig.ramps.reduce((sum, r) => sum + (r.length * r.quantity), 0);

  const rate = 
    PRICING_CONFIG.MONTHLY_RATE_BASE +
    (platformCount * PRICING_CONFIG.MONTHLY_RATE_PER_PLATFORM) +
    (totalRampFeet * PRICING_CONFIG.MONTHLY_RATE_PER_RAMP_FOOT);

  return Math.round(rate * 100); // Return in cents
}

export function calculateSurcharge(distanceInMiles: number): number {
  if (distanceInMiles > PRICING_CONFIG.SURCHARGE_THRESHOLD) {
    return PRICING_CONFIG.SURCHARGE_AMOUNT * 100; // Return in cents
  }
  return 0;
}

export function calculateUpfrontTotal(
  deliveryFee: number,
  installFee: number,
  monthlyRate: number,
  surcharge: number
): number {
  return deliveryFee + installFee + monthlyRate + surcharge;
}

export interface PricingResult {
  deliveryFee: number;
  installFee: number;
  monthlyRate: number;
  upfrontTotal: number;
  surcharge: number;
  distance?: number;
}

export function calculateFullPricing(
  rampConfig: RampConfiguration,
  distanceInMiles: number
): PricingResult {
  const deliveryFee = calculateDeliveryFee(distanceInMiles);
  const installFee = calculateInstallFee(rampConfig);
  const monthlyRate = calculateMonthlyRate(rampConfig);
  const surcharge = calculateSurcharge(distanceInMiles);
  const upfrontTotal = calculateUpfrontTotal(deliveryFee, installFee, monthlyRate, surcharge);

  return {
    deliveryFee,
    installFee,
    monthlyRate,
    upfrontTotal,
    surcharge,
    distance: distanceInMiles,
  };
}

export function formatCurrency(amountInCents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amountInCents / 100);
}

// Google Maps integration utility
export async function calculateDistance(
  customerAddress: string,
  businessAddress: string = '123 Business St, Your City, ST 12345' // Replace with actual business address
): Promise<number> {
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    console.warn('Google Maps API key not configured, using default distance');
    return 10; // Default to 10 miles if no API key
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?` +
      `origins=${encodeURIComponent(businessAddress)}&` +
      `destinations=${encodeURIComponent(customerAddress)}&` +
      `units=imperial&` +
      `key=${process.env.GOOGLE_MAPS_API_KEY}`
    );

    const data = await response.json();

    if (data.status === 'OK' && data.rows[0]?.elements[0]?.status === 'OK') {
      const distanceText = data.rows[0].elements[0].distance.text;
      const distanceValue = parseFloat(distanceText.replace(/[^\d.]/g, ''));
      return distanceValue;
    } else {
      console.error('Google Maps API error:', data);
      return 10; // Default fallback
    }
  } catch (error) {
    console.error('Error calculating distance:', error);
    return 10; // Default fallback
  }
}