import { NextResponse } from 'next/server';
import { db } from '@/lib/store/db';

export async function GET() {
  try {
    // 1. Basic Counts
    const totalRequests = (db.prepare('SELECT COUNT(*) as count FROM request_events').get() as any)?.count || 0;
    const totalSessions = (db.prepare('SELECT COUNT(*) as count FROM sessions').get() as any)?.count || 0;

    const botRequests = (db.prepare(`
      SELECT COUNT(*) as count FROM request_events r
      JOIN risk_events k ON r.session_id = k.session_id
      WHERE k.score > 35
    `).get() as any)?.count || 0;

    const blockedRequests = (db.prepare(`
      SELECT COUNT(*) as count FROM defense_actions WHERE action IN ('block', 'tarpit')
    `).get() as any)?.count || 0;

    const throttledRequests = (db.prepare(`
      SELECT COUNT(*) as count FROM defense_actions WHERE action = 'throttle'
    `).get() as any)?.count || 0;

    const powChallenges = (db.prepare(`
      SELECT COUNT(*) as count FROM defense_actions WHERE action = 'proof_of_work'
    `).get() as any)?.count || 0;

    const powSolved = (db.prepare(`
      SELECT COUNT(*) as count FROM defense_actions WHERE action = 'proof_of_work' AND resolved = 1
    `).get() as any)?.count || 0;

    // 2. False Positive Estimate: ratio of challenged clients that solved the PoW
    const falsePositiveEstimate = powChallenges > 0 
      ? Math.round((powSolved / powChallenges) * 100) 
      : 0;

    // 3. Honey Maze Hits, Canary Tokens, and Agent Beacons
    const honeyMazeHits = (db.prepare('SELECT COUNT(*) as count FROM honey_maze_hits').get() as any)?.count || 0;
    
    const canaryInjected = (db.prepare('SELECT COUNT(*) as count FROM canary_tokens').get() as any)?.count || 0;
    const canaryExposed = (db.prepare('SELECT COUNT(*) as count FROM canary_tokens WHERE exposed = 1').get() as any)?.count || 0;
    
    const agentBeacons = (db.prepare('SELECT COUNT(*) as count FROM agent_beacons').get() as any)?.count || 0;
    const goodBotsVerified = (db.prepare('SELECT COUNT(*) as count FROM sessions WHERE is_good_bot = 1').get() as any)?.count || 0;

    // 4. Top Suspicious Sessions
    const topSuspicious = db.prepare(`
      SELECT s.id, s.ip_address, s.user_agent, s.created_at, MAX(r.score) as max_score, r.reasons
      FROM sessions s
      JOIN risk_events r ON s.id = r.session_id
      GROUP BY s.id
      ORDER BY max_score DESC
      LIMIT 10
    `).all() as any[];

    // Parse reasons
    const topSuspiciousFormatted = topSuspicious.map(s => ({
      id: s.id,
      ipAddress: s.ip_address,
      userAgent: s.user_agent,
      createdAt: s.created_at,
      score: s.max_score,
      reasons: JSON.parse(s.reasons || '[]'),
    }));

    // 5. Timeline of Risk Scores (grouped by minute)
    const riskTimeline = db.prepare(`
      SELECT strftime('%Y-%m-%dT%H:%M:00', timestamp) as time_bucket, COUNT(*) as count, AVG(score) as avg_score
      FROM risk_events
      GROUP BY time_bucket
      ORDER BY time_bucket DESC
      LIMIT 20
    `).all() as any[];

    // 6. Timeline of Defense Actions
    const defenseTimeline = db.prepare(`
      SELECT strftime('%Y-%m-%dT%H:%M:00', timestamp) as time_bucket, action, COUNT(*) as count
      FROM defense_actions
      GROUP BY time_bucket, action
      ORDER BY time_bucket DESC
      LIMIT 30
    `).all() as any[];

    return NextResponse.json({
      summary: {
        totalRequests,
        totalSessions,
        botRequests,
        blockedRequests,
        throttledRequests,
        powChallenges,
        powSolved,
        falsePositiveEstimate,
        honeyMazeHits,
        canaryInjected,
        canaryExposed,
        agentBeacons,
        goodBotsVerified,
      },
      topSuspicious: topSuspiciousFormatted,
      timelines: {
        risk: riskTimeline,
        defense: defenseTimeline,
      }
    });

  } catch (error: any) {
    console.error('Error in metrics API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
