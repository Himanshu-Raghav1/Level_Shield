import { nanoid } from 'nanoid';
import { createCanaryToken, exposeCanaryToken } from '../store/sessionStore';

export interface CanarySalaryRow {
  id: string;
  company: string;
  title: string;
  totalComp: number;
  baseSalary: number;
  stockValue: number;
  bonus: number;
  yearsExperience: number;
  yearsAtCompany: number;
  location: string;
  isCanary: boolean;
}

/**
 * Injects a unique session-specific fake salary row into the results if the session is suspicious
 */
export function injectCanaryRowIfSuspicious(
  sessionId: string,
  rows: any[],
  riskScore: number
): any[] {
  // Only inject if risk is suspicious (score > 35)
  if (riskScore <= 35) {
    return rows;
  }

  // Generate a unique token
  const token = `canary_${nanoid(10)}`;
  createCanaryToken(token, sessionId);

  const fakeRow: CanarySalaryRow = {
    id: token,
    company: 'ShieldCanary Corp',
    title: 'Principal Bot Analyst',
    totalComp: 385000,
    baseSalary: 230000,
    stockValue: 115000,
    bonus: 40000,
    yearsExperience: 8,
    yearsAtCompany: 3,
    location: 'San Francisco, CA',
    isCanary: true,
  };

  // Insert in a random position, or at the end
  const copy = [...rows];
  const insertIndex = Math.floor(Math.random() * (copy.length + 1));
  copy.splice(insertIndex, 0, fakeRow);

  return copy;
}

/**
 * Handles detection when a canary token is retrieved or submitted by a scraper
 */
export function triggerCanaryExposure(token: string): string | null {
  const matchingSessionId = exposeCanaryToken(token);
  if (matchingSessionId) {
    console.log(`[SECURITY ALERT] Canary token ${token} was exposed by session ${matchingSessionId}!`);
    return matchingSessionId;
  }
  return null;
}
