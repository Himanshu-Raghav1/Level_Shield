import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname;
  
  // Skip static assets, Next.js internals, and API routes to avoid infinite fetch loops
  const isApi = url.startsWith('/api/');
  const isNext = url.startsWith('/_next/');
  const isStatic = url.includes('.') || url.startsWith('/favicon.ico');
  
  if (!isApi && !isNext && !isStatic) {
    const logUrl = new URL('/api/events/page-view', req.url);
    
    // Extract headers
    const headersObj: Record<string, string> = {};
    req.headers.forEach((v, k) => {
      headersObj[k] = v;
    });

    try {
      // Synchronously verify page requests via edge log fetch to enforce active blocking
      const logRes = await fetch(logUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-shield-edge-log': 'true',
        },
        body: JSON.stringify({
          path: url,
          method: req.method,
          headers: headersObj,
          ip: req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || '127.0.0.1',
        }),
      });

      if (!logRes.ok) {
        if (logRes.status === 403) {
          // Hard block redirect
          return NextResponse.redirect(new URL('/blocked', req.url));
        } else if (logRes.status === 429) {
          // Redirect to PoW challenge
          return NextResponse.redirect(new URL('/challenge/pow', req.url));
        } else if (logRes.status === 302 || logRes.status === 307) {
          // Redirect suspicious scrapers to the honey maze route
          const location = logRes.headers.get('location');
          if (location) {
            return NextResponse.redirect(new URL(location, req.url));
          }
        }
      }
    } catch (e) {
      // Non-blocking fallback to ensure site stays up if logging server has hiccups
      console.error('Edge middleware verification error:', e);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
