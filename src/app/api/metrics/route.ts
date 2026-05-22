import { NextResponse } from 'next/server';
import { db } from '@/lib/store/db';
import { getMetrics } from '@/lib/store/events';

export async function GET() {
  try {
    // 1. Fetch Metrics Summary
    const summary = getMetrics();

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
      summary,
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
