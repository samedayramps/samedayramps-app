'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db/client';
import { inquiries } from '@/lib/db/schema';
import { inquirySchema } from '@/lib/utils/validation';
import { eq } from 'drizzle-orm';
import { ActionResult } from '@/lib/types';

export async function addInquiryAction(formData: FormData): Promise<ActionResult> {
  try {
    const rawData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      height: formData.get('height') ? Number(formData.get('height')) : undefined,
      mobilityAid: formData.get('mobilityAid') as string || undefined,
      notes: formData.get('notes') as string || undefined,
    };

    const validatedData = inquirySchema.parse(rawData);

    const [newInquiry] = await db
      .insert(inquiries)
      .values({
        ...validatedData,
        status: 'new',
      })
      .returning();

    revalidatePath('/inquiries');
    revalidatePath('/');
    
    return { 
      success: true, 
      data: newInquiry 
    };
  } catch (error) {
    console.error('Error adding inquiry:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add inquiry',
    };
  }
}

export async function updateInquiryAction(
  inquiryId: number,
  formData: FormData
): Promise<ActionResult> {
  try {
    const rawData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      height: formData.get('height') ? Number(formData.get('height')) : undefined,
      mobilityAid: formData.get('mobilityAid') as string || undefined,
      notes: formData.get('notes') as string || undefined,
    };

    const validatedData = inquirySchema.parse(rawData);

    const [updatedInquiry] = await db
      .update(inquiries)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(inquiries.id, inquiryId))
      .returning();

    if (!updatedInquiry) {
      return {
        success: false,
        error: 'Inquiry not found',
      };
    }

    revalidatePath('/inquiries');
    revalidatePath(`/inquiries/${inquiryId}`);
    revalidatePath('/');

    return {
      success: true,
      data: updatedInquiry,
    };
  } catch (error) {
    console.error('Error updating inquiry:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update inquiry',
    };
  }
}

export async function updateInquiryStatusAction(
  inquiryId: number,
  status: 'new' | 'quoted' | 'approved' | 'rejected'
): Promise<ActionResult> {
  try {
    const [updatedInquiry] = await db
      .update(inquiries)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(inquiries.id, inquiryId))
      .returning();

    if (!updatedInquiry) {
      return {
        success: false,
        error: 'Inquiry not found',
      };
    }

    revalidatePath('/inquiries');
    revalidatePath(`/inquiries/${inquiryId}`);
    revalidatePath('/');

    return {
      success: true,
      data: updatedInquiry,
    };
  } catch (error) {
    console.error('Error updating inquiry status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update inquiry status',
    };
  }
}

export async function deleteInquiryAction(inquiryId: number): Promise<ActionResult> {
  try {
    const [deletedInquiry] = await db
      .delete(inquiries)
      .where(eq(inquiries.id, inquiryId))
      .returning();

    if (!deletedInquiry) {
      return {
        success: false,
        error: 'Inquiry not found',
      };
    }

    revalidatePath('/inquiries');
    revalidatePath('/');

    return {
      success: true,
      data: deletedInquiry,
    };
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete inquiry',
    };
  }
}