import { Suspense } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db/client';
import { inquiries } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { InquiryTable } from '@/components/tables/InquiryTable';
import { requireAuth } from '@/lib/auth';
import { Plus } from 'lucide-react';

async function InquiriesContent() {
  const allInquiries = await db
    .select()
    .from(inquiries)
    .orderBy(desc(inquiries.createdAt));

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inquiries</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage customer inquiries for wheelchair ramp rentals
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button asChild>
            <Link href="/inquiries/new">
              <Plus className="h-4 w-4 mr-2" />
              New Inquiry
            </Link>
          </Button>
        </div>
      </div>

      <InquiryTable inquiries={allInquiries} />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inquiries</h1>
        <p className="mt-2 text-sm text-gray-700">Loading...</p>
      </div>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function InquiriesPage() {
  await requireAuth();

  return (
    <Suspense fallback={<LoadingState />}>
      <InquiriesContent />
    </Suspense>
  );
}