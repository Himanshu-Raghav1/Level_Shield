import { NextRequest, NextResponse } from 'next/server';
import { cookies as getCookies, headers as getHeaders } from 'next/headers';
import { createOrGetSession, insertRequestEvent } from '../store/events';
import { setSessionGoodBot, checkDefenseActionResolved } from '../store/sessionStore';
import { evaluateSessionRisk } from './risk-engine';
import { verifyGoodBotSignature } from './good-bot';
import { triggerHoneyMazeHit } from './honey-maze';
import { RiskResult } from '@/types/security';

const COOKIE_NAME = 'level_shield_session';

export interface VerifyResult {
  sessionId: string;
  riskResult: RiskResult;
  setCookieHeader?: string;
  isBlocked: boolean;
  mitigationResponse?: NextResponse;
}

/**
 * Utility to extract headers from NextRequest or next/headers
 */
function extractHeaders(headersList: Headers): Record<string, string> {
  const headers: Record<string, string> = {};
  headersList.forEach((value, key) => {
    headers[key] = value;
  });
  return headers;
}

/**
 * Enforces rate limiting or delays for "throttle" action
 */
async function handleThrottling(sessionId: string): Promise<void> {
  // Add a 1.5s delay to throttle the scraper
  await new Promise((resolve) => setTimeout(resolve, 1500));
}

/**
 * Enforces tarpitting (ultra-slow delay) for "tarpit" action
 */
async function handleTarpit(sessionId: string): Promise<void> {
  // Delay for 8 seconds to consume bot resources
  await new Promise((resolve) => setTimeout(resolve, 8000));
}

/**
 * Verifies request inside an API Route
 */
export async function verifyRequest(req: NextRequest): Promise<VerifyResult> {
  const url = req.nextUrl.pathname;
  const method = req.method;
  
  // Extract session ID from cookie
  const cookieStore = req.cookies;
  const sessionCookie = cookieStore.get(COOKIE_NAME)?.value;

  const headersList = req.headers;
  const headers = extractHeaders(headersList);
  const userAgent = headers['user-agent'] || 'unknown';
  const ipAddress = headers['x-forwarded-for']?.split(',')[0] || '127.0.0.1';
  
  // Try to verify Good Bot Lane Signature first
  const botId = headers['x-shield-bot-id'];
  let isGoodBotValid = false;
  if (botId) {
    // Read body if exists for signature check (or default to empty)
    let bodyText = '';
    try {
      const clonedReq = req.clone();
      bodyText = await clonedReq.text();
    } catch (e) {
      // Body reading skipped
    }
    const goodBotCheck = verifyGoodBotSignature(headers, method, url, bodyText);
    if (goodBotCheck.isValid) {
      isGoodBotValid = true;
    }
  }

  // Get or create session
  const fingerprint = headers['sec-ch-ua'] || 'generic-fp';
  const session = createOrGetSession(sessionCookie, userAgent, ipAddress, fingerprint);
  const sessionId = session.id;

  if (isGoodBotValid) {
    setSessionGoodBot(sessionId);
  }

  // Intercept Honey Maze hits
  if (url.startsWith('/maze/')) {
    const token = url.split('/').pop() || '';
    if (token) {
      triggerHoneyMazeHit(sessionId, token);
    }
  }

  // Log request in database
  const referrer = headers['referer'] || headers['referrer'] || '';
  insertRequestEvent(sessionId, url, method, referrer);

  // Evaluate risk
  const riskResult = evaluateSessionRisk(sessionId, headers, url, method);

  let isBlocked = false;
  let mitigationResponse: NextResponse | undefined;

  // Handle Mitigations
  if (riskResult.action === 'block') {
    isBlocked = true;
    mitigationResponse = NextResponse.json(
      { error: 'Access Denied: Shield Anti-Scraping Block Triggered', score: riskResult.score },
      { status: 403 }
    );
  } else if (riskResult.action === 'tarpit') {
    await handleTarpit(sessionId);
    // Continue or return tarpitted status
  } else if (riskResult.action === 'throttle') {
    await handleThrottling(sessionId);
  } else if (riskResult.action === 'proof_of_work') {
    // If the Proof of Work has not been resolved yet, prompt for Pow Challenge
    // Exceptions: Do not block PoW verify API itself!
    const isChallengeApi = url.includes('/api/challenge/pow');
    if (!isChallengeApi && !checkDefenseActionResolved(sessionId, 'proof_of_work')) {
      isBlocked = true;
      mitigationResponse = NextResponse.json(
        { 
          error: 'Proof-of-Work Challenge Required', 
          challengeRequired: true,
          score: riskResult.score 
        },
        { status: 429 } // Too many requests/Challenge required
      );
    }
  } else if (riskResult.action === 'honey_maze') {
    // Redirect suspicious scrapers to the honey maze route
    // Only redirect if not already on the maze route itself
    if (!url.startsWith('/maze/') && !url.includes('/api/')) {
      isBlocked = true;
      mitigationResponse = NextResponse.redirect(new URL(`/maze/maze_${sessionId}`, req.url));
    }
  }

  // Construct results
  const result: VerifyResult = {
    sessionId,
    riskResult,
    isBlocked,
    mitigationResponse,
  };

  // If session ID cookie wasn't present originally, indicate that it needs to be set
  if (!sessionCookie) {
    result.setCookieHeader = `${COOKIE_NAME}=${sessionId}; Path=/; HttpOnly; SameSite=Lax`;
  }

  return result;
}

