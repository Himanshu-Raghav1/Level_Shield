import { NextRequest, NextResponse } from 'next/server';
import { verifyRequest } from '@/lib/security/verify-request';
import { MOCK_SALARIES } from '@/lib/demo/salaries';
import { injectCanaryRowIfSuspicious } from '@/lib/security/canary';

export async function GET(req: NextRequest) {
  try {
    // 1. Run security verification
    const verification = await verifyRequest(req);

    // If blocked or challenge required, return the mitigation response
    if (verification.isBlocked && verification.mitigationResponse) {
      return verification.mitigationResponse;
    }

    // 2. Extract search query (q or company)
    const searchParams = req.nextUrl.searchParams;
    const query = (searchParams.get('q') || searchParams.get('company') || '').toLowerCase().trim();

    // 3. Filter mock salary data
    let results = MOCK_SALARIES;
    if (query) {
      results = MOCK_SALARIES.filter(
        (item) =>
          item.company.toLowerCase().includes(query) ||
          item.title.toLowerCase().includes(query) ||
          item.location.toLowerCase().includes(query)
      );
    }

    // 4. If suspicious, inject a Canary Row
    const finalResults = injectCanaryRowIfSuspicious(
      verification.sessionId,
      results,
      verification.riskResult.score
    );

    // 5. Construct response
    const res = NextResponse.json({
      success: true,
      sessionId: verification.sessionId,
      results: finalResults,
      count: finalResults.length,
      risk: {
        score: verification.riskResult.score,
        action: verification.riskResult.action,
        reasons: verification.riskResult.reasons,
      },
    });

    // Handle session cookies for tracking consistency
    if (verification.setCookieHeader) {
      res.headers.set('Set-Cookie', verification.setCookieHeader);
    }

    return res;
  } catch (error: any) {
    console.error('Error in compensation search API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
