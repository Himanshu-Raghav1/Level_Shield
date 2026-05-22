import { NextRequest, NextResponse } from 'next/server';
import { verifyRequest } from '@/lib/security/verify-request';
import { generateChallenge } from '@/lib/security/pow';

export async function POST(req: NextRequest) {
  try {
    const verification = await verifyRequest(req);
    
    // Generate a cryptographic PoW challenge linked to this session
    const challenge = generateChallenge(verification.sessionId);

    const res = NextResponse.json({
      success: true,
      challenge: challenge.challenge,
      difficulty: challenge.difficulty,
      expiry: challenge.expiry,
    });

    if (verification.setCookieHeader) {
      res.headers.set('Set-Cookie', verification.setCookieHeader);
    }

    return res;
  } catch (error: any) {
    console.error('Error in PoW challenge creation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
