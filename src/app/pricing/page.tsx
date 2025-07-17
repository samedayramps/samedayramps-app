import { Suspense } from 'react';
// import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db/client';
import { inquiries } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { PricingCalculator } from '@/components/forms/PricingCalculator';
import { requireAuth } from '@/lib/auth';
import { ArrowLeft } from 'lucide-react';

interface PricingPageProps {
  searchParams: Promise<{
    inquiry?: string;
  }>;
}

async function PricingContent({ searchParams }: PricingPageProps) {
  let inquiry = null;
  
  const { inquiry: inquiryId } = await searchParams;

  if (inquiryId) {
    if (!isNaN(parseInt(inquiryId))) {
      [inquiry] = await db
        .select()
        .from(inquiries)
        .where(eq(inquiries.id, parseInt(inquiryId)));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={inquiry ? `/inquiries/${inquiry.id}` : '/inquiries'}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {inquiry ? 'Back to Inquiry' : 'Back to Inquiries'}
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pricing Calculator</h1>
        <p className="mt-2 text-sm text-gray-700">
          {inquiry 
            ? `Calculate pricing for ${inquiry.name}'s inquiry`
            : 'Calculate pricing for wheelchair ramp rental'
          }
        </p>
      </div>

      {inquiry && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-900">
                Customer Information
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p><strong>Name:</strong> {inquiry.name}</p>
                <p><strong>Address:</strong> {inquiry.address}</p>
                <p><strong>Email:</strong> {inquiry.email}</p>
                <p><strong>Phone:</strong> {inquiry.phone}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <PricingCalculator 
            inquiryId={inquiry?.id}
            defaultAddress={inquiry?.address}
            onQuoteSaved={() => {
              // Redirect to inquiry detail page after saving quote
              if (inquiry) {
                window.location.href = `/inquiries/${inquiry.id}`;
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pricing Calculator</h1>
        <p className="mt-2 text-sm text-gray-700">Loading...</p>
      </div>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function PricingPage({ searchParams }: PricingPageProps) {
  await requireAuth();

  return (
    <Suspense fallback={<LoadingState />}>
      <PricingContent searchParams={searchParams} />
    </Suspense>
  );
}