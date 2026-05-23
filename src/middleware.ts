import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const INTENT_COOKIE = 'ls_human_intent';
const GOOD_BOT_SECRET = process.env.GOOD_BOT_SECRET || 'hackathon-secret-key-12345';
const GOOD_BOT_TIMESTAMP_WINDOW_MS = 5 * 60 * 1000;
const APPROVED_GOOD_BOTS = new Set(['levels-demo-crawler', 'googlebot-verified']);

const AI_BOT_PATTERNS = [
  /gptbot/i,
  /chatgpt-user/i,
  /oai-searchbot/i,
  /claudebot/i,
  /claude-web/i,
  /anthropic/i,
  /perplexitybot/i,
  /google-extended/i,
  /applebot-extended/i,
  /bytespider/i,
  /cohere-ai/i,
  /ccbot/i,
];

const SCRAPER_PATTERNS = [
  /\bcurl\//i,
  /\bwget\//i,
  /python-requests/i,
  /scrapy/i,
  /\bhttpx\b/i,
  /\baiohttp\b/i,
  /\baxios\b/i,
  /node-fetch/i,
  /undici/i,
  /go-http-client/i,
  /java\//i,
  /okhttp/i,
  /headlesschrome/i,
  /playwright/i,
  /puppeteer/i,
  /selenium/i,
];

const SENSITIVE_PAGE_PREFIXES = [
  '/',
  '/compensation',
  '/company',
  '/compare',
  '/community',
  '/shield',
];

const SENSITIVE_API_PREFIXES = [
  '/api/compensation',
  '/api/companies',
  '/api/events',
  '/api/metrics',
  '/api/sessions',
  '/api/simulate',
];

const PUBLIC_PREFIXES = [
  '/blocked',
  '/challenge',
  '/maze',
  '/api/challenge',
  '/api/good-bot',
  '/api/agent-proof',
];

function isStaticOrNext(pathname: string) {
  return (
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    /\.[a-z0-9]{2,8}$/i.test(pathname)
  );
}

function startsWithAny(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isSensitivePage(pathname: string) {
  return SENSITIVE_PAGE_PREFIXES.some((prefix) => {
    if (prefix === '/') return pathname === '/';
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  });
}

function isSensitiveApi(pathname: string) {
  return startsWithAny(pathname, SENSITIVE_API_PREFIXES);
}

function isPublicShieldRoute(pathname: string) {
  return startsWithAny(pathname, PUBLIC_PREFIXES);
}

function classifyRequest(req: NextRequest) {
  const userAgent = req.headers.get('user-agent') || '';
  const accept = req.headers.get('accept') || '';
  const acceptLanguage = req.headers.get('accept-language') || '';
  const secFetchDest = req.headers.get('sec-fetch-dest') || '';
  const secFetchMode = req.headers.get('sec-fetch-mode') || '';
  const secChUa = req.headers.get('sec-ch-ua') || '';

  const matchedAi = AI_BOT_PATTERNS.find((pattern) => pattern.test(userAgent));
  if (matchedAi) {
    return { allowed: false, reason: 'ai_crawler_user_agent' };
  }

  const matchedScraper = SCRAPER_PATTERNS.find((pattern) => pattern.test(userAgent));
  if (matchedScraper) {
    return { allowed: false, reason: 'automation_library_user_agent' };
  }

  const claimsBrowser = /mozilla|chrome|safari|firefox|edg/i.test(userAgent);
  const hasBrowserFetchMetadata = Boolean(secFetchDest || secFetchMode || secChUa);
  const acceptsHtml = accept.includes('text/html');
  const hasIntent = req.cookies.get(INTENT_COOKIE)?.value === '1';

  if (claimsBrowser && acceptsHtml && !hasIntent && (!acceptLanguage || !hasBrowserFetchMetadata)) {
    return { allowed: false, reason: 'browser_impersonation_missing_fetch_metadata' };
  }

  if (!claimsBrowser && !hasIntent) {
    return { allowed: false, reason: 'non_browser_client' };
  }

  return { allowed: true, reason: 'browser_like_client' };
}

function addSecurityHeaders(res: NextResponse, sensitive: boolean) {
  res.headers.set('X-Robots-Tag', 'noai, noimageai, noarchive, nosnippet');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'no-referrer');
  res.headers.set('Permissions-Policy', 'interest-cohort=(), browsing-topics=()');
  if (sensitive) {
    res.headers.set('Cache-Control', 'no-store, max-age=0');
  }
  return res;
}

