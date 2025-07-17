# SameDayRamps - Wheelchair Ramp Rental Management App

A comprehensive web application for managing wheelchair ramp rental operations, built with Next.js 14, TypeScript, and modern web technologies.

## Features

- **Dashboard**: Overview of inquiries and active rentals
- **Inquiry Management**: Create, edit, and track customer inquiries
- **Pricing Calculator**: Calculate quotes with Google Maps distance integration
- **Rental Management**: Track active rentals and equipment
- **Payment Processing**: Stripe integration for secure payments
- **Digital Contracts**: eSignatures.com integration for rental agreements
- **Inventory Tracking**: Manage platform and ramp inventory
- **Email Notifications**: Automated emails via Resend
- **Reports & Analytics**: Business insights and reporting

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: Vercel Postgres with Drizzle ORM
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **Email**: Resend
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Radix UI primitives

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Vercel account (for database and deployment)
- Stripe account
- Resend account
- Google Maps API key
- eSignatures.com account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in `.env.local`:
   ```env
   # Database
   DATABASE_URL=your_vercel_postgres_url

   # Stripe
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_WEBHOOK_SECRET=your_webhook_secret

   # Email
   RESEND_API_KEY=your_resend_api_key

   # eSignatures
   ESIGNATURES_API_KEY=your_esignatures_api_key

   # Auth
   NEXTAUTH_SECRET=your_secret_key
   NEXTAUTH_URL=http://localhost:3000
   ADMIN_EMAIL=admin@samedayramps.com
   ADMIN_PASSWORD=admin123

   # Google Maps
   GOOGLE_MAPS_API_KEY=your_google_maps_key
   ```

4. Set up the database:
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Default Login

- Email: `admin@samedayramps.com`
- Password: `admin123`

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── inquiries/         # Inquiry management
│   ├── pricing/           # Pricing calculator
│   ├── rentals/           # Rental management
│   ├── inventory/         # Inventory management
│   ├── payments/          # Payment tracking
│   ├── reports/           # Reports and analytics
│   └── settings/          # App settings
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── forms/            # Form components
│   ├── tables/           # Table components
│   └── shared/           # Shared components
├── lib/                  # Utilities and configuration
│   ├── db/              # Database schema and client
│   ├── actions/         # Server Actions
│   ├── utils/           # Utility functions
│   └── types/           # TypeScript types
```

## Development Guidelines

Follow the patterns outlined in `DEVELOPMENT_PATTERNS.md` for:
- Code organization and naming conventions
- Component structure and patterns
- Server Actions and data fetching
- Error handling and validation
- TypeScript usage
- Styling with Tailwind CSS

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check
- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Drizzle Studio

## Deployment

This app is designed to be deployed on Vercel:

1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

## Key Features Implemented

### ✅ Completed
- Project setup with Next.js 14 and TypeScript
- Authentication system with NextAuth.js
- Database schema with Drizzle ORM
- Root layout with sidebar navigation
- Dashboard with inquiries and rentals tables
- Complete inquiry management (CRUD operations)
- Pricing calculator with Google Maps integration

### 🚧 In Progress
- Rental management system
- Stripe payment integration
- eSignatures.com integration
- Inventory management
- Payment tracking
- Reports and analytics
- Email notifications
- Error handling
- Testing and deployment

## Business Logic

### Pricing Structure
- **Delivery**: $0.50/mile (minimum $25)
- **Installation**: $75 base + $25/platform + $15/ramp section
- **Monthly Rate**: $100 base + $20/platform + $5/foot of ramp
- **Surcharge**: $25 if distance > 15 miles

### Workflow
1. Customer submits inquiry
2. Generate quote using pricing calculator
3. Customer approves and signs digital contract
4. Process payment (upfront total)
5. Schedule installation
6. Begin monthly billing cycle
7. Handle removal when rental ends

## Support

For questions or issues, please refer to the development patterns document or create an issue in the repository.

## License

Private - All rights reserved