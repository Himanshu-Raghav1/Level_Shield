import { NextRequest, NextResponse } from 'next/server';
import { verifyRequest } from '@/lib/security/verify-request';
import { generateHoneyLink } from '@/lib/security/honey-maze';

// Mock list of company details
const COMPANY_PROFILES: Record<string, any> = {
  google: {
    name: 'Google',
    slug: 'google',
    headquarters: 'Mountain View, CA',
    employees: '180,000+',
    founded: '1998',
    description: 'A global technology leader focused on search, advertising, cloud computing, software, and hardware.',
    rating: 4.5,
  },
  meta: {
    name: 'Meta',
    slug: 'meta',
    headquarters: 'Menlo Park, CA',
    employees: '65,000+',
    founded: '2004',
    description: 'Builds technologies that help people connect, find communities, and grow businesses.',
    rating: 4.3,
  },
  netflix: {
    name: 'Netflix',
    slug: 'netflix',
    headquarters: 'Los Gatos, CA',
    employees: '12,000+',
    founded: '1997',
    description: 'One of the world\'s leading entertainment services with millions of paid memberships in over 190 countries.',
    rating: 4.4,
  },
  apple: {
    name: 'Apple',
    slug: 'apple',
    headquarters: 'Cupertino, CA',
    employees: '160,000+',
    founded: '1776', // :)
    description: 'Designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories.',
    rating: 4.2,
  },
  amazon: {
    name: 'Amazon',
    slug: 'amazon',
    headquarters: 'Seattle, WA',
    employees: '1,500,000+',
    founded: '1994',
    description: 'Focuses on e-commerce, cloud computing, digital streaming, and artificial intelligence.',
    rating: 3.9,
  },
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const verification = await verifyRequest(req);

    // If blocked or challenge required, return the mitigation response
    if (verification.isBlocked && verification.mitigationResponse) {
      return verification.mitigationResponse;
    }

    const { slug } = await params;
    const cleanSlug = slug.toLowerCase().trim();

    // Fetch profile, or fallback to generic profile
    let profile = COMPANY_PROFILES[cleanSlug];
    if (!profile) {
      profile = {
        name: cleanSlug.charAt(0).toUpperCase() + cleanSlug.slice(1),
        slug: cleanSlug,
        headquarters: 'Silicon Valley, CA',
        employees: '1,000+',
        founded: '2015',
        description: `Premium salary details and level analysis for ${cleanSlug}.`,
        rating: 4.0,
      };
    }

    // Initialize honeyDecoy as null
    let honeyDecoy = null;

    // If session is suspicious (risk > 35), generate a honey decoy link
    if (verification.riskResult.score > 35) {
      const linkInfo = generateHoneyLink(verification.sessionId);
      honeyDecoy = {
        token: linkInfo.token,
        url: linkInfo.url,
      };
    }

    const res = NextResponse.json({
      success: true,
      sessionId: verification.sessionId,
      company: profile,
      honeyDecoy, // Hidden link metadata
      risk: {
        score: verification.riskResult.score,
        action: verification.riskResult.action,
        reasons: verification.riskResult.reasons,
      },
    });

    if (verification.setCookieHeader) {
      res.headers.set('Set-Cookie', verification.setCookieHeader);
    }

    return res;
  } catch (error: any) {
    console.error('Error in company profile API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
