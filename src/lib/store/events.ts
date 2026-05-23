import { db } from './db';
import { nanoid } from 'nanoid';
import { RiskReason, DefenseAction, SessionInfo, RequestEvent, BehaviorEvent, DashboardMetrics } from '@/types/security';
import { analyzeGraphIntent } from '../security/graph-intent';

export function createOrGetSession(
  sessionId: string | undefined,
  userAgent: string,
  ipAddress: string,
  fingerprint: string
): SessionInfo {
  const id = sessionId || `sess_${nanoid(16)}`;

  // Fetch existing
  const existing = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id) as any;
  if (existing) {
    return {
      id: existing.id,
      createdAt: existing.created_at,
      userAgent: existing.user_agent,
      ipAddress: existing.ip_address,
      fingerprint: existing.fingerprint,
      isGoodBot: existing.is_good_bot === 1,
    };
  }

  // Insert new
  db.prepare(`
    INSERT INTO sessions (id, user_agent, ip_address, fingerprint, is_good_bot)
    VALUES (?, ?, ?, ?, 0)
  `).run(id, userAgent, ipAddress, fingerprint);

  return {
    id,
    createdAt: new Date().toISOString(),
    userAgent,
    ipAddress,
    fingerprint,
    isGoodBot: false,
  };
}

export function insertRequestEvent(sessionId: string, url: string, method: string, referrer: string): void {
  const id = `req_${nanoid(16)}`;
  db.prepare(`
    INSERT INTO request_events (id, session_id, url, method, referrer)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, sessionId, url, method, referrer);
}

export function insertBehaviorEvent(sessionId: string, eventType: string, details: any): void {
  const id = `beh_${nanoid(16)}`;
  const detailsStr = typeof details === 'string' ? details : JSON.stringify(details);
  db.prepare(`
    INSERT INTO behavior_events (id, session_id, event_type, details)
    VALUES (?, ?, ?, ?)
  `).run(id, sessionId, eventType, detailsStr);
}

export function getMetrics(): DashboardMetrics {
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

  const falsePositiveEstimate = powChallenges > 0 
    ? Math.round((powSolved / powChallenges) * 1000) / 10 
    : 0;

  const honeyMazeHits = (db.prepare('SELECT COUNT(*) as count FROM honey_maze_hits').get() as any)?.count || 0;
  const canaryInjected = (db.prepare('SELECT COUNT(*) as count FROM canary_tokens').get() as any)?.count || 0;
  const canaryExposed = (db.prepare('SELECT COUNT(*) as count FROM canary_tokens WHERE exposed = 1').get() as any)?.count || 0;
  const agentBeacons = (db.prepare('SELECT COUNT(*) as count FROM agent_beacons').get() as any)?.count || 0;
  const goodBotsVerified = (db.prepare('SELECT COUNT(*) as count FROM sessions WHERE is_good_bot = 1').get() as any)?.count || 0;

  return {
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
  };
}

export function getRecentEvents() {
  const recentRequests = db.prepare(`
    SELECT r.id, r.session_id, r.url, r.method, r.referrer, r.timestamp, s.ip_address, s.user_agent
    FROM request_events r
    JOIN sessions s ON r.session_id = s.id
    ORDER BY r.timestamp DESC
    LIMIT 30
  `).all() as any[];

  const recentRiskLogs = db.prepare(`
    SELECT r.id, r.session_id, r.score, r.reasons, r.confidence, r.timestamp, s.ip_address
    FROM risk_events r
    JOIN sessions s ON r.session_id = s.id
    ORDER BY r.timestamp DESC
    LIMIT 20
  `).all() as any[];

  const recentDefenses = db.prepare(`
    SELECT d.id, d.session_id, d.action, d.resolved, d.timestamp, s.ip_address
    FROM defense_actions d
    JOIN sessions s ON d.session_id = s.id
    ORDER BY d.timestamp DESC
    LIMIT 20
  `).all() as any[];

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

  const formattedRisk = recentRiskLogs.map(r => ({
    ...r,
    timestamp: formatTimestamp(r.timestamp),
    reasons: JSON.parse(r.reasons || '[]'),
  }));

  const defensesFormatted = recentDefenses.map(d => ({
    ...d,
    timestamp: formatTimestamp(d.timestamp),
  }));

  const alertsFormatted = [...mazeHits, ...canaryExposures, ...agentHits]
    .map(a => ({ ...a, timestamp: formatTimestamp(a.timestamp) }))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20);

  return {
    requests: requestsFormatted,
    riskEvaluations: formattedRisk,
    defenses: defensesFormatted,
    alerts: alertsFormatted,
  };
}

export function getSessionDetails(sessionId: string) {
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId) as any;
  if (!session) return null;

  const requests = db.prepare(`
    SELECT * FROM request_events
    WHERE session_id = ?
    ORDER BY timestamp ASC
  `).all(sessionId) as any[];

  const behaviors = db.prepare(`
    SELECT id, event_type, details, timestamp FROM behavior_events
    WHERE session_id = ?
    ORDER BY timestamp ASC
  `).all(sessionId) as any[];

  const behaviorsFormatted = behaviors.map(b => {
    try {
      return { ...b, details: JSON.parse(b.details) };
    } catch (e) {
      return b;
    }
  });

  const risks = db.prepare(`
    SELECT * FROM risk_events
    WHERE session_id = ?
    ORDER BY timestamp ASC
  `).all(sessionId) as any[];

  const risksFormatted = risks.map(r => ({
    ...r,
    reasons: JSON.parse(r.reasons || '[]'),
  }));

  const defenses = db.prepare(`
    SELECT * FROM defense_actions
    WHERE session_id = ?
    ORDER BY timestamp ASC
  `).all(sessionId) as any[];

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

  const graphAnalysis = analyzeGraphIntent(sessionId);

  const formatTimestamp = (t: string) => {
    if (!t) return t;
    if (t.endsWith('Z') || t.includes('T') || t.includes('+')) return t;
    return t.replace(' ', 'T') + 'Z';
  };

  return {
    session: {
      id: session.id,
      createdAt: formatTimestamp(session.created_at),
      userAgent: session.user_agent,
      ipAddress: session.ip_address,
      fingerprint: session.fingerprint,
      isGoodBot: session.is_good_bot === 1,
    },
    requests: requests.map(r => ({ ...r, timestamp: formatTimestamp(r.timestamp) })),
    behaviors: behaviorsFormatted.map(b => ({ ...b, timestamp: formatTimestamp(b.timestamp) })),
    risks: risksFormatted.map(r => ({ ...r, timestamp: formatTimestamp(r.timestamp) })),
    defenses: defenses.map(d => ({ ...d, timestamp: formatTimestamp(d.timestamp) })),
    traps: {
      mazeHits: mazeHits.map(h => ({ ...h, timestamp: formatTimestamp(h.timestamp) })),
      canaryExposures: canaryExposures.map(c => ({ ...c, timestamp: formatTimestamp(c.timestamp) })),
      agentBeacons: agentBeacons.map(a => ({ ...a, timestamp: formatTimestamp(a.timestamp) })),
    },
    graphAnalysis,
  };
}
