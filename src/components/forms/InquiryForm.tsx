'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { addInquiryAction, updateInquiryAction } from '@/lib/actions/inquiryActions';
import { Inquiry } from '@/lib/types';

interface InquiryFormProps {
  inquiry?: Inquiry;
  onSuccess?: (inquiry: Inquiry) => void;
}

export function InquiryForm({ inquiry, onSuccess }: InquiryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = inquiry
        ? await updateInquiryAction(inquiry.id, formData)
        : await addInquiryAction(formData);

      if (result.success) {
        onSuccess?.(result.data as Inquiry);
      } else {
        setError(result.error || 'An error occurred');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={inquiry?.name}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={inquiry?.email}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            required
            defaultValue={inquiry?.phone}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="height">Height (inches)</Label>
          <Input
            id="height"
            name="height"
            type="number"
            min="0"
            max="120"
            defaultValue={inquiry?.height || ''}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address">Address *</Label>
        <Input
          id="address"
          name="address"
          type="text"
          required
          defaultValue={inquiry?.address}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="mobilityAid">Mobility Aid</Label>
        <Select
          id="mobilityAid"
          name="mobilityAid"
          defaultValue={inquiry?.mobilityAid || ''}
          className="mt-1"
        >
          <option value="">Select mobility aid</option>
          <option value="wheelchair">Wheelchair</option>
          <option value="scooter">Scooter</option>
          <option value="walker">Walker</option>
          <option value="none">None</option>
          <option value="other">Other</option>
        </Select>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={inquiry?.notes || ''}
          className="mt-1"
          placeholder="Additional information about the inquiry..."
        />
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting
            ? 'Saving...'
            : inquiry
            ? 'Update Inquiry'
            : 'Create Inquiry'}
        </Button>
      </div>
    </form>
  );
}