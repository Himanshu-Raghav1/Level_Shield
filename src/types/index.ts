export type DefenseAction =
  | "allow"
  | "throttle"
  | "proof_of_work"
  | "honey_maze"
  | "block"
  | "tarpit"
  | "good_bot_allow";

export type RiskReason =
  | "rapid_requests"
  | "sequential_url_access"
  | "suspicious_user_agent"
  | "missing_referrer"
  | "unusual_navigation"
  | "low_behavior_entropy"
  | "compensation_bulk_access"
  | "honey_link_triggered"
  | "canary_token_exposed"
  | "agent_beacon_triggered"
  | "fingerprint_mismatch"
  | "verified_good_bot";

export type RiskResult = {
  sessionId: string;
  score: number;
  action: DefenseAction;
  reasons: RiskReason[];
  confidence: number;
  timestamp: string;
};

export type TrafficEvent = {
  id: string;
  sessionId: string;
  path: string;
  ip: string;
  userAgent: string;
  timestamp: string;
  actionTaken: DefenseAction;
};

export type CanaryToken = {
  tokenId: string;
  sessionId: string;
  exposedAt: string;
  company: string;
  fakeSalary: string;
};

export type HoneyMazeHit = {
  sessionId: string;
  mazePath: string;
  enteredAt: string;
};

export type DashboardMetrics = {
  totalRequests: number;
  botsDetected: number;
  blockedRequests: number;
  falsePositiveRate: string;
  throttledRequests: number;
  powChallenges: number;
  honeyMazeHits: number;
  realUsersProtected: number;
};
