import useSWR, { mutate } from "swr";
import {
  mockDashboardMetrics,
  mockTrafficEvents,
  mockRiskResults,
  mockCanaryTokens,
  mockHoneyMazeHits,
  mockRiskTimeline
} from "@/data/mock";
import { DashboardMetrics, TrafficEvent, RiskResult, CanaryToken, HoneyMazeHit } from "@/types";

type BackendMetricsResponse = {
  summary?: {
    totalRequests?: number;
    totalSessions?: number;
    botRequests?: number;
    blockedRequests?: number;
    throttledRequests?: number;
    powChallenges?: number;
    falsePositiveEstimate?: number;
    honeyMazeHits?: number;
  };
  topSuspicious?: Array<{
    id: string;
    score?: number;
    reasons?: string[];
  }>;
  timelines?: {
    risk?: any[];
    defense?: any[];
  };
};

type BackendEventsResponse = {
  requests?: Array<{
    id: string;
    session_id: string;
    url: string;
    timestamp: string;
    ip_address?: string;
    user_agent?: string;
  }>;
  riskEvaluations?: Array<{
    session_id: string;
    score: number;
    reasons?: string[];
    confidence?: number;
    timestamp: string;
  }>;
  defenses?: Array<{
    session_id: string;
    action: TrafficEvent["actionTaken"];
  }>;
  alerts?: Array<{
    session_id: string;
    token?: string;
    timestamp: string;
    type: "honey_maze" | "canary_token" | "agent_beacon";
  }>;
};

// Helper to safely read from localStorage
const safeGetItem = (key: string, fallback: any) => {
  if (typeof window === "undefined") return fallback;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
};

// Helper to safely write to localStorage
const safeSetItem = (key: string, value: any) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {}
};

// Keep a local mutable copy of mock data for dynamic UI ticking in mock mode
let localMetrics: DashboardMetrics = safeGetItem("ls_metrics", {
  totalRequests: 0,
  botsDetected: 0,
  blockedRequests: 0,
  falsePositiveRate: "0%",
  throttledRequests: 0,
  powChallenges: 0,
  honeyMazeHits: 0,
  realUsersProtected: 0,
});
let localEvents: TrafficEvent[] = safeGetItem("ls_events", []);
let localRiskResults: RiskResult[] = safeGetItem("ls_risk_results", []);
let localCanaryTokens: CanaryToken[] = safeGetItem("ls_canary_tokens", []);
let localHoneyMazeHits: HoneyMazeHit[] = safeGetItem("ls_honey_maze_hits", []);
let localRiskTimeline: any[] = safeGetItem("ls_risk_timeline", []);

let lastTickTime = Date.now();

