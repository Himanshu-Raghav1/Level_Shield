import { NextRequest, NextResponse } from 'next/server';
import { verifyRequest } from '@/lib/security/verify';
import { evaluateBehaviorTelemetry } from '@/lib/security/behavior-dna';
import { BehaviorTelemetry } from '@/types/security';

export async function POST(req: NextRequest) {
  try {
    const verification = await verifyRequest(req);

    if (verification.isBlocked && verification.mitigationResponse) {
      return verification.mitigationResponse;
    }

    const telemetryData = (await req.json()) as BehaviorTelemetry;

    // Evaluate the submitted behavior DNA
    const evaluation = evaluateBehaviorTelemetry(verification.sessionId, telemetryData);

    const res = NextResponse.json({
      success: true,
      sessionId: verification.sessionId,
      behavior: {
        entropy: evaluation.entropy,
        suspicious: evaluation.suspicious,
        reasons: evaluation.reasons,
      },
      risk: {
        score: verification.riskResult.score,
        action: verification.riskResult.action,
        reasons: verification.riskResult.reasons,
      }
    });

    if (verification.setCookieHeader) {
      res.headers.set('Set-Cookie', verification.setCookieHeader);
    }

    return res;
  } catch (error: any) {
    console.error('Error in behavior telemetry ingestion:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
