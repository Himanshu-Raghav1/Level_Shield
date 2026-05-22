import crypto from 'crypto';
import { db } from '../store/sessionStore';
import { BehaviorTelemetry } from '@/types/security';

export interface FingerprintAnalysis {
  fingerprint: string;
  isConsistent: boolean;
  reasons: string[];
}

/**
 * Generates a JA4-style client fingerprint approximation based on HTTP headers
 */
export function generateJA4Fingerprint(headers: Record<string, string>): string {
  const ua = headers['user-agent'] || 'unknown';
  const lang = headers['accept-language'] || 'unknown';
  const accept = headers['accept'] || 'unknown';
  const platform = headers['sec-ch-ua-platform'] || 'unknown';
  const chUa = headers['sec-ch-ua'] || 'unknown';

  // Construct a raw fingerprint string
  const raw = `${ua}|${lang}|${accept}|${platform}|${chUa}`;
  return crypto.createHash('sha1').update(raw).digest('hex').substring(0, 16);
}

/**
 * Checks consistency between headers (User-Agent, sec-ch-ua) and client behavioral telemetry
 */
export function verifyFingerprintConsistency(
  sessionId: string,
  headers: Record<string, string>
): FingerprintAnalysis {
  const fingerprint = generateJA4Fingerprint(headers);
  const reasons: string[] = [];
  let isConsistent = true;

  // Retrieve latest submitted telemetry for this session
  const latestTelemetryRow = db.prepare(`
    SELECT details FROM behavior_events
    WHERE session_id = ? AND event_type = 'telemetry_submission'
    ORDER BY timestamp DESC LIMIT 1
  `).get(sessionId) as { details: string } | undefined;

  if (!latestTelemetryRow) {
    return { fingerprint, isConsistent, reasons }; // Not enough telemetry yet to prove mismatch
  }

  try {
    const telemetry = JSON.parse(latestTelemetryRow.details) as BehaviorTelemetry;
    const ua = (headers['user-agent'] || '').toLowerCase();
    const secChUaPlatform = (headers['sec-ch-ua-platform'] || '').replace(/"/g, '').toLowerCase();

    // 1. Check Platform Mismatch
    const userAgentPlatform = 
      ua.includes('macintosh') || ua.includes('mac os') ? 'macos' :
      ua.includes('windows') ? 'windows' :
      ua.includes('linux') ? 'linux' :
      ua.includes('android') ? 'android' :
      ua.includes('iphone') || ua.includes('ipad') ? 'ios' : 'unknown';

    // Check Sec-CH-UA-Platform consistency if present
    if (secChUaPlatform && secChUaPlatform !== 'unknown') {
      const match = 
        (secChUaPlatform === 'macos' && userAgentPlatform === 'macos') ||
        (secChUaPlatform === 'windows' && userAgentPlatform === 'windows') ||
        (secChUaPlatform === 'linux' && userAgentPlatform === 'linux') ||
        (secChUaPlatform === 'android' && userAgentPlatform === 'android') ||
        (secChUaPlatform === 'ios' && userAgentPlatform === 'ios');

      if (!match) {
        isConsistent = false;
        reasons.push('platform_ch_mismatch');
      }
    }

    // 2. Check Playwright Headless Browser Signs
    // Headless chrome often leaks 'HeadlessChrome' in User-Agent, but advanced ones don't.
    // Standard headless browser screen sizes are often exactly 800x600 default
    if (telemetry.screenSize) {
      const { width, height } = telemetry.screenSize;
      if (width === 800 && height === 600) {
        isConsistent = false;
        reasons.push('default_headless_resolution');
      }

      // Humans rarely have perfectly square 0x0 screen resolutions
      if (width === 0 || height === 0) {
        isConsistent = false;
        reasons.push('zero_screen_resolution');
      }
    }

    // 3. Timezone Consistency
    if (telemetry.timezone) {
      // E.g., check if timezone exists or matches standard format
      const tz = telemetry.timezone.toLowerCase();
      // If client says they are in Asia/Kolkata but languages say fr-FR only, it's a minor signal, but let's check basic formats.
      if (!tz.includes('/') && tz !== 'utc' && tz !== 'gmt') {
        isConsistent = false;
        reasons.push('malformed_timezone');
      }
    }

  } catch (err) {
    // Ignore parse errors
  }

  return {
    fingerprint,
    isConsistent,
    reasons,
  };
}
