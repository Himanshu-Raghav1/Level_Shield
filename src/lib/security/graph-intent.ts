import { db } from '../store/db';

export interface GraphAnalysis {
  linearity: number; // 0 to 100 (higher means highly sequential/scraper-like)
  sequentialCount: number;
  reasons: string[];
}

/**
 * Analyzes navigation path sequences and request timing to assess automation intent
 */
export function analyzeGraphIntent(sessionId: string): GraphAnalysis {
  const reasons: string[] = [];
  
  // Fetch up to 15 recent page-view request events for the session
  const requests = db.prepare(`
    SELECT url, timestamp FROM request_events
    WHERE session_id = ? AND url NOT LIKE '%/api/%'
    ORDER BY timestamp DESC LIMIT 15
  `).all(sessionId) as Array<{ url: string; timestamp: string }>;

  if (requests.length < 3) {
    return { linearity: 0, sequentialCount: 0, reasons };
  }

  // Reverse to chronological order for transition analysis
  const pathChronological = [...requests].reverse();
  
  let companyHits = 0;
  let searchHits = 0;
  let sequentialCompanyCount = 0;
  let maxSequentialCompany = 0;
  const intervals: number[] = [];

  for (let i = 0; i < pathChronological.length; i++) {
    const url = pathChronological[i].url.toLowerCase();
    
    // Track intervals between requests
    if (i > 0) {
      const t1 = new Date(pathChronological[i - 1].timestamp).getTime();
      const t2 = new Date(pathChronological[i].timestamp).getTime();
      intervals.push(t2 - t1);
    }

    if (url.includes('/company/')) {
      companyHits++;
      sequentialCompanyCount++;
      maxSequentialCompany = Math.max(maxSequentialCompany, sequentialCompanyCount);
    } else {
      if (url.includes('/compensation') || url === '/' || url.includes('/compare')) {
        searchHits++;
      }
      sequentialCompanyCount = 0; // Break sequential company streak
    }
  }

  // Calculate standard deviation of request intervals (timing cadence)
  let timingIsPerfect = false;
  if (intervals.length >= 3) {
    const mean = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
    const variance = intervals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);

    // Timing with less than 200ms variance indicates exact timer polling (bot)
    if (stdDev < 200 && mean < 5000) {
      timingIsPerfect = true;
      reasons.push('robotic_request_intervals');
    }
  }

  // Calculate linearity score
  // High linear sequence = lots of consecutive company page visits without searches/filters
  let linearity = 0;
  
  if (maxSequentialCompany >= 3) {
    linearity += 30;
  }
  if (maxSequentialCompany >= 5) {
    linearity += 40;
    reasons.push('highly_sequential_company_access');
  }

  // If there are no search pages or home pages at all, but many company pages
  if (companyHits > 0 && searchHits === 0) {
    linearity += 20;
    reasons.push('direct_sequential_extraction');
  }

  if (timingIsPerfect) {
    linearity += 20;
  }

  const finalLinearity = Math.max(0, Math.min(100, linearity));

  return {
    linearity: finalLinearity,
    sequentialCount: maxSequentialCompany,
    reasons,
  };
}
