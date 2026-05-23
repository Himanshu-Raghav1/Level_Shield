import { NextResponse } from 'next/server';
import { db } from '@/lib/store/db';

export async function GET() {
  try {
    // 1. Fetch recent requests
    const recentRequests = db.prepare(`
      SELECT r.id, r.session_id, r.url, r.method, r.referrer, r.timestamp, s.ip_address, s.user_agent
      FROM request_events r
      JOIN sessions s ON r.session_id = s.id
      ORDER BY r.timestamp DESC
      LIMIT 30
    `).all() as any[];

    // 2. Fetch recent risk logs
    const recentRiskLogs = db.prepare(`
      SELECT r.id, r.session_id, r.score, r.reasons, r.confidence, r.timestamp, s.ip_address
      FROM risk_events r
      JOIN sessions s ON r.session_id = s.id
      ORDER BY r.timestamp DESC
      LIMIT 20
    `).all() as any[];

    // 3. Fetch recent defense actions
    const recentDefenses = db.prepare(`
      SELECT d.id, d.session_id, d.action, d.resolved, d.timestamp, s.ip_address
      FROM defense_actions d
      JOIN sessions s ON d.session_id = s.id
      ORDER BY d.timestamp DESC
      LIMIT 20
    `).all() as any[];

    // 4. Fetch recent security alert hits (Honey Maze, Canary, Agent Beacons)
    const mazeHits = db.prepare(`
      SELECT h.id, h.session_id, h.token, h.timestamp, 'honey_maze' as type, s.ip_address
      FROM honey_maze_hits h
      JOIN sessions s ON h.session_id = s.id
      ORDER BY h.timestamp DESC
      LIMIT 10
    `).all() as any[];

    const canaryExposures = db.prepare(`
      SELECT c.token as id, c.session_id, c.token, c.timestamp, 'canary_token' as type, s.ip_address
      FROM canary_tokens c
      JOIN sessions s ON c.session_id = s.id
      WHERE c.exposed = 1
      ORDER BY c.timestamp DESC
      LIMIT 10
    `).all() as any[];

    const agentHits = db.prepare(`
      SELECT a.id, a.session_id, a.token, a.timestamp, 'agent_beacon' as type, s.ip_address
      FROM agent_beacons a
      JOIN sessions s ON a.session_id = s.id
      ORDER BY a.timestamp DESC
      LIMIT 10
    `).all() as any[];

    const formatTimestamp = (t: string) => {
      if (!t) return t;
      if (t.endsWith('Z') || t.includes('T') || t.includes('+')) return t;
      return t.replace(' ', 'T') + 'Z';
    };

    const requestsFormatted = recentRequests.map(r => ({
      ...r,
      timestamp: formatTimestamp(r.timestamp),
    }));

    // Format risk reasons in risk logs
    const formattedRisk = recentRiskLogs.map(r => ({
      ...r,
      timestamp: formatTimestamp(r.timestamp),
      reasons: JSON.parse(r.reasons || '[]'),
    }));

    const defensesFormatted = recentDefenses.map(d => ({
      ...d,
      timestamp: formatTimestamp(d.timestamp),
    }));

    // Combine all security alerts into one sorted list
    const alerts = [...mazeHits, ...canaryExposures, ...agentHits]
      .map(a => ({ ...a, timestamp: formatTimestamp(a.timestamp) }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20);

    return NextResponse.json({
      requests: requestsFormatted,
      riskEvaluations: formattedRisk,
      defenses: defensesFormatted,
      alerts,
    });
  } catch (error: any) {
    console.error('Error in events API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
