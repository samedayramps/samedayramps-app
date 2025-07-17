import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { inquiries, quotes, rentals, inventory, payments } from '@/lib/db/schema';

export type Inquiry = InferSelectModel<typeof inquiries>;
export type NewInquiry = InferInsertModel<typeof inquiries>;

export type Quote = InferSelectModel<typeof quotes>;
export type NewQuote = InferInsertModel<typeof quotes>;

export type Rental = InferSelectModel<typeof rentals>;
export type NewRental = InferInsertModel<typeof rentals>;

export type InventoryItem = InferSelectModel<typeof inventory>;
export type NewInventoryItem = InferInsertModel<typeof inventory>;

export type Payment = InferSelectModel<typeof payments>;
export type NewPayment = InferInsertModel<typeof payments>;

export type MobilityAid = 'wheelchair' | 'scooter' | 'walker' | 'none' | 'other';
export type InquiryStatus = 'new' | 'quoted' | 'approved' | 'rejected';
export type SignatureStatus = 'pending' | 'signed' | 'expired';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'card' | 'cash' | 'venmo' | 'zelle';

export interface RampConfiguration {
  platforms: Array<{
    size: string;
    quantity: number;
  }>;
  ramps: Array<{
    length: number;
    quantity: number;
  }>;
}

export interface PricingCalculation {
  deliveryFee: number;
  installFee: number;
  monthlyRate: number;
  upfrontTotal: number;
  surcharge: number;
  rampConfig: RampConfiguration;
  distance?: number;
}

export interface InquiryFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  height?: number;
  mobilityAid?: MobilityAid;
  notes?: string;
}

export interface QuoteFormData {
  inquiryId: number;
  deliveryFee: number;
  installFee: number;
  monthlyRate: number;
  upfrontTotal: number;
  surcharge: number;
  rampConfig: RampConfiguration;
}

export interface RentalFormData {
  inquiryId: number;
  quoteId: number;
  startDate: Date;
  rampConfig: RampConfiguration;
  inventoryItems: number[];
  notes?: string;
}

export interface PaymentFormData {
  rentalId: number;
  amount: number;
  method: PaymentMethod;
  notes?: string;
}

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  onRowClick?: (row: T) => void;
  loading?: boolean;
}