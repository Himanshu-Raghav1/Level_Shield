import { NextRequest, NextResponse } from 'next/server';
import { verifyRequest } from '@/lib/security/verify-request';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const isEdgeLog = req.headers.get('x-shield-edge-log') === 'true';

    // Run full security checks, forwarding Edge Middleware payload if present
    const verification = await verifyRequest(req, isEdgeLog ? body : undefined);

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
