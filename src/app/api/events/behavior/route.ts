import { NextRequest, NextResponse } from 'next/server';
import { evaluateBehaviorTelemetry } from '@/lib/security/behavior-dna';
import { BehaviorTelemetry } from '@/types/security';
import { getOrCreateSession } from '@/lib/store/sessionStore';

const COOKIE_NAME = 'level_shield_session';

export async function POST(req: NextRequest) {
  try {
    const telemetryData = (await req.json()) as BehaviorTelemetry;
    const requestedSessionId = req.cookies.get(COOKIE_NAME)?.value || (telemetryData as any).sessionId;
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const fingerprint = req.headers.get('sec-ch-ua') || 'behavior-fp';
    const session = getOrCreateSession(requestedSessionId, userAgent, ipAddress, fingerprint);

    // Evaluate the submitted behavior DNA
    const evaluation = evaluateBehaviorTelemetry(session.id, telemetryData);

    const res = NextResponse.json({
      success: true,
      sessionId: session.id,
      behavior: {
        entropy: evaluation.entropy,
        suspicious: evaluation.suspicious,
        reasons: evaluation.reasons,
      },
    });

    if (!req.cookies.get(COOKIE_NAME)) {
      res.headers.set('Set-Cookie', `${COOKIE_NAME}=${session.id}; Path=/; HttpOnly; SameSite=Lax`);
    }

    return res;
  } catch (error: any) {
    console.error('Error in behavior telemetry ingestion:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
