import { NextRequest, NextResponse } from 'next/server';
import { verifyRequest } from '@/lib/security/verify-request';
import { logAgentBeacon } from '@/lib/store/sessionStore';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const verification = await verifyRequest(req);

    // Get the unique trap token
    const { token } = await params;

    // Log the AI agent trap hit
    logAgentBeacon(verification.sessionId, token);

    // Re-verify after logging the trap hit so the risk engine is immediately aware of this violation
    const updatedVerification = await verifyRequest(req);

    const res = NextResponse.json({
      success: false,
      error: 'Security access violation detected.',
      code: 'SHIELD_AGENT_PROOF_TRIGGERED',
      sessionId: updatedVerification.sessionId,
      risk: {
        score: updatedVerification.riskResult.score,
        action: updatedVerification.riskResult.action,
        reasons: updatedVerification.riskResult.reasons,
      },
    }, { status: 403 });

    if (updatedVerification.setCookieHeader) {
      res.headers.set('Set-Cookie', updatedVerification.setCookieHeader);
    }

    return res;
  } catch (error: any) {
    console.error('Error in agent proof trap API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
