import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Rental, Inquiry } from '@/lib/types';
import { Eye, Truck } from 'lucide-react';

interface RentalWithInquiry extends Rental {
  inquiry?: Inquiry;
}

interface RentalTableProps {
  rentals: RentalWithInquiry[];
}

export function RentalTable({ rentals }: RentalTableProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  const getStatusBadge = (rental: Rental) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    
    if (rental.endDate) {
      return `${baseClasses} bg-gray-100 text-gray-800`;
    }
    if (rental.startDate) {
      return `${baseClasses} bg-green-100 text-green-800`;
    }
    return `${baseClasses} bg-yellow-100 text-yellow-800`;
  };

  const getStatusText = (rental: Rental) => {
    if (rental.endDate) return 'Completed';
    if (rental.startDate) return 'Active';
    return 'Pending';
  };

  const calculateNextBilling = (startDate: Date | null) => {
    if (!startDate) return '-';
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + 1);
    return formatDate(date);
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Active Rentals
            </h3>
            <p className="mt-2 text-sm text-gray-700">
              Current and pending wheelchair ramp rentals
            </p>
          </div>
        </div>
        <div className="mt-8 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Configuration</TableHead>
                <TableHead>Next Bill</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rentals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No active rentals found
                  </TableCell>
                </TableRow>
              ) : (
                rentals.map((rental) => (
                  <TableRow key={rental.id}>
                    <TableCell className="font-medium">
                      {rental.inquiry?.name || 'Unknown Customer'}
                    </TableCell>
                    <TableCell>{formatDate(rental.startDate)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {typeof rental.rampConfig === 'object' && rental.rampConfig && (
                          <>
                            {(rental.rampConfig as any).platforms?.length || 0} platforms,{' '}
                            {(rental.rampConfig as any).ramps?.length || 0} ramps
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{calculateNextBilling(rental.startDate)}</TableCell>
                    <TableCell>
                      <span className={getStatusBadge(rental)}>
                        {getStatusText(rental)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/rentals/${rental.id}`}>
                            <Eye className="h-4 w-4" />
                            View
                          </Link>
                        </Button>
                        {!rental.endDate && (
                          <Button variant="outline" size="sm">
                            <Truck className="h-4 w-4" />
                            Remove
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}