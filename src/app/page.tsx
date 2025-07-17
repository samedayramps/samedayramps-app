import { Suspense } from 'react';
import { db } from '@/lib/db/client';
import { inquiries, rentals } from '@/lib/db/schema';
import { eq, desc, isNull } from 'drizzle-orm';
import { InquiryTable } from '@/components/tables/InquiryTable';
import { RentalTable } from '@/components/tables/RentalTable';
import { requireAuth } from '@/lib/auth';

async function DashboardContent() {
  // Fetch recent inquiries (last 10)
  const recentInquiries = await db
    .select()
    .from(inquiries)
    .orderBy(desc(inquiries.createdAt))
    .limit(10);

  // Fetch active rentals (no end date)
  const activeRentals = await db
    .select({
      id: rentals.id,
      inquiryId: rentals.inquiryId,
      quoteId: rentals.quoteId,
      startDate: rentals.startDate,
      endDate: rentals.endDate,
      rampConfig: rentals.rampConfig,
      inventoryItems: rentals.inventoryItems,
      billingHistory: rentals.billingHistory,
      installPhotosBlobUrls: rentals.installPhotosBlobUrls,
      esignatureId: rentals.esignatureId,
      signatureStatus: rentals.signatureStatus,
      stripeSubscriptionId: rentals.stripeSubscriptionId,
      notes: rentals.notes,
      createdAt: rentals.createdAt,
      updatedAt: rentals.updatedAt,
      customerName: inquiries.name,
      customerEmail: inquiries.email,
    })
    .from(rentals)
    .leftJoin(inquiries, eq(rentals.inquiryId, inquiries.id))
    .where(isNull(rentals.endDate))
    .orderBy(desc(rentals.createdAt));

  // Transform the data to match expected types
  const transformedRentals = activeRentals.map((rental) => ({
    ...rental,
    inquiry: {
      id: rental.inquiryId,
      name: rental.customerName || 'Unknown',
      email: rental.customerEmail || '',
      phone: '',
      address: '',
      height: null,
      mobilityAid: null,
      pictureBlobUrl: null,
      status: 'approved' as const,
      notes: null,
      createdAt: rental.createdAt,
    },
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-700">
          Overview of your wheelchair ramp rental business
        </p>
      </div>

      <div className="grid gap-8">
        <InquiryTable inquiries={recentInquiries} />
        <RentalTable rentals={transformedRentals} />
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-700">Loading...</p>
      </div>
      <div className="grid gap-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
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
    </div>
  );
}

export default async function Dashboard() {
  await requireAuth();

  return (
    <Suspense fallback={<LoadingState />}>
      <DashboardContent />
    </Suspense>
  );
}