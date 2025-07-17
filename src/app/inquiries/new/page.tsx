'use client';

import { useRouter } from 'next/navigation';
import { InquiryForm } from '@/components/forms/InquiryForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewInquiryPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/inquiries');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/inquiries">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inquiries
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Inquiry</h1>
        <p className="mt-2 text-sm text-gray-700">
          Create a new customer inquiry for wheelchair ramp rental
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <InquiryForm onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
}