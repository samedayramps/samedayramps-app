import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db/client';
import { inquiries } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { InquiryForm } from '@/components/forms/InquiryForm';
import { requireAuth } from '@/lib/auth';
import { ArrowLeft, Calculator } from 'lucide-react';

interface InquiryDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function InquiryDetailPage({ params }: InquiryDetailPageProps) {
  await requireAuth();

  const { id } = await params;
  const inquiryId = parseInt(id);
  if (isNaN(inquiryId)) {
    notFound();
  }

  const [inquiry] = await db
    .select()
    .from(inquiries)
    .where(eq(inquiries.id, inquiryId));

  if (!inquiry) {
    notFound();
  }

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    
    switch (status) {
      case 'new':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'quoted':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/inquiries">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Inquiries
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Inquiry #{inquiry.id}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Created {formatDate(inquiry.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className={getStatusBadge(inquiry.status || 'new')}>
            {inquiry.status || 'new'}
          </span>
          {inquiry.status === 'new' && (
            <Button asChild>
              <Link href={`/pricing?inquiry=${inquiry.id}`}>
                <Calculator className="h-4 w-4 mr-2" />
                Create Quote
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                Inquiry Details
              </h3>
              <InquiryForm inquiry={inquiry} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                Customer Information
              </h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{inquiry.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <a href={`mailto:${inquiry.email}`} className="text-blue-600 hover:text-blue-500">
                      {inquiry.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <a href={`tel:${inquiry.phone}`} className="text-blue-600 hover:text-blue-500">
                      {inquiry.phone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="mt-1 text-sm text-gray-900">{inquiry.address}</dd>
                </div>
                {inquiry.height && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Height</dt>
                    <dd className="mt-1 text-sm text-gray-900">{inquiry.height} inches</dd>
                  </div>
                )}
                {inquiry.mobilityAid && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Mobility Aid</dt>
                    <dd className="mt-1 text-sm text-gray-900 capitalize">{inquiry.mobilityAid}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {inquiry.notes && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  Notes
                </h3>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {inquiry.notes}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}