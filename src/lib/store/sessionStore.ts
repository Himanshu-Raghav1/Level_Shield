import { db } from './db';
import { nanoid } from 'nanoid';
import { RiskReason, DefenseAction, RiskResult, SessionInfo } from '@/types/security';

export function getOrCreateSession(
  sessionId: string | undefined,
  userAgent: string,
  ipAddress: string,
  fingerprint: string
): SessionInfo {
  const id = sessionId || `sess_${nanoid(16)}`;

  // Try to fetch existing session
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

  // Create new session
  db.prepare(`
    INSERT INTO sessions (id, user_agent, ip_address, fingerprint, is_good_bot)
    VALUES (?, ?, ?, ?, 0)
  `).run(id, userAgent, ipAddress, fingerprint);

  const now = new Date().toISOString();
  return {
    id,
    createdAt: now,
    userAgent,
    ipAddress,
    fingerprint,
    isGoodBot: false,
  };
}

export function setSessionGoodBot(sessionId: string): void {
  db.prepare('UPDATE sessions SET is_good_bot = 1 WHERE id = ?').run(sessionId);
}

export function logRequest(sessionId: string, url: string, method: string, referrer: string): void {
  const id = `req_${nanoid(16)}`;
  db.prepare(`
    INSERT INTO request_events (id, session_id, url, method, referrer)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, sessionId, url, method, referrer);
}

export function logBehavior(sessionId: string, eventType: string, details: any): void {
  const id = `beh_${nanoid(16)}`;
  const detailsStr = typeof details === 'string' ? details : JSON.stringify(details);
  db.prepare(`
    INSERT INTO behavior_events (id, session_id, event_type, details)
    VALUES (?, ?, ?, ?)
  `).run(id, sessionId, eventType, detailsStr);
}

export function logRiskResult(sessionId: string, score: number, reasons: RiskReason[], confidence: number): void {
  const id = `risk_${nanoid(16)}`;
  const reasonsStr = JSON.stringify(reasons);
  db.prepare(`
    INSERT INTO risk_events (id, session_id, score, reasons, confidence)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, sessionId, score, reasonsStr, confidence);
}

export function getLatestRiskResult(sessionId: string): RiskResult | null {
  const row = db.prepare(`
    SELECT * FROM risk_events 
    WHERE session_id = ? 
    ORDER BY timestamp DESC LIMIT 1
  `).get(sessionId) as any;

  if (!row) return null;

  // Fetch corresponding latest action
  const actionRow = db.prepare(`
    SELECT action FROM defense_actions
    WHERE session_id = ?
    ORDER BY timestamp DESC LIMIT 1
  `).get(sessionId) as any;

  return {
    sessionId: row.session_id,
    score: row.score,
    action: actionRow ? (actionRow.action as DefenseAction) : 'allow',
    reasons: JSON.parse(row.reasons),
    confidence: row.confidence,
  };
}

export function logDefenseAction(sessionId: string, action: DefenseAction, resolved = 0): void {
  const id = `def_${nanoid(16)}`;
  db.prepare(`
    INSERT INTO defense_actions (id, session_id, action, resolved)
    VALUES (?, ?, ?, ?)
  `).run(id, sessionId, action, resolved);
}

export function resolveDefenseAction(sessionId: string, action: DefenseAction): void {
  db.prepare(`
    UPDATE defense_actions
    SET resolved = 1
    WHERE session_id = ? AND action = ?
  `).run(sessionId, action);
}

export function checkDefenseActionResolved(sessionId: string, action: DefenseAction): boolean {
  const row = db.prepare(`
    SELECT resolved FROM defense_actions
    WHERE session_id = ? AND action = ?
    ORDER BY timestamp DESC LIMIT 1
  `).get(sessionId) as any;
  return row ? row.resolved === 1 : false;
}

export function createCanaryToken(token: string, sessionId: string): void {
  db.prepare(`
    INSERT INTO canary_tokens (token, session_id, exposed)
    VALUES (?, ?, 0)
    ON CONFLICT(token) DO NOTHING
  `).run(token, sessionId);
}

export function exposeCanaryToken(token: string): string | null {
  const row = db.prepare('SELECT session_id FROM canary_tokens WHERE token = ?').get(token) as any;
  if (row) {
    db.prepare('UPDATE canary_tokens SET exposed = 1 WHERE token = ?').run(token);
    return row.session_id;
  }
  return null;
}

export function logHoneyMazeHit(sessionId: string, token: string): void {
  const id = `maze_${nanoid(16)}`;
  db.prepare(`
    INSERT INTO honey_maze_hits (id, session_id, token)
    VALUES (?, ?, ?)
  `).run(id, sessionId, token);
}

export function logAgentBeacon(sessionId: string, token: string): void {
  const id = `beacon_${nanoid(16)}`;
  db.prepare(`
    INSERT INTO agent_beacons (id, session_id, token)
    VALUES (?, ?, ?)
  `).run(id, sessionId, token);
}
