# Development Patterns & Code Standards
## Wheelchair Ramp Rental Management App

### 1. Project Architecture

#### Directory Structure
```
app/
├── (auth)/login/page.tsx
├── inquiries/
│   ├── [id]/page.tsx
│   ├── new/page.tsx
│   └── page.tsx
├── pricing/page.tsx
├── rentals/
│   ├── [id]/page.tsx
│   └── page.tsx
├── inventory/page.tsx
├── payments/page.tsx
├── reports/page.tsx
├── settings/page.tsx
├── api/
│   ├── stripe-webhook/route.ts
│   └── esign-webhook/route.ts
├── layout.tsx
├── page.tsx
└── middleware.ts

components/
├── ui/                    # shadcn/ui primitives
├── forms/                 # Form components
├── tables/                # Table wrappers
└── shared/                # Shared components

lib/
├── db/
│   ├── schema.ts         # Drizzle schema
│   ├── client.ts         # DB connection
│   └── migrations/
├── actions/              # Server Actions
├── utils/
│   ├── pricing.ts
│   ├── email.ts
│   └── validation.ts
└── types/index.ts        # TypeScript definitions
```

### 2. Naming Conventions

#### Files & Directories
- **Pages**: `page.tsx`, `[id]/page.tsx`
- **Components**: `PascalCase` (e.g., `InquiryForm.tsx`)
- **Utilities**: `camelCase` (e.g., `calculateDeliveryFee.ts`)
- **Server Actions**: `camelCase` + `Action` suffix (e.g., `addInquiryAction.ts`)

#### Code Elements
- **Variables/Functions**: `camelCase`
- **Types/Interfaces**: `PascalCase` (no `I` prefix)
- **Constants**: `UPPER_SNAKE_CASE`
- **Database Fields**: `snake_case` (matches SQL conventions)

### 3. TypeScript Patterns

#### Type Definitions
```typescript
// lib/types/index.ts
export interface Inquiry {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  height?: number;
  mobilityAid?: MobilityAid;
  pictureBlobUrl?: string;
  status: InquiryStatus;
  notes?: string;
  createdAt: Date;
}

export type MobilityAid = 'wheelchair' | 'scooter' | 'walker' | 'none' | 'other';
export type InquiryStatus = 'new' | 'quoted' | 'approved' | 'rejected';
```

#### Component Props
```typescript
interface InquiryFormProps {
  inquiry?: Inquiry;
  onSubmit: (data: InquiryFormData) => Promise<void>;
  isLoading?: boolean;
}

const InquiryForm: React.FC<InquiryFormProps> = ({ 
  inquiry, 
  onSubmit, 
  isLoading = false 
}) => {
  // Component implementation
};
```

### 4. Server Components & Actions

#### Server Components (Default)
```typescript
// app/inquiries/page.tsx
import { db } from '@/lib/db/client';
import { inquiries } from '@/lib/db/schema';
import { InquiryTable } from '@/components/tables/InquiryTable';

export default async function InquiriesPage() {
  const data = await db.select().from(inquiries);
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Inquiries</h1>
      <InquiryTable data={data} />
    </div>
  );
}
```

#### Server Actions
```typescript
// lib/actions/addInquiryAction.ts
'use server';

import { z } from 'zod';
import { db } from '@/lib/db/client';
import { inquiries } from '@/lib/db/schema';
import { revalidatePath } from 'next/cache';

const inquirySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10),
  address: z.string().min(1),
  height: z.number().optional(),
  mobilityAid: z.enum(['wheelchair', 'scooter', 'walker', 'none', 'other']).optional(),
});

export async function addInquiryAction(formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData);
    const data = inquirySchema.parse(rawData);
    
    await db.insert(inquiries).values({
      ...data,
      status: 'new',
    });
    
    revalidatePath('/inquiries');
    return { success: true };
  } catch (error) {
    console.error('Error adding inquiry:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
```

### 5. Client Components

#### Form Handling
```typescript
// components/forms/InquiryForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  address: z.string().min(1, 'Address is required'),
});

type FormData = z.infer<typeof formSchema>;

interface InquiryFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  defaultValues?: Partial<FormData>;
}

export function InquiryForm({ onSubmit, defaultValues }: InquiryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Name
        </label>
        <Input
          id="name"
          {...register('name')}
          aria-invalid={errors.name ? 'true' : 'false'}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>
      
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </Button>
    </form>
  );
}
```

### 6. Database Patterns

#### Schema Definition (Drizzle)
```typescript
// lib/db/schema.ts
import { pgTable, serial, text, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const inquiries = pgTable('inquiries', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  address: text('address').notNull(),
  height: integer('height'),
  mobility_aid: text('mobility_aid'),
  picture_blob_url: text('picture_blob_url'),
  status: text('status').default('new'),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow(),
});

export const rentals = pgTable('rentals', {
  id: serial('id').primaryKey(),
  inquiry_id: integer('inquiry_id').references(() => inquiries.id).notNull(),
  start_date: timestamp('start_date'),
  end_date: timestamp('end_date'),
  ramp_config: jsonb('ramp_config').notNull(),
  inventory_items: jsonb('inventory_items').notNull(),
  billing_history: jsonb('billing_history').default([]),
  install_photos_blob_urls: text('install_photos_blob_urls').array(),
  esignature_id: text('esignature_id'),
  signature_status: text('signature_status').default('pending'),
  notes: text('notes'),
});
```

