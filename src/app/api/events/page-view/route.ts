import { NextRequest, NextResponse } from 'next/server';
import { verifyRequest } from '@/lib/security/verify';

export async function POST(req: NextRequest) {
  try {
    // Run full security checks
    const verification = await verifyRequest(req);

    // If blocked or redirected by the mitigation engine, return that response
    if (verification.isBlocked && verification.mitigationResponse) {
      return verification.mitigationResponse;
    }

    const res = NextResponse.json({
      success: true,
      sessionId: verification.sessionId,
      risk: {
        score: verification.riskResult.score,
        action: verification.riskResult.action,
        reasons: verification.riskResult.reasons,
      }
    });

    // Attach the session cookie if newly generated
    if (verification.setCookieHeader) {
      res.headers.set('Set-Cookie', verification.setCookieHeader);
    }

    return res;
  } catch (error: any) {
    console.error('Error in page-view event logging:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
