import { NextResponse } from 'next/server';
import { db } from '@/lib/store/db';
import { analyzeGraphIntent } from '@/lib/security/graph-intent';
import { getSessionBehaviorEntropy } from '@/lib/security/behavior-dna';
import { verifyFingerprintConsistency } from '@/lib/security/fingerprint';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;

    // 1. Get Session Info
    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId) as any;
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // 2. Fetch complete request logs
    const requests = db.prepare(`
      SELECT * FROM request_events
      WHERE session_id = ?
      ORDER BY timestamp ASC
    `).all(sessionId) as any[];

    // 3. Fetch behavior telemetry events
    const behaviors = db.prepare(`
      SELECT id, event_type, details, timestamp FROM behavior_events
      WHERE session_id = ?
      ORDER BY timestamp ASC
    `).all(sessionId) as any[];

    const behaviorsFormatted = behaviors.map(b => {
      try {
        return {
          ...b,
          details: JSON.parse(b.details),
        };
      } catch (e) {
        return b;
      }
    });

    // 4. Fetch risk assessment history
    const risks = db.prepare(`
      SELECT * FROM risk_events
      WHERE session_id = ?
      ORDER BY timestamp ASC
    `).all(sessionId) as any[];

    const risksFormatted = risks.map(r => ({
      ...r,
      reasons: JSON.parse(r.reasons || '[]'),
    }));

    // 5. Fetch defense actions logs
    const defenses = db.prepare(`
      SELECT * FROM defense_actions
      WHERE session_id = ?
      ORDER BY timestamp ASC
    `).all(sessionId) as any[];

    // 6. Fetch specific trap hits
    const mazeHits = db.prepare(`
      SELECT * FROM honey_maze_hits
      WHERE session_id = ?
      ORDER BY timestamp ASC
    `).all(sessionId) as any[];

    const canaryExposures = db.prepare(`
      SELECT * FROM canary_tokens
      WHERE session_id = ? AND exposed = 1
      ORDER BY timestamp ASC
    `).all(sessionId) as any[];

    const agentBeacons = db.prepare(`
      SELECT * FROM agent_beacons
      WHERE session_id = ?
      ORDER BY timestamp ASC
    `).all(sessionId) as any[];

    // 7. Graph of Intent navigation analysis
    const graphAnalysis = analyzeGraphIntent(sessionId);

    // Calculate details for each of the 8 innovation layers
    const behaviorEntropy = getSessionBehaviorEntropy(sessionId);
    const fingerprintCheck = verifyFingerprintConsistency(sessionId, { 'user-agent': session.user_agent || '' });

    return NextResponse.json({
      session: {
        id: session.id,
        createdAt: session.created_at,
        userAgent: session.user_agent,
        ipAddress: session.ip_address,
        fingerprint: session.fingerprint,
        isGoodBot: session.is_good_bot === 1,
      },
      requests,
      behaviors: behaviorsFormatted,
      risks: risksFormatted,
      defenses,
      traps: {
        mazeHits,
        canaryExposures,
        agentBeacons,
      },
      graphAnalysis,
      innovationLayers: {
        behaviorDna: {
          entropy: behaviorEntropy,
          telemetrySubmittedCount: behaviors.length,
          reasons: behaviors.length > 0 ? [] : ['no_telemetry_yet']
        },
        honeyMaze: {
          hitCount: mazeHits.length,
          hasHit: mazeHits.length > 0,
        },
        canaryTokens: {
          generatedCount: (db.prepare('SELECT COUNT(*) as count FROM canary_tokens WHERE session_id = ?').get(sessionId) as any)?.count || 0,
          exposedCount: canaryExposures.length,
          hasExposed: canaryExposures.length > 0,
        },
        graphOfIntent: graphAnalysis,
        fingerprint: {
          value: session.fingerprint,
          isConsistent: fingerprintCheck.isConsistent,
          reasons: fingerprintCheck.reasons,
        },
        agentTrap: {
          hitCount: agentBeacons.length,
          hasHit: agentBeacons.length > 0,
        },
        goodBotLane: {
          isGoodBot: session.is_good_bot === 1,
        },
        adaptiveFriction: {
          previousActionsCount: defenses.length,
          lastMitigation: defenses.length > 0 ? defenses[defenses.length - 1].action : 'none',
        }
      }
    });

  } catch (error: any) {
    console.error(`Error fetching session details for ${error}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
