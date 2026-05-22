import { BehaviorTelemetry } from '@/types/security';
import { logBehavior } from '../store/sessionStore';
import { db } from '../store/db';

export interface BehaviorScore {
  entropy: number; // 0 to 100 (lower means more automated/bot-like)
  suspicious: boolean;
  reasons: string[];
}

export function evaluateBehaviorTelemetry(sessionId: string, data: BehaviorTelemetry): BehaviorScore {
  // Store telemetry raw log
  logBehavior(sessionId, 'telemetry_submission', data);

  const reasons: string[] = [];
  let score = 100;

  const {
    mouseMoves = [],
    scrolls = [],
    clicks = [],
    keycadence = [],
    pastes = 0,
    focusBlurs = [],
    chartHovers = 0,
  } = data;

  // 1. Mouse movement entropy
  if (mouseMoves.length === 0) {
    // No mouse movement is suspicious for desktop browsing
    score -= 30;
    reasons.push('zero_mouse_movement');
  } else if (mouseMoves.length >= 3) {
    // Check for straight lines or instant jumps
    let straightLines = true;
    let previousAngle: number | null = null;
    const angles: number[] = [];

    for (let i = 1; i < mouseMoves.length; i++) {
      const dx = mouseMoves[i].x - mouseMoves[i - 1].x;
      const dy = mouseMoves[i].y - mouseMoves[i - 1].y;
      
      if (dx === 0 && dy === 0) continue;

      const angle = Math.atan2(dy, dx);
      if (previousAngle !== null) {
        // If angle changes, it's not a single straight line
        const diff = Math.abs(angle - previousAngle);
        if (diff > 0.01 && diff < 2 * Math.PI - 0.01) {
          straightLines = false;
        }
      }
      previousAngle = angle;
      angles.push(angle);
    }

    // Check angle variance (randomness)
    if (straightLines && angles.length > 2) {
      score -= 40;
      reasons.push('perfectly_linear_mouse');
    } else if (angles.length > 2) {
      // Calculate angle variance
      const mean = angles.reduce((sum, val) => sum + val, 0) / angles.length;
      const variance = angles.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / angles.length;
      
      // Extremely low variance means robotic curves or straight segments
      if (variance < 0.02) {
        score -= 25;
        reasons.push('low_mouse_variance');
      }
    }
  }

  // 2. Typing Cadence & Pastes
  if (keycadence.length > 0) {
    const delays = keycadence.map(k => k.delay).filter(d => d > 0);
    
    if (delays.length >= 3) {
      // Calculate typing delay variance (standard deviation)
      const mean = delays.reduce((sum, val) => sum + val, 0) / delays.length;
      const variance = delays.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / delays.length;
      const stdDev = Math.sqrt(variance);

      // Perfectly uniform delays (e.g. setInterval of 100ms keydown) is a bot
      if (stdDev < 5) {
        score -= 30;
        reasons.push('perfectly_uniform_typing');
      }
    }

    // High paste-to-keystroke ratio
    const totalChars = keycadence.length;
    if (pastes > 0 && totalChars > 0 && pastes / totalChars > 0.8) {
      score -= 20;
      reasons.push('high_paste_ratio');
    }
  }

  // 3. Inactive or instant interaction (low dwell/scroll check)
  if (scrolls.length > 0 && scrolls.length < 2) {
    // If they scrolled exactly once in an instant fashion
    const instantScroll = scrolls.some(s => s.y > 500);
    if (instantScroll && mouseMoves.length < 2) {
      score -= 15;
      reasons.push('robotic_scroll_jump');
    }
  }

  // Ensure score stays in [0, 100] range
  const finalEntropy = Math.max(0, Math.min(100, score));

  return {
    entropy: finalEntropy,
    suspicious: finalEntropy < 50,
    reasons,
  };
}

/**
 * Gets the consolidated behavior entropy for a session based on all logged telemetry.
 */
export function getSessionBehaviorEntropy(sessionId: string): number {
  const events = db.prepare(`
    SELECT details FROM behavior_events
    WHERE session_id = ? AND event_type = 'telemetry_submission'
    ORDER BY timestamp DESC
  `).all(sessionId) as Array<{ details: string }>;

  if (events.length === 0) {
    // Check if the session has made requests and has a suspicious bot-like User Agent
    const requestCountRow = db.prepare(`
      SELECT COUNT(*) as count FROM request_events WHERE session_id = ?
    `).get(sessionId) as { count: number } | undefined;
    
    const requestCount = requestCountRow?.count || 0;
    
    if (requestCount > 0) {
      const sessionRow = db.prepare(`
        SELECT user_agent FROM sessions WHERE id = ?
      `).get(sessionId) as { user_agent: string } | undefined;
      
      const ua = (sessionRow?.user_agent || '').toLowerCase();
      const isBotUa = ua.includes('bot') || ua.includes('crawler') || ua.includes('headless') || ua.includes('python') || ua.includes('playwright');
      
      if (isBotUa || requestCount > 2) {
        return 0; // Return zero entropy for bot UAs or multi-request clients with no telemetry
      }
    }

    return 100; // Assume okay for initial page loads of humans
  }

  // Calculate average entropy from recent telemetry submissions
  let totalEntropy = 0;
  let count = 0;

  for (const ev of events) {
    try {
      const data = JSON.parse(ev.details) as BehaviorTelemetry;
      const evaluation = evaluateBehaviorTelemetry(sessionId, data);
      totalEntropy += evaluation.entropy;
      count++;
    } catch (e) {
      // Ignore parse errors
    }
  }

  return count > 0 ? totalEntropy / count : 100;
}