#### Query Patterns
```typescript
// In Server Actions or Components
import { db } from '@/lib/db/client';
import { inquiries, rentals } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

// Simple select
const allInquiries = await db.select().from(inquiries);

// With conditions
const pendingInquiries = await db
  .select()
  .from(inquiries)
  .where(eq(inquiries.status, 'new'))
  .orderBy(desc(inquiries.created_at));

// With joins
const inquiriesWithRentals = await db
  .select()
  .from(inquiries)
  .leftJoin(rentals, eq(inquiries.id, rentals.inquiry_id));

// Insert
await db.insert(inquiries).values({
  name: 'John Doe',
  email: 'john@example.com',
  // ...
});

// Update
await db
  .update(inquiries)
  .set({ status: 'quoted' })
  .where(eq(inquiries.id, inquiryId));
```

### 7. API Route Patterns

#### Webhook Handlers
```typescript
// app/api/stripe-webhook/route.ts
import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/db/client';
import { payments } from '@/lib/db/schema';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature')!;
    
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        await db.update(payments)
          .set({ status: 'completed' })
          .where(eq(payments.stripe_tx_id, paymentIntent.id));
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}
```

### 8. Styling Patterns

#### Tailwind CSS Guidelines
```typescript
// Consistent spacing and layout
const layoutClasses = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";
const cardClasses = "bg-white border border-gray-200 rounded-lg p-6";
const buttonPrimary = "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md";

// Form styling
const inputClasses = "block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500";
const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

// Table styling (no cards - use plain tables)
<table className="min-w-full divide-y divide-gray-200">
  <thead className="bg-gray-50">
    <tr>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Name
      </th>
    </tr>
  </thead>
  <tbody className="bg-white divide-y divide-gray-200">
    {/* rows */}
  </tbody>
</table>
```

### 9. Error Handling

#### Error Boundaries
```typescript
// components/shared/ErrorBoundary.tsx
'use client';

import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error }>;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  { hasError: boolean; error: Error | null }
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback || DefaultErrorFallback;
      return <Fallback error={this.state.error!} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error }: { error: Error }) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
      <h2 className="text-lg font-medium text-red-800">Something went wrong</h2>
      <p className="mt-1 text-sm text-red-600">{error.message}</p>
    </div>
  );
}
```

### 10. Testing Patterns

#### Unit Tests
```typescript
// tests/unit/pricing.test.ts
import { describe, it, expect } from '@jest/globals';
import { calculateDeliveryFee, calculateMonthlyRate } from '@/lib/utils/pricing';

describe('Pricing Calculations', () => {
  it('should calculate delivery fee correctly', () => {
    expect(calculateDeliveryFee(10)).toBe(50); // $0.50 per mile
    expect(calculateDeliveryFee(0)).toBe(25); // Minimum fee
  });

  it('should calculate monthly rate with surcharge', () => {
    const config = { platforms: [{ size: '5x5' }], ramps: [{ length: 6 }] };
    expect(calculateMonthlyRate(config, 10)).toBe(110); // Base + surcharge
  });
});
```

#### Integration Tests
```typescript
// tests/integration/inquiries.test.ts
import { describe, it, expect } from '@jest/globals';
import { addInquiryAction } from '@/lib/actions/addInquiryAction';

describe('Inquiry Actions', () => {
  it('should create inquiry with valid data', async () => {
    const formData = new FormData();
    formData.append('name', 'Test User');
    formData.append('email', 'test@example.com');
    formData.append('phone', '1234567890');
    formData.append('address', '123 Test St');

    const result = await addInquiryAction(formData);
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', async () => {
    const formData = new FormData();
    formData.append('email', 'invalid-email');

    const result = await addInquiryAction(formData);
    expect(result.success).toBe(false);
    expect(result.error).toContain('email');
  });
});
```

### 11. Configuration Files

#### ESLint Configuration
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'next/core-web-vitals',
    '@typescript-eslint/recommended',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    'prefer-const': 'error',
    'no-var': 'error',
  },
};
```

#### Prettier Configuration
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

### 12. Performance & Accessibility

#### Image Optimization
```typescript
import Image from 'next/image';

// Always use Next.js Image component
<Image
  src="/ramp-photo.jpg"
  alt="Installed wheelchair ramp"
  width={800}
  height={600}
  className="rounded-lg"
  priority={false} // Only true for above-the-fold images
/>
```

#### Accessibility Guidelines
```typescript
// Form accessibility
<label htmlFor="email" className="sr-only">Email address</label>
<input
  id="email"
  name="email"
  type="email"
  autoComplete="email"
  required
  aria-describedby="email-error"
/>
{error && (
  <p id="email-error" className="text-red-600" role="alert">
    {error}
  </p>
)}

// Table accessibility
<table role="table" aria-label="Customer inquiries">
  <caption className="sr-only">
    List of customer inquiries with status and actions
  </caption>
  {/* ... */}
</table>

// Button accessibility
<button
  type="button"
  aria-label="Delete inquiry"
  onClick={handleDelete}
  className="text-red-600 hover:text-red-800"
>
  <TrashIcon className="h-5 w-5" aria-hidden="true" />
</button>
```

### 13. Environment & Deployment

#### Environment Variables
```bash
# .env.local
DATABASE_URL=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
ESIGNATURES_API_KEY=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

#### Validation
```typescript
// lib/utils/env.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  RESEND_API_KEY: z.string().startsWith('re_'),
  ESIGNATURES_API_KEY: z.string(),
  NEXTAUTH_SECRET: z.string().min(32),
});

export const env = envSchema.parse(process.env);
```

This guide ensures consistent, maintainable code across the entire application. Follow these patterns strictly for optimal results.