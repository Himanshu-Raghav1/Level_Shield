import crypto from 'crypto';
import { resolveDefenseAction } from '../store/sessionStore';

export interface PowChallenge {
  challenge: string;
  difficulty: number;
  expiry: number;
}

const DEFAULT_DIFFICULTY = 4; // Number of leading zero hex chars required (e.g., '0000...')
const CHALLENGE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

export function generateChallenge(sessionId: string, difficulty = DEFAULT_DIFFICULTY): PowChallenge {
  const rand = crypto.randomBytes(16).toString('hex');
  const expiry = Date.now() + CHALLENGE_EXPIRY_MS;
  // Format: "sessionId:expiry:rand"
  const challenge = `${sessionId}:${expiry}:${rand}`;
  return {
    challenge,
    difficulty,
    expiry,
  };
}

export function verifyChallenge(
  sessionId: string,
  challenge: string,
  nonce: string,
  difficulty = DEFAULT_DIFFICULTY
): boolean {
  try {
    const parts = challenge.split(':');
    if (parts.length !== 3) return false;

    const [chalSessionId, expiryStr, rand] = parts;
    
    // Ensure the challenge belongs to the correct session
    if (chalSessionId !== sessionId) return false;

    // Check expiry
    const expiry = parseInt(expiryStr, 10);
    if (Date.now() > expiry) return false;

    // Reconstruct string to hash
    const input = `${challenge}${nonce}`;
    const hash = crypto.createHash('sha256').update(input).digest('hex');

    // Check if the hash starts with '0' repeated <difficulty> times
    const prefix = '0'.repeat(difficulty);
    const isValid = hash.startsWith(prefix);

    if (isValid) {
      // Mark proof_of_work defense action as resolved for this session
      resolveDefenseAction(sessionId, 'proof_of_work');
    }

    return isValid;
  } catch (err) {
    console.error('PoW verification error:', err);
    return false;
  }
}
