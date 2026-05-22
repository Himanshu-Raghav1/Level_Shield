import { NextRequest, NextResponse } from 'next/server';
import { verifyRequest } from '@/lib/security/verify-request';
import { verifyGoodBotSignature } from '@/lib/security/good-bot';
import { setSessionGoodBot } from '@/lib/store/sessionStore';

export async function POST(req: NextRequest) {
  try {
    const verification = await verifyRequest(req);
    
    // Extract headers
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const bodyText = await req.clone().text();
    const goodBotCheck = verifyGoodBotSignature(headers, req.method, req.nextUrl.pathname, bodyText);

    if (goodBotCheck.isValid) {
      setSessionGoodBot(verification.sessionId);

      const res = NextResponse.json({
        success: true,
        message: 'Good bot signature verified. Allowed at a controlled rate.',
        sessionId: verification.sessionId,
      });

      if (verification.setCookieHeader) {
        res.headers.set('Set-Cookie', verification.setCookieHeader);
      }

      return res;
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid signature or replay protection triggered',
        reason: goodBotCheck.reason,
      }, { status: 401 });
    }
  } catch (error: any) {
    console.error('Error in good bot verification route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
