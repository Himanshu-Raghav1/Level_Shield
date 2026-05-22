import { NextRequest, NextResponse } from 'next/server';
import { verifyRequest } from '@/lib/security/verify-request';
import { verifyChallenge } from '@/lib/security/pow';

export async function POST(req: NextRequest) {
  try {
    const verification = await verifyRequest(req);

    const { challenge, nonce } = await req.json();

    if (!challenge || !nonce) {
      return NextResponse.json({ error: 'Missing challenge or nonce' }, { status: 400 });
    }

    // Verify the solution
    const isValid = verifyChallenge(verification.sessionId, challenge, nonce);

    if (isValid) {
      const res = NextResponse.json({
        success: true,
        message: 'Proof of work verified successfully. Session unlocked.',
        sessionId: verification.sessionId,
      });

      if (verification.setCookieHeader) {
        res.headers.set('Set-Cookie', verification.setCookieHeader);
      }

      return res;
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid nonce or expired challenge' 
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error in PoW challenge verification:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
