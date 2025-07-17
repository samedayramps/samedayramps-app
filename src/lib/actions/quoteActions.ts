'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db/client';
import { quotes, inquiries } from '@/lib/db/schema';
import { quoteSchema } from '@/lib/utils/validation';
import { calculateDistance, calculateFullPricing } from '@/lib/utils/pricing';
import { eq } from 'drizzle-orm';
import { ActionResult, RampConfiguration } from '@/lib/types';
import { updateInquiryStatusAction } from './inquiryActions';

export async function calculateQuoteAction(
  inquiryId: number,
  rampConfig: RampConfiguration
): Promise<ActionResult> {
  try {
    // Get inquiry details for address
    const [inquiry] = await db
      .select()
      .from(inquiries)
      .where(eq(inquiries.id, inquiryId));

    if (!inquiry) {
      return {
        success: false,
        error: 'Inquiry not found',
      };
    }

    // Calculate distance using Google Maps API
    const distance = await calculateDistance(inquiry.address);

    // Calculate pricing
    const pricing = calculateFullPricing(rampConfig, distance);

    return {
      success: true,
      data: {
        ...pricing,
        rampConfig,
        inquiryId,
      },
    };
  } catch (error) {
    console.error('Error calculating quote:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to calculate quote',
    };
  }
}

export async function saveQuoteAction(
  inquiryId: number,
  quoteData: {
    deliveryFee: number;
    installFee: number;
    monthlyRate: number;
    upfrontTotal: number;
    surcharge: number;
    rampConfig: RampConfiguration;
  }
): Promise<ActionResult> {
  try {
    const validatedData = quoteSchema.parse({
      inquiryId,
      ...quoteData,
    });

    const [newQuote] = await db
      .insert(quotes)
      .values(validatedData)
      .returning();

    // Update inquiry status to quoted
    await updateInquiryStatusAction(inquiryId, 'quoted');

    revalidatePath('/inquiries');
    revalidatePath(`/inquiries/${inquiryId}`);
    revalidatePath('/');

    return {
      success: true,
      data: newQuote,
    };
  } catch (error) {
    console.error('Error saving quote:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save quote',
    };
  }
}