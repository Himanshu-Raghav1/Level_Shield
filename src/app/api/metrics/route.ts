import { NextResponse } from 'next/server';
import { db } from '@/lib/store/db';
import { getMetrics } from '@/lib/store/events';

export async function GET() {
  try {
    // 1. Fetch Metrics Summary
    const summary = getMetrics();

    // 4. Top Suspicious Sessions
    const topSuspicious = db.prepare(`
      SELECT s.id, s.ip_address, s.user_agent, s.created_at, MAX(r.score) as max_score, r.reasons,
             (SELECT action FROM defense_actions WHERE session_id = s.id ORDER BY timestamp DESC LIMIT 1) as action
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
      action: s.action || 'allow',
    }));

    // 5. Timeline of Risk Scores (grouped by minute, segmented by profile class)
    const riskTimeline = db.prepare(`
      SELECT 
        strftime('%Y-%m-%dT%H:%M:00', timestamp) as time_bucket,
        AVG(CASE 
          WHEN session_id LIKE 'sim_normal-user%' OR session_id LIKE 'sim_power-user%' OR session_id LIKE 'sim_good-bot%' OR (session_id NOT LIKE 'sim%' AND session_id NOT LIKE 'sess_bot%') THEN score 
          ELSE NULL 
        END) as human_score,
        AVG(CASE 
          WHEN session_id LIKE 'sim_request-scraper%' OR session_id LIKE 'sim_sequential-scraper%' OR session_id LIKE 'sim_fake-googlebot%' THEN score 
          ELSE NULL 
        END) as scraper_score,
        AVG(CASE 
          WHEN session_id LIKE 'sim_playwright-bot%' OR session_id LIKE 'sim_ai-agent%' OR session_id LIKE 'sess_bot%' THEN score 
          ELSE NULL 
        END) as playwright_score
      FROM risk_events
      GROUP BY time_bucket
      ORDER BY time_bucket ASC
      LIMIT 20
    `).all() as any[];

    const riskTimelineFormatted = riskTimeline.map(t => ({
      time: t.time_bucket,
      human: t.human_score !== null ? Math.round(t.human_score) : null,
      scraper: t.scraper_score !== null ? Math.round(t.scraper_score) : null,
      playwright: t.playwright_score !== null ? Math.round(t.playwright_score) : null,
    }));

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
        risk: riskTimelineFormatted,
        defense: defenseTimeline,
      }
    });

  } catch (error: any) {
    console.error('Error in metrics API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
