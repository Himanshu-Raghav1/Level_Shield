import { nanoid } from 'nanoid';
import { logHoneyMazeHit } from '../store/sessionStore';
import { db } from '../store/db';

export interface HoneyLinkInfo {
  token: string;
  url: string;
}

/**
 * Generates a hidden honey decoy link for a session
 */
export function generateHoneyLink(sessionId: string): HoneyLinkInfo {
  const token = `maze_${nanoid(10)}`;
  
  // Store the active honey link for this session
  db.prepare(`
    INSERT INTO canary_tokens (token, session_id, exposed)
    VALUES (?, ?, 0)
    ON CONFLICT(token) DO NOTHING
  `).run(token, sessionId);

  return {
    token,
    url: `/maze/${token}`,
  };
}

/**
 * Handles recording when a client hits the honey maze endpoint
 */
export function triggerHoneyMazeHit(sessionId: string, token: string): void {
  logHoneyMazeHit(sessionId, token);
  console.log(`[SECURITY ALERT] Session ${sessionId} fell into the Honey Maze trap via token ${token}!`);
}

/**
 * Verifies if a session has hit a honey maze link
 */
export function hasSessionHitHoneyMaze(sessionId: string): boolean {
  const row = db.prepare(`
    SELECT COUNT(*) as count FROM honey_maze_hits
    WHERE session_id = ?
  `).get(sessionId) as { count: number } | undefined;
  
  return row ? row.count > 0 : false;
}