// Updates local mock metrics and events on each SWR poll when backend is unavailable
function tickMockData() {
  const now = Date.now();
  const elapsed = now - lastTickTime;
  if (elapsed < 1500) return; // limit ticking rate
  lastTickTime = now;

  // Add 1 to 3 regular requests
  const newRequests = Math.floor(Math.random() * 3) + 1;
  localMetrics.totalRequests += newRequests;
  localMetrics.realUsersProtected += newRequests;

  // 15% chance of a minor background bot request
  if (Math.random() < 0.15) {
    localMetrics.totalRequests += 1;
    localMetrics.botsDetected += 1;

    const paths = ["/compensation", "/company/google", "/company/apple", "/compare"];
    const randomPath = paths[Math.floor(Math.random() * paths.length)];
    const randomSessionId = `sess_bot_${Math.random().toString(36).substring(2, 7)}`;
    const randomIp = `185.220.101.${Math.floor(Math.random() * 255)}`;

    // Add event
    const newEvent: TrafficEvent = {
      id: `evt_${Date.now()}`,
      sessionId: randomSessionId,
      path: randomPath,
      ip: randomIp,
      userAgent: "python-requests/2.31.0",
      timestamp: new Date().toISOString(),
      actionTaken: "throttle",
    };
    localEvents = [newEvent, ...localEvents].slice(0, 30);

    // Update risk score results
    const newRisk: RiskResult = {
      sessionId: randomSessionId,
      score: 45,
      action: "throttle",
      reasons: ["rapid_requests"],
      confidence: 0.85,
      timestamp: new Date().toISOString(),
    };
    localRiskResults = [newRisk, ...localRiskResults].slice(0, 30);
    localMetrics.throttledRequests += 1;
  }
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API returned ${res.status}`);
  }
  return res.json();
};

function normalizeMetrics(data: DashboardMetrics | BackendMetricsResponse): DashboardMetrics {
  if ("summary" in data && data.summary) {
    const summary = data.summary;
    const totalRequests = summary.totalRequests ?? 0;
    const botsDetected = summary.botRequests ?? 0;

    return {
      totalRequests,
      botsDetected,
      blockedRequests: summary.blockedRequests ?? 0,
      falsePositiveRate: `${summary.falsePositiveEstimate ?? 0}%`,
      throttledRequests: summary.throttledRequests ?? 0,
      powChallenges: summary.powChallenges ?? 0,
      honeyMazeHits: summary.honeyMazeHits ?? 0,
      realUsersProtected: Math.max(0, (summary.totalSessions ?? 0) - botsDetected),
    };
  }

  return data as DashboardMetrics;
}

function normalizeEvents(data: TrafficEvent[] | BackendEventsResponse): TrafficEvent[] {
  if (Array.isArray(data)) return data;

  const defenses = new Map(
    [...(data.defenses ?? [])].reverse().map((defense) => [defense.session_id, defense.action]),
  );

  return (data.requests ?? []).map((request) => ({
    id: request.id,
    sessionId: request.session_id,
    path: request.url,
    ip: request.ip_address ?? "unknown",
    userAgent: request.user_agent ?? "unknown",
    timestamp: request.timestamp,
    actionTaken: defenses.get(request.session_id) ?? "allow",
  }));
}

function normalizeRiskResults(data: RiskResult[] | BackendMetricsResponse): RiskResult[] {
  if (Array.isArray(data)) return data;

  return (data.topSuspicious ?? []).map((session) => ({
    sessionId: session.id,
    score: session.score ?? 0,
    action: (session as any).action ?? ((session.score ?? 0) >= 91 ? "block" : (session.score ?? 0) >= 76 ? "honey_maze" : "proof_of_work"),
    reasons: (session.reasons ?? []) as RiskResult["reasons"],
    confidence: 0.9,
    timestamp: new Date().toISOString(),
  }));
}

function normalizeCanaryTokens(data: CanaryToken[] | BackendEventsResponse): CanaryToken[] {
  if (Array.isArray(data)) return data;

  const tokens = (data.alerts ?? []).filter((alert) => alert.type === "canary_token");

  return tokens.map((alert) => ({
    tokenId: alert.token ?? "canary_unknown",
    sessionId: alert.session_id,
    exposedAt: alert.timestamp,
    company: "Synthetic Canary Row",
    fakeSalary: "$999,999",
  }));
}

function normalizeHoneyMazeHits(data: HoneyMazeHit[] | BackendEventsResponse): HoneyMazeHit[] {
  if (Array.isArray(data)) return data;

  const hits = (data.alerts ?? []).filter((alert) => alert.type === "honey_maze");

  return hits.map((alert) => ({
    sessionId: alert.session_id,
    mazePath: `/maze/${alert.token ?? "unknown"}`,
    enteredAt: alert.timestamp,
  }));
}

// Hook: get dashboard metrics
export function useDashboardMetrics() {
  const { data, error, mutate } = useSWR<any>("/api/metrics", fetcher, {
    refreshInterval: 1500,
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  if (error || !data) {
    return {
      metrics: localMetrics,
      riskTimeline: localRiskTimeline,
      isLoading: false,
      isError: !!error,
      mutate,
    };
  }

  // Update our local sync copy so we don't jump stats if backend goes offline
  const parsed = normalizeMetrics(data);
  if (parsed.totalRequests >= localMetrics.totalRequests || localMetrics.totalRequests === 0) {
    localMetrics = parsed;
    safeSetItem("ls_metrics", localMetrics);
  }

  if ("timelines" in data && data.timelines && data.timelines.risk) {
    const riskTimeline = data.timelines.risk;
    if (riskTimeline.length >= localRiskTimeline.length || localRiskTimeline.length === 0) {
      localRiskTimeline = riskTimeline;
      safeSetItem("ls_risk_timeline", localRiskTimeline);
    }
  }

  return {
    metrics: localMetrics,
    riskTimeline: localRiskTimeline,
    isLoading: false,
    isError: false,
    mutate,
  };
}

// Hook: get live traffic events
export function useTrafficEvents() {
  const { data, error, mutate } = useSWR<TrafficEvent[] | BackendEventsResponse>("/api/events", fetcher, {
    refreshInterval: 1500,
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  if (error || !data) {
    return {
      events: localEvents,
      isLoading: false,
      isError: !!error,
      mutate,
    };
  }

  const parsedEvents = normalizeEvents(data);
  if (parsedEvents.length >= localEvents.length || localEvents.length === 0) {
    localEvents = parsedEvents;
    safeSetItem("ls_events", localEvents);
  }

  return {
    events: localEvents,
    isLoading: false,
    isError: false,
    mutate,
  };
}

// Hook: get risk results / sessions
export function useRiskResults() {
  const { data, error, mutate } = useSWR<RiskResult[] | BackendMetricsResponse>("/api/metrics", fetcher, {
    refreshInterval: 2000,
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  if (error || !data) {
    return {
      riskResults: localRiskResults,
      isLoading: false,
      isError: !!error,
      mutate,
    };
  }

  const parsedRisk = normalizeRiskResults(data);
  if (parsedRisk.length >= localRiskResults.length || localRiskResults.length === 0) {
    localRiskResults = parsedRisk;
    safeSetItem("ls_risk_results", localRiskResults);
  }

  return {
    riskResults: localRiskResults,
    isLoading: false,
    isError: false,
    mutate,
  };
}

// Hook: get canary tokens
export function useCanaryTokens() {
  const { data, error, mutate } = useSWR<CanaryToken[] | BackendEventsResponse>("/api/events", fetcher, {
    refreshInterval: 3000,
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  if (error || !data) {
    return {
      canaryTokens: localCanaryTokens,
      isLoading: false,
      isError: !!error,
      mutate,
    };
  }

  const parsedCanary = normalizeCanaryTokens(data);
  if (parsedCanary.length >= localCanaryTokens.length || localCanaryTokens.length === 0) {
    localCanaryTokens = parsedCanary;
    safeSetItem("ls_canary_tokens", localCanaryTokens);
  }

  return {
    canaryTokens: localCanaryTokens,
    isLoading: false,
    isError: false,
    mutate,
  };
}

// Hook: get honey maze hits
export function useHoneyMazeHits() {
  const { data, error, mutate } = useSWR<HoneyMazeHit[] | BackendEventsResponse>("/api/events", fetcher, {
    refreshInterval: 3000,
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  if (error || !data) {
    return {
      honeyMazeHits: localHoneyMazeHits,
      isLoading: false,
      isError: !!error,
      mutate,
    };
  }

  const parsedMaze = normalizeHoneyMazeHits(data);
  if (parsedMaze.length >= localHoneyMazeHits.length || localHoneyMazeHits.length === 0) {
    localHoneyMazeHits = parsedMaze;
    safeSetItem("ls_honey_maze_hits", localHoneyMazeHits);
  }

  return {
    honeyMazeHits: localHoneyMazeHits,
    isLoading: false,
    isError: false,
    mutate,
  };
}

// Reset client simulator data
export async function resetLocalSimulatorData() {
  try {
    await fetch("/api/simulate/reset", { method: "POST" });
  } catch (err) {
    console.error("Failed to reset backend database:", err);
  }
  localMetrics = {
    totalRequests: 0,
    botsDetected: 0,
    blockedRequests: 0,
    falsePositiveRate: "0%",
    throttledRequests: 0,
    powChallenges: 0,
    honeyMazeHits: 0,
    realUsersProtected: 0,
  };
  localEvents = [];
  localRiskResults = [];
  localCanaryTokens = [];
  localHoneyMazeHits = [];
  localRiskTimeline = [];

  if (typeof window !== "undefined") {
    window.localStorage.removeItem("ls_metrics");
    window.localStorage.removeItem("ls_events");
    window.localStorage.removeItem("ls_risk_results");
    window.localStorage.removeItem("ls_canary_tokens");
    window.localStorage.removeItem("ls_honey_maze_hits");
    window.localStorage.removeItem("ls_risk_timeline");
  }

  // Instantly clear the UI cache by mutating SWR states directly to zero
  mutate("/api/metrics", {
    summary: {
      totalRequests: 0,
      totalSessions: 0,
      botRequests: 0,
      blockedRequests: 0,
      throttledRequests: 0,
      powChallenges: 0,
      falsePositiveEstimate: 0,
      honeyMazeHits: 0,
    },
    topSuspicious: [],
    timelines: {
      risk: [],
      defense: [],
    }
  }, false);

  mutate("/api/events", {
    requests: [],
    riskEvaluations: [],
    defenses: [],
    alerts: [],
  }, false);
}

// Handles mock local simulation flows for testing and presentation fallback
export async function runSimulation(type: string): Promise<boolean> {
  // 1. Try real simulator API
  try {
    const res = await fetch(`/api/simulate/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) return true;
  } catch (err) {
    console.warn("Real simulation API failed or route doesn't exist yet. Running local mock simulation.", err);
  }

  // 2. Perform dynamic mock simulation locally
  const timestamp = new Date().toISOString();
  const simSessionId = `sess_sim_${type}_${Math.random().toString(36).substring(2, 6)}`;

  switch (type) {
    case "normal-user": {
      // Normal user: Low risk, accesses home & compensation, allowed
      localMetrics.totalRequests += 4;
      localMetrics.realUsersProtected += 4;
      
      const newEvts: TrafficEvent[] = [
        { id: `evt_sim_${Date.now()}_1`, sessionId: simSessionId, path: "/", ip: "98.137.11.20", userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", timestamp, actionTaken: "allow" },
        { id: `evt_sim_${Date.now()}_2`, sessionId: simSessionId, path: "/compensation", ip: "98.137.11.20", userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", timestamp, actionTaken: "allow" }
      ];
      localEvents = [...newEvts, ...localEvents];
      
      const newRisk: RiskResult = {
        sessionId: simSessionId,
        score: 12,
        action: "allow",
        reasons: [],
        confidence: 0.98,
        timestamp,
      };
      localRiskResults = [newRisk, ...localRiskResults];
      break;
    }

    case "power-user": {
      // Power user: access several companies rapidly, light throttle
      localMetrics.totalRequests += 12;
      localMetrics.botsDetected += 1;
      localMetrics.throttledRequests += 3;
      localMetrics.realUsersProtected += 9;

      const newEvts: TrafficEvent[] = [
        { id: `evt_sim_${Date.now()}_1`, sessionId: simSessionId, path: "/company/google", ip: "172.56.21.89", userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", timestamp, actionTaken: "throttle" },
        { id: `evt_sim_${Date.now()}_2`, sessionId: simSessionId, path: "/company/meta", ip: "172.56.21.89", userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", timestamp, actionTaken: "allow" },
        { id: `evt_sim_${Date.now()}_3`, sessionId: simSessionId, path: "/company/netflix", ip: "172.56.21.89", userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", timestamp, actionTaken: "allow" }
      ];
      localEvents = [...newEvts, ...localEvents];

      const newRisk: RiskResult = {
        sessionId: simSessionId,
        score: 42,
        action: "throttle",
        reasons: ["rapid_requests", "compensation_bulk_access"],
        confidence: 0.88,
        timestamp,
      };
      localRiskResults = [newRisk, ...localRiskResults];
      break;
    }

    case "request-scraper": {
      // Simple request scraper: Curl/Python script fetching bulk APIs, gets rate limited / challenged
      localMetrics.totalRequests += 85;
      localMetrics.botsDetected += 1;
      localMetrics.powChallenges += 85;

      const newEvts: TrafficEvent[] = [
        { id: `evt_sim_${Date.now()}_1`, sessionId: simSessionId, path: "/api/compensation/search", ip: "193.106.191.12", userAgent: "python-requests/2.28.1", timestamp, actionTaken: "proof_of_work" }
      ];
      localEvents = [...newEvts, ...localEvents];

      const newRisk: RiskResult = {
        sessionId: simSessionId,
        score: 72,
        action: "proof_of_work",
        reasons: ["rapid_requests", "suspicious_user_agent", "missing_referrer"],
        confidence: 0.95,
        timestamp,
      };
      localRiskResults = [newRisk, ...localRiskResults];
      break;
    }

    case "sequential-scraper": {
      // Crawls pages one after another: high risk, block/tarpit
      localMetrics.totalRequests += 150;
      localMetrics.botsDetected += 1;
      localMetrics.blockedRequests += 150;

      const newEvts: TrafficEvent[] = [
        { id: `evt_sim_${Date.now()}_1`, sessionId: simSessionId, path: "/company/apple", ip: "45.143.201.44", userAgent: "Scrapy/2.8.0 (+https://scrapy.org)", timestamp, actionTaken: "block" }
      ];
      localEvents = [...newEvts, ...localEvents];

      const newRisk: RiskResult = {
        sessionId: simSessionId,
        score: 96,
        action: "block",
        reasons: ["sequential_url_access", "suspicious_user_agent", "unusual_navigation"],
        confidence: 0.99,
        timestamp,
      };
      localRiskResults = [newRisk, ...localRiskResults];
      break;
    }

    case "playwright-bot": {
      // Headless automation tool: low behavior entropy, challenged or blocked
      localMetrics.totalRequests += 32;
      localMetrics.botsDetected += 1;
      localMetrics.powChallenges += 32;

      const newEvts: TrafficEvent[] = [
        { id: `evt_sim_${Date.now()}_1`, sessionId: simSessionId, path: "/compare", ip: "77.247.110.15", userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (HeadlessChrome)", timestamp, actionTaken: "proof_of_work" }
      ];
      localEvents = [...newEvts, ...localEvents];

      const newRisk: RiskResult = {
        sessionId: simSessionId,
        score: 68,
        action: "proof_of_work",
        reasons: ["low_behavior_entropy", "fingerprint_mismatch"],
        confidence: 0.92,
        timestamp,
      };
      localRiskResults = [newRisk, ...localRiskResults];
      break;
    }

    case "ai-agent": {
      // LLM/AI crawler: hits decoy hidden link, enters honey maze, triggers agent beacon trap
      localMetrics.totalRequests += 45;
      localMetrics.botsDetected += 1;
      localMetrics.honeyMazeHits += 1;
      localMetrics.blockedRequests += 45;

      const newEvts: TrafficEvent[] = [
        { id: `evt_sim_${Date.now()}_1`, sessionId: simSessionId, path: "/maze/ai_decoy_token", ip: "198.51.100.99", userAgent: "Mozilla/5.0 (AI Agent; GPTBot)", timestamp, actionTaken: "honey_maze" }
      ];
      localEvents = [...newEvts, ...localEvents];

      const newRisk: RiskResult = {
        sessionId: simSessionId,
        score: 92,
        action: "honey_maze",
        reasons: ["honey_link_triggered", "agent_beacon_triggered", "suspicious_user_agent"],
        confidence: 0.99,
        timestamp,
      };
      localRiskResults = [newRisk, ...localRiskResults];

      // Add to honey maze list
      const mazeHit: HoneyMazeHit = {
        sessionId: simSessionId,
        mazePath: "/maze/ai_decoy_token",
        enteredAt: timestamp,
      };
      localHoneyMazeHits = [mazeHit, ...localHoneyMazeHits];

      // Also trigger a fake canary token exposure to show scraping attribution!
      const canary: CanaryToken = {
        tokenId: `canary_row_${Math.floor(Math.random() * 900) + 100}`,
        sessionId: simSessionId,
        exposedAt: timestamp,
        company: "Stripe",
        fakeSalary: "$380,000",
      };
      localCanaryTokens = [canary, ...localCanaryTokens];
      break;
    }

    case "fake-googlebot": {
      // User agent is Googlebot, but lacks cryptographic DNS/TLS signature: rejected
      localMetrics.totalRequests += 12;
      localMetrics.botsDetected += 1;
      localMetrics.blockedRequests += 12;

      const newEvts: TrafficEvent[] = [
        { id: `evt_sim_${Date.now()}_1`, sessionId: simSessionId, path: "/compensation", ip: "109.244.52.88", userAgent: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)", timestamp, actionTaken: "block" }
      ];
      localEvents = [...newEvts, ...localEvents];

      const newRisk: RiskResult = {
        sessionId: simSessionId,
        score: 98,
        action: "block",
        reasons: ["fingerprint_mismatch", "suspicious_user_agent"],
        confidence: 0.99,
        timestamp,
      };
      localRiskResults = [newRisk, ...localRiskResults];
      break;
    }

    case "good-bot": {
      // Cryptographically signed search crawler: verified, allowed at throttled/controlled rate
      localMetrics.totalRequests += 15;
      localMetrics.realUsersProtected += 15; // counted as helpful crawl

      const newEvts: TrafficEvent[] = [
        { id: `evt_sim_${Date.now()}_1`, sessionId: simSessionId, path: "/compensation", ip: "66.249.66.1", userAgent: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)", timestamp, actionTaken: "good_bot_allow" }
      ];
      localEvents = [...newEvts, ...localEvents];

      const newRisk: RiskResult = {
        sessionId: simSessionId,
        score: 5,
        action: "good_bot_allow",
        reasons: ["verified_good_bot"],
        confidence: 0.99,
        timestamp,
      };
      localRiskResults = [newRisk, ...localRiskResults];
      break;
    }

    default:
      break;
  }

  return true;
}