/**
 * Verifies request inside a Server Page (Server Component) using next/headers
 */
export async function verifyServerPage(currentPath: string): Promise<VerifyResult> {
  const cookieStore = await getCookies();
  const headersList = await getHeaders();

  const sessionCookie = cookieStore.get(COOKIE_NAME)?.value;
  const headers = extractHeaders(headersList);
  const userAgent = headers['user-agent'] || 'unknown';
  const ipAddress = headers['x-forwarded-for']?.split(',')[0] || '127.0.0.1';

  // Get or create session
  const fingerprint = headers['sec-ch-ua'] || 'generic-fp';
  const session = createOrGetSession(sessionCookie, userAgent, ipAddress, fingerprint);
  const sessionId = session.id;

  // Intercept Honey Maze hits
  if (currentPath.startsWith('/maze/')) {
    const token = currentPath.split('/').pop() || '';
    if (token) {
      triggerHoneyMazeHit(sessionId, token);
    }
  }

  // Log page view in database
  const referrer = headers['referer'] || headers['referrer'] || '';
  insertRequestEvent(sessionId, currentPath, 'GET', referrer);

  // Evaluate risk
  const riskResult = evaluateSessionRisk(sessionId, headers, currentPath, 'GET');

  let isBlocked = false;
  let mitigationResponse: NextResponse | undefined;

  // Handle Block / Tarpit / PoW / Honey Maze for Page Views
  if (riskResult.action === 'block') {
    isBlocked = true;
    mitigationResponse = NextResponse.redirect(new URL('/blocked', headers['host'] ? `http://${headers['host']}` : undefined));
  } else if (riskResult.action === 'tarpit') {
    await handleTarpit(sessionId);
  } else if (riskResult.action === 'throttle') {
    await handleThrottling(sessionId);
  } else if (riskResult.action === 'proof_of_work') {
    if (!checkDefenseActionResolved(sessionId, 'proof_of_work')) {
      isBlocked = true;
      mitigationResponse = NextResponse.redirect(new URL('/challenge/pow', headers['host'] ? `http://${headers['host']}` : undefined));
    }
  } else if (riskResult.action === 'honey_maze') {
    if (!currentPath.startsWith('/maze/')) {
      isBlocked = true;
      mitigationResponse = NextResponse.redirect(new URL(`/maze/maze_${sessionId}`, headers['host'] ? `http://${headers['host']}` : undefined));
    }
  }

  return {
    sessionId,
    riskResult,
    isBlocked,
    mitigationResponse,
  };
}
