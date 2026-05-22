import crypto from 'crypto';
import { db } from '../store/db';
import { setSessionGoodBot } from '../store/sessionStore';

const APPROVED_BOT_IDS = ['levels-demo-crawler', 'googlebot-verified'];
const GOOD_BOT_SECRET = process.env.GOOD_BOT_SECRET || 'hackathon-secret-key-12345';
const TIMESTAMP_WINDOW_MS = 5 * 60 * 1000; // 5 minutes window

// Initialize used nonces table
db.exec(`
  CREATE TABLE IF NOT EXISTS used_nonces (
    nonce TEXT PRIMARY KEY,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

export interface GoodBotResult {
  isValid: boolean;
  reason?: string;
}

/**
 * Signs a request payload for good-bot simulator.
 */
export function generateGoodBotSignature(
  method: string,
  path: string,
  timestamp: string,
  nonce: string,
  body = ''
): string {
  const bodyHash = crypto.createHash('sha256').update(body).digest('hex');
  const payload = `${method.toUpperCase()}\n${path}\n${timestamp}\n${nonce}\n${bodyHash}`;
  
  return crypto
    .createHmac('sha256', GOOD_BOT_SECRET)
    .update(payload)
    .digest('hex');
}

/**
 * Verifies good bot HMAC signatures and checks replay protections
 */
export function verifyGoodBotSignature(
  headers: Record<string, string>,
  method: string,
  path: string,
  body = ''
): GoodBotResult {
  const botId = headers['x-shield-bot-id'];
  const timestampStr = headers['x-shield-timestamp'];
  const nonce = headers['x-shield-nonce'];
  const signature = headers['x-shield-signature'];

  if (!botId || !timestampStr || !nonce || !signature) {
    return { isValid: false, reason: 'missing_headers' };
  }

  // 1. Approved Bot ID check
  if (!APPROVED_BOT_IDS.includes(botId)) {
    return { isValid: false, reason: 'unapproved_bot_id' };
  }

  // 2. Timestamp validation (within 5 minutes)
  const timestamp = parseInt(timestampStr, 10) * 1000; // convert to ms
  const now = Date.now();
  if (Math.abs(now - timestamp) > TIMESTAMP_WINDOW_MS) {
    return { isValid: false, reason: 'expired_timestamp' };
  }

  // 3. Nonce reuse prevention (replay protection)
  try {
    db.prepare('INSERT INTO used_nonces (nonce) VALUES (?)').run(nonce);
  } catch (err: any) {
    if (err.code === 'SQLITE_CONSTRAINT_PRIMARYKEY' || err.message?.includes('UNIQUE')) {
      return { isValid: false, reason: 'nonce_reused' };
    }
    console.error('Error recording nonce:', err);
    return { isValid: false, reason: 'database_error' };
  }

  // 4. HMAC Signature check using timingSafeEqual
  const bodyHash = crypto.createHash('sha256').update(body).digest('hex');
  const expectedPayload = `${method.toUpperCase()}\n${path}\n${timestampStr}\n${nonce}\n${bodyHash}`;
  
  const expectedSignature = crypto
    .createHmac('sha256', GOOD_BOT_SECRET)
    .update(expectedPayload)
    .digest('hex');

  const sigBuffer = Buffer.from(signature, 'hex');
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');

  if (sigBuffer.length !== expectedBuffer.length) {
    return { isValid: false, reason: 'signature_mismatch' };
  }

  const matches = crypto.timingSafeEqual(sigBuffer, expectedBuffer);

  if (!matches) {
    return { isValid: false, reason: 'signature_mismatch' };
  }

  return { isValid: true };
}
