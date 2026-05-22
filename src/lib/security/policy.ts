import { DefenseAction } from '@/types/security';
import { db } from '../store/db';

/**
 * Maps a risk score from 0 to 100 to the appropriate defense action
 */
export function getActionForScore(score: number): DefenseAction {
  if (score < 0) score = 0;
  if (score > 100) score = 100;

  if (score <= 35) {
    return 'allow';
  } else if (score <= 55) {
    return 'throttle';
  } else if (score <= 75) {
    return 'proof_of_work';
  } else if (score <= 90) {
    return 'honey_maze';
  } else {
    // Over 90 leads to block or tarpit. 
    // We can randomize or use tarpit for the highest level of annoyance (e.g. 96-100).
    return score >= 96 ? 'tarpit' : 'block';
  }
}

/**
 * Adaptive Friction Brain: Record previous action effectiveness and choose next action.
 * If previous action has been ignored or bypassed, escalate friction.
 */
export function chooseAdaptiveAction(sessionId: string, score: number): DefenseAction {
  let action = getActionForScore(score);
  if (action === 'allow') {
    return 'allow';
  }

  try {
    // Fetch previous actions within the last 60 seconds
    const previousActions = db.prepare(`
      SELECT action, resolved, COUNT(*) as count
      FROM defense_actions
      WHERE session_id = ? AND timestamp > strftime('%Y-%m-%d %H:%M:%S', 'now', '-60 seconds')
      GROUP BY action, resolved
    `).all(sessionId) as Array<{ action: string; resolved: number; count: number }>;

    const throttleCount = previousActions.find(a => a.action === 'throttle')?.count || 0;
    const powUnresolved = previousActions.find(a => a.action === 'proof_of_work' && a.resolved === 0)?.count || 0;
    const powResolved = previousActions.find(a => a.action === 'proof_of_work' && a.resolved === 1)?.count || 0;

    // Elevate friction based on effectiveness:
    if (action === 'throttle' && throttleCount > 3) {
      // Throttle was ineffective (bot continues spamming), elevate to proof_of_work
      action = 'proof_of_work';
    }

    if (action === 'proof_of_work' && powUnresolved > 2 && powResolved === 0) {
      // Ignoring PoW and continuing requests, elevate to honey_maze
      action = 'honey_maze';
    }

    if (action === 'honey_maze' && previousActions.some(a => a.action === 'honey_maze')) {
      // Repeatedly landing in the maze, escalate to complete block
      action = 'block';
    }
  } catch (error) {
    console.error('Error in chooseAdaptiveAction:', error);
  }

  return action;
}
