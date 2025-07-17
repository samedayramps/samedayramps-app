import { pgTable, serial, text, integer, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';

export const mobilityAidEnum = pgEnum('mobility_aid', ['wheelchair', 'scooter', 'walker', 'none', 'other']);
export const inquiryStatusEnum = pgEnum('inquiry_status', ['new', 'quoted', 'approved', 'rejected']);
export const signatureStatusEnum = pgEnum('signature_status', ['pending', 'signed', 'expired']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'completed', 'failed', 'refunded']);
export const paymentMethodEnum = pgEnum('payment_method', ['card', 'cash', 'venmo', 'zelle']);

export const inquiries = pgTable('inquiries', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  address: text('address').notNull(),
  height: integer('height'),
  mobilityAid: mobilityAidEnum('mobility_aid'),
  pictureBlobUrl: text('picture_blob_url'),
  status: inquiryStatusEnum('status').default('new'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const quotes = pgTable('quotes', {
  id: serial('id').primaryKey(),
  inquiryId: integer('inquiry_id').references(() => inquiries.id).notNull(),
  deliveryFee: integer('delivery_fee').notNull(),
  installFee: integer('install_fee').notNull(),
  monthlyRate: integer('monthly_rate').notNull(),
  upfrontTotal: integer('upfront_total').notNull(),
  surcharge: integer('surcharge').default(0),
  rampConfig: jsonb('ramp_config').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const rentals = pgTable('rentals', {
  id: serial('id').primaryKey(),
  inquiryId: integer('inquiry_id').references(() => inquiries.id).notNull(),
  quoteId: integer('quote_id').references(() => quotes.id).notNull(),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  rampConfig: jsonb('ramp_config').notNull(),
  inventoryItems: jsonb('inventory_items').notNull(),
  billingHistory: jsonb('billing_history').default([]),
  installPhotosBlobUrls: text('install_photos_blob_urls').array(),
  esignatureId: text('esignature_id'),
  signatureStatus: signatureStatusEnum('signature_status').default('pending'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const inventory = pgTable('inventory', {
  id: serial('id').primaryKey(),
  type: text('type').notNull(),
  size: text('size').notNull(),
  quantityTotal: integer('quantity_total').notNull(),
  quantityAvailable: integer('quantity_available').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  rentalId: integer('rental_id').references(() => rentals.id).notNull(),
  amount: integer('amount').notNull(),
  method: paymentMethodEnum('method').notNull(),
  stripeTxId: text('stripe_tx_id'),
  date: timestamp('date').defaultNow(),
  status: paymentStatusEnum('status').default('pending'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});