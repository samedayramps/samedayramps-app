import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(_req) {
    // Additional middleware logic if needed
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
);

export const config = {
  matcher: ['/((?!api/auth|auth/signin|_next/static|_next/image|favicon.ico).*)']
};