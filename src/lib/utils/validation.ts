import { z } from 'zod';

export const inquirySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  address: z.string().min(1, 'Address is required'),
  height: z.number().positive().optional(),
  mobilityAid: z.enum(['wheelchair', 'scooter', 'walker', 'none', 'other']).optional(),
  notes: z.string().optional(),
});

export const quoteSchema = z.object({
  inquiryId: z.number().positive(),
  deliveryFee: z.number().min(0),
  installFee: z.number().min(0),
  monthlyRate: z.number().min(0),
  upfrontTotal: z.number().min(0),
  surcharge: z.number().min(0).default(0),
  rampConfig: z.object({
    platforms: z.array(z.object({
      size: z.string(),
      quantity: z.number().positive(),
    })),
    ramps: z.array(z.object({
      length: z.number().positive(),
      quantity: z.number().positive(),
    })),
  }),
});

export const rentalSchema = z.object({
  inquiryId: z.number().positive(),
  quoteId: z.number().positive(),
  startDate: z.date(),
  rampConfig: z.object({
    platforms: z.array(z.object({
      size: z.string(),
      quantity: z.number().positive(),
    })),
    ramps: z.array(z.object({
      length: z.number().positive(),
      quantity: z.number().positive(),
    })),
  }),
  inventoryItems: z.array(z.number().positive()),
  notes: z.string().optional(),
});

export const paymentSchema = z.object({
  rentalId: z.number().positive(),
  amount: z.number().positive(),
  method: z.enum(['card', 'cash', 'venmo', 'zelle']),
  notes: z.string().optional(),
});

export const inventorySchema = z.object({
  type: z.string().min(1),
  size: z.string().min(1),
  quantityTotal: z.number().positive(),
  quantityAvailable: z.number().min(0),
});

export const pricingCalculatorSchema = z.object({
  platforms: z.array(z.object({
    size: z.string(),
    quantity: z.number().positive(),
  })),
  ramps: z.array(z.object({
    length: z.number().positive(),
    quantity: z.number().positive(),
  })),
  address: z.string().min(1, 'Address is required for distance calculation'),
});