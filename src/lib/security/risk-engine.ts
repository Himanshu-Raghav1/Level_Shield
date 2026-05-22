import { RiskResult, RiskReason, DefenseAction } from '@/types/security';
import { db } from '../store/db';
import { logRiskResult, logDefenseAction } from '../store/sessionStore';
import { getSessionBehaviorEntropy } from './behavior-dna';
import { hasSessionHitHoneyMaze } from './honey-maze';
import { analyzeGraphIntent } from './graph-intent';
import { verifyFingerprintConsistency } from './fingerprint';
import { getActionForScore } from './policy';

/**
 * Calculates a unified risk score from 0 to 100 for a given session.
 * Enforces all 12 score rules and stores the resulting event.
 */
export function evaluateSessionRisk(
  sessionId: string,
  requestHeaders: Record<string, string>,
  currentUrl: string,
  currentMethod: string
): RiskResult {
  const reasons: RiskReason[] = [];
  let score = 0;

  // 1. Fetch session info
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId) as any;
  if (!session) {
    return {
      sessionId,
      score: 0,
      action: 'allow',
      reasons: [],
      confidence: 1.0,
    };
  }

  // A. Check Verified Good Bot (Special case: -40 score modifier)
  const isVerifiedGoodBot = session.is_good_bot === 1;

  // 2. Fetch recent request events to calculate request rate
  const now = Date.now();
  const tenSecondsAgo = new Date(now - 10000).toISOString();
  
  const recentRequestsCount = (db.prepare(`
    SELECT COUNT(*) as count FROM request_events
    WHERE session_id = ? AND timestamp > strftime('%Y-%m-%d %H:%M:%S', 'now', '-10 seconds')
  `).get(sessionId) as any)?.count || 0;

  // Signal: Rapid requests (+20)
  if (recentRequestsCount > 8) {
    score += 20;
    reasons.push('rapid_requests');
  }

  // B. Sequential compensation pages (+20) & Unusual navigation flow (+15)
  const graphAnalysis = analyzeGraphIntent(sessionId);
  if (graphAnalysis.linearity > 60) {
    score += 15;
    reasons.push('unusual_navigation');
  }
  if (graphAnalysis.sequentialCount >= 4) {
    score += 20;
    reasons.push('sequential_url_access');
  }

  // C. Suspicious User-Agent (+10)
  const ua = (requestHeaders['user-agent'] || '').toLowerCase();
  const isSuspiciousUa = 
    ua.includes('headless') || 
    ua.includes('playwright') || 
    ua.includes('puppeteer') || 
    ua.includes('selenium') || 
    ua.includes('axios') || 
    ua.includes('node-fetch') || 
    ua.includes('python-requests') || 
    ua.includes('scrape') ||
    (ua.includes('googlebot') && !isVerifiedGoodBot); // Fake googlebot is highly suspicious

  if (isSuspiciousUa) {
    score += 10;
    reasons.push('suspicious_user_agent');
  }

  // D. Missing Referrer (+8)
  const referrer = requestHeaders['referer'] || requestHeaders['referrer'] || '';
  // Deep navigation without referrer is highly suspicious for crawlers
  const isDeepCompensationLink = currentUrl.toLowerCase().includes('/company/') || currentUrl.toLowerCase().includes('/compensation');
  if (isDeepCompensationLink && !referrer && recentRequestsCount > 1) {
    score += 8;
    reasons.push('missing_referrer');
  }

  // E. Low Behavior Entropy (+15)
  const behaviorEntropy = getSessionBehaviorEntropy(sessionId);
  if (behaviorEntropy < 50) {
    score += 15;
    reasons.push('low_behavior_entropy');
  }

  // F. Bulk Salary Extraction (+20)
  const recentCompensationSearches = (db.prepare(`
    SELECT COUNT(*) as count FROM request_events
    WHERE session_id = ? AND url LIKE '%/api/compensation/search%' AND timestamp > strftime('%Y-%m-%d %H:%M:%S', 'now', '-10 seconds')
  `).get(sessionId) as any)?.count || 0;

  if (recentCompensationSearches > 4) {
    score += 20;
    reasons.push('compensation_bulk_access');
  }

  // G. Honey Link Clicked (+30)
  if (hasSessionHitHoneyMaze(sessionId)) {
    score += 30;
    reasons.push('honey_link_triggered');
  }

  // H. Canary Token Exposed (+40)
  const canaryExposedRow = db.prepare(`
    SELECT COUNT(*) as count FROM canary_tokens
    WHERE session_id = ? AND exposed = 1
  `).get(sessionId) as any;

  if (canaryExposedRow && canaryExposedRow.count > 0) {
    score += 40;
    reasons.push('canary_token_exposed');
  }

  // I. AI-Agent Trap Beacon (+35)
  const beaconTriggeredRow = db.prepare(`
    SELECT COUNT(*) as count FROM agent_beacons
    WHERE session_id = ?
  `).get(sessionId) as any;

  if (beaconTriggeredRow && beaconTriggeredRow.count > 0) {
    score += 35;
    reasons.push('agent_beacon_triggered');
  }

  // J. Fingerprint Mismatch (+15)
  const fpCheck = verifyFingerprintConsistency(sessionId, requestHeaders);
  if (!fpCheck.isConsistent) {
    score += 15;
    reasons.push('fingerprint_mismatch');
  }

  // K. Apply Verified Good Bot Modifier (-40)
  if (isVerifiedGoodBot) {
    score -= 40;
    reasons.push('verified_good_bot');
  }

  // Clamp final score between 0 and 100
  const finalScore = Math.max(0, Math.min(100, score));

  // Determine standard defense action for this score
  const recommendedAction = getActionForScore(finalScore);

  // Store the evaluation log
  logRiskResult(sessionId, finalScore, reasons, 0.95);
  logDefenseAction(sessionId, recommendedAction);

  return {
    sessionId,
    score: finalScore,
    action: recommendedAction,
    reasons,
    confidence: 0.95,
  };
}
