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

// MOCK DATA

export const mockDashboardMetrics = {
  totalRequests: 15420,
  botsDetected: 3412,
  blockedRequests: 2150,
  falsePositiveRate: "0.2%",
  throttledRequests: 1205,
  powChallenges: 852,
  honeyMazeHits: 340,
  realUsersProtected: 9815,
};

export const mockTrafficEvents: TrafficEvent[] = [
  { id: "evt_1", sessionId: "sess_xyz1", path: "/", ip: "192.168.1.1", userAgent: "Mozilla/5.0", timestamp: new Date(Date.now() - 5000).toISOString(), actionTaken: "allow" },
  { id: "evt_2", sessionId: "sess_bot2", path: "/company/google", ip: "45.22.11.9", userAgent: "python-requests/2.26.0", timestamp: new Date(Date.now() - 4000).toISOString(), actionTaken: "block" },
  { id: "evt_3", sessionId: "sess_bot3", path: "/compensation", ip: "104.28.1.1", userAgent: "Mozilla/5.0 (HeadlessChrome)", timestamp: new Date(Date.now() - 2000).toISOString(), actionTaken: "proof_of_work" },
  { id: "evt_4", sessionId: "sess_agent4", path: "/maze/token123", ip: "198.51.100.4", userAgent: "Mozilla/5.0", timestamp: new Date(Date.now() - 1000).toISOString(), actionTaken: "honey_maze" },
];

export const mockRiskResults: RiskResult[] = [
  { sessionId: "sess_bot2", score: 95, action: "block", reasons: ["rapid_requests", "suspicious_user_agent"], confidence: 0.99, timestamp: new Date().toISOString() },
  { sessionId: "sess_bot3", score: 65, action: "proof_of_work", reasons: ["low_behavior_entropy"], confidence: 0.85, timestamp: new Date().toISOString() },
  { sessionId: "sess_agent4", score: 85, action: "honey_maze", reasons: ["honey_link_triggered"], confidence: 0.95, timestamp: new Date().toISOString() },
  { sessionId: "sess_xyz1", score: 10, action: "allow", reasons: [], confidence: 0.99, timestamp: new Date().toISOString() },
];

export const mockRiskScores = mockRiskResults;

export const mockRiskTimeline = [
  { time: new Date(Date.now() - 30000).toISOString(), human: 12, scraper: 5, playwright: 0 },
  { time: new Date(Date.now() - 25000).toISOString(), human: 15, scraper: 8, playwright: 0 },
  { time: new Date(Date.now() - 20000).toISOString(), human: 14, scraper: 20, playwright: 0 },
  { time: new Date(Date.now() - 15000).toISOString(), human: 18, scraper: 45, playwright: 12 },
  { time: new Date(Date.now() - 10000).toISOString(), human: 22, scraper: 85, playwright: 40 },
  { time: new Date(Date.now() - 5000).toISOString(), human: 19, scraper: 95, playwright: 80 },
  { time: new Date().toISOString(), human: 15, scraper: 98, playwright: 95 },
];

export const mockCanaryTokens = [
  { tokenId: "canary_row_992", sessionId: "sess_bot2", exposedAt: new Date(Date.now() - 3600000).toISOString(), company: "Meta", fakeSalary: "$420,000" },
  { tokenId: "canary_row_115", sessionId: "sess_bot5", exposedAt: new Date(Date.now() - 7200000).toISOString(), company: "Amazon", fakeSalary: "$315,000" },
];

export const mockHoneyMazeHits = [
  { sessionId: "sess_agent4", mazePath: "/maze/token123", enteredAt: new Date(Date.now() - 1000).toISOString() },
];

export function getRiskColor(score: number): string {
  if (score <= 35) return "var(--muted)";
  if (score <= 75) return "var(--foreground)";
  return "var(--accent)";
}

export function formatTimeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${Math.max(1, seconds)}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export function getActionBadgeClass(action: DefenseAction): string {
  switch (action) {
    case "allow":
      return "badge badge-allow";
    case "block":
      return "badge badge-block";
    case "throttle":
      return "badge badge-throttle";
    case "proof_of_work":
      return "badge badge-pow";
    case "honey_maze":
      return "badge badge-maze";
    case "tarpit":
      return "badge badge-tarpit";
    case "good_bot_allow":
      return "badge badge-good";
    default:
      return "badge";
  }
}

export function getActionLabel(action: DefenseAction): string {
  switch (action) {
    case "allow":
      return "allow";
    case "block":
      return "block";
    case "throttle":
      return "throttle";
    case "proof_of_work":
      return "PoW Challenge";
    case "honey_maze":
      return "Honey Maze";
    case "tarpit":
      return "tarpit";
    case "good_bot_allow":
      return "Good Bot";
    default:
      return action;
  }
}

export type SalaryRecord = {
  id: string;
  company: string;
  level: string;
  title: string;
  base: string;
  stock: string;
  bonus: string;
  totalComp: string;
  location: string;
  experience: string;
  isCanary?: boolean;
};

export const mockSalaries: SalaryRecord[] = [
  { id: "sal_1", company: "Google", level: "L3", title: "Software Engineer", base: "$142,000", stock: "$35,000", bonus: "$18,000", totalComp: "$195,000", location: "Mountain View, CA", experience: "1 yr" },
  { id: "sal_2", company: "Google", level: "L4", title: "Software Engineer II", base: "$175,000", stock: "$55,000", bonus: "$25,000", totalComp: "$255,000", location: "New York, NY", experience: "3 yrs" },
  { id: "sal_3", company: "Google", level: "L5", title: "Senior Software Engineer", base: "$210,000", stock: "$110,000", bonus: "$40,000", totalComp: "$360,000", location: "Mountain View, CA", experience: "6 yrs" },
  { id: "sal_4", company: "Meta", level: "IC3", title: "Software Engineer", base: "$138,000", stock: "$45,000", bonus: "$15,000", totalComp: "$198,000", location: "Menlo Park, CA", experience: "0 yrs" },
  { id: "sal_5", company: "Meta", level: "IC4", title: "Software Engineer II", base: "$168,000", stock: "$72,000", bonus: "$22,000", totalComp: "$262,000", location: "Seattle, WA", experience: "2 yrs" },
  { id: "sal_6", company: "Meta", level: "IC5", title: "Senior Software Engineer", base: "$205,000", stock: "$140,000", bonus: "$35,000", totalComp: "$380,000", location: "Menlo Park, CA", experience: "5 yrs" },
  { id: "sal_7", company: "Apple", level: "ICT3", title: "Software Engineer", base: "$145,000", stock: "$40,000", bonus: "$15,000", totalComp: "$200,000", location: "Cupertino, CA", experience: "2 yrs" },
  { id: "sal_8", company: "Apple", level: "ICT4", title: "Software Engineer II", base: "$182,000", stock: "$65,000", bonus: "$28,000", totalComp: "$275,000", location: "Austin, TX", experience: "4 yrs" },
  { id: "sal_9", company: "Stripe", level: "L2", title: "Software Engineer", base: "$155,000", stock: "$50,000", bonus: "$20,000", totalComp: "$225,000", location: "San Francisco, CA", experience: "1 yr" },
  { id: "sal_10", company: "Netflix", level: "Senior", title: "Senior Software Engineer", base: "$450,000", stock: "$0", bonus: "$0", totalComp: "$450,000", location: "Los Gatos, CA", experience: "7 yrs" }
];
