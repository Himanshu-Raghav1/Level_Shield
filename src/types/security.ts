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

export interface RiskResult {
  sessionId: string;
  score: number;
  action: DefenseAction;
  reasons: RiskReason[];
  confidence: number;
}

export interface BehaviorTelemetry {
  mouseMoves: Array<{ x: number; y: number; t: number }>;
  scrolls: Array<{ y: number; t: number }>;
  clicks: Array<{ x: number; y: number; t: number }>;
  keycadence: Array<{ key: string; delay: number }>;
  pastes: number;
  focusBlurs: Array<{ type: "focus" | "blur"; t: number }>;
  chartHovers: number;
  timezone: string;
  screenSize: { width: number; height: number };
}

export interface SessionInfo {
  id: string;
  createdAt: string;
  userAgent: string;
  ipAddress: string;
  fingerprint: string;
  isGoodBot: boolean;
}

export interface RequestEvent {
  id: string;
  sessionId: string;
  url: string;
  method: string;
  referrer: string;
  timestamp: string;
}

export interface BehaviorEventLog {
  id: string;
  sessionId: string;
  eventType: string;
  details: string;
  timestamp: string;
}
