import { DefenseAction } from '@/types/security';

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