function blockedApi(reason: string) {
  return addSecurityHeaders(
    NextResponse.json(
      {
        error: 'Level Shield blocked automated scraping before data release.',
        reason,
      },
      { status: 403 }
    ),
    true
  );
}

function blockedPage(req: NextRequest, reason: string) {
  const blockedUrl = new URL('/blocked', req.url);
  blockedUrl.searchParams.set('reason', reason);
  return addSecurityHeaders(NextResponse.redirect(blockedUrl), true);
}

async function sha256Hex(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function hmacSha256Hex(secret: string, value: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function hasValidEdgeGoodBotSignature(req: NextRequest, pathname: string) {
  const botId = req.headers.get('x-shield-bot-id') || '';
  const timestamp = req.headers.get('x-shield-timestamp') || '';
  const nonce = req.headers.get('x-shield-nonce') || '';
  const signature = req.headers.get('x-shield-signature') || '';

  if (!botId || !timestamp || !nonce || !signature || !APPROVED_GOOD_BOTS.has(botId)) {
    return false;
  }

  const timestampMs = Number.parseInt(timestamp, 10) * 1000;
  if (!Number.isFinite(timestampMs) || Math.abs(Date.now() - timestampMs) > GOOD_BOT_TIMESTAMP_WINDOW_MS) {
    return false;
  }

  // Edge middleware only pre-validates safe read traffic. The Node verifier still enforces nonce replay checks.
  const bodyHash = await sha256Hex('');
  const payload = `${req.method.toUpperCase()}\n${pathname}\n${timestamp}\n${nonce}\n${bodyHash}`;
  const expectedSignature = await hmacSha256Hex(GOOD_BOT_SECRET, payload);
  return signature.toLowerCase() === expectedSignature;
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (isStaticOrNext(pathname)) {
    return addSecurityHeaders(NextResponse.next(), false);
  }

  const isApi = pathname.startsWith('/api/');
  const sensitiveApi = isSensitiveApi(pathname);
  const sensitivePage = !isApi && isSensitivePage(pathname);
  const publicShieldRoute = isPublicShieldRoute(pathname);
  const isEdgeLog = req.headers.get('x-shield-edge-log') === 'true';
  const hasIntentCookie = req.cookies.get(INTENT_COOKIE)?.value === '1';
  const goodBotAttempt = Boolean(req.headers.get('x-shield-bot-id') && req.headers.get('x-shield-signature'));
  const validGoodBot = goodBotAttempt && req.method === 'GET'
    ? await hasValidEdgeGoodBotSignature(req, pathname)
    : false;

  if (!publicShieldRoute && (sensitiveApi || sensitivePage)) {
    const classification = classifyRequest(req);
    const hasBrowserFetchMetadata = Boolean(
      req.headers.get('sec-fetch-dest') ||
      req.headers.get('sec-fetch-mode') ||
      req.headers.get('sec-ch-ua')
    );
    const hasAcceptLanguage = Boolean(req.headers.get('accept-language'));

    if (!classification.allowed && !validGoodBot && !isEdgeLog) {
      if (isApi) {
        return blockedApi(classification.reason);
      }
      return blockedPage(req, classification.reason);
    }

    if (sensitivePage && !hasIntentCookie && !validGoodBot && (!hasAcceptLanguage || !hasBrowserFetchMetadata)) {
      return blockedPage(req, 'browser_impersonation_missing_navigation_metadata');
    }

    if (sensitiveApi && !hasIntentCookie && !validGoodBot && !isEdgeLog) {
      return blockedApi('missing_browser_intent_cookie');
    }
  }

  if (!isApi && !publicShieldRoute) {
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
          path: pathname,
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

  const res = addSecurityHeaders(NextResponse.next(), sensitiveApi || sensitivePage);

  if (!isApi && !publicShieldRoute) {
    res.cookies.set(INTENT_COOKIE, '1', {
      httpOnly: true,
      sameSite: 'lax',
      secure: req.nextUrl.protocol === 'https:',
      maxAge: 60 * 10,
      path: '/',
    });
  }

  return res;
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
