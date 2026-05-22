import useSWR from "swr";
import {
  mockDashboardMetrics,
  mockTrafficEvents,
  mockRiskResults,
  mockCanaryTokens,
  mockHoneyMazeHits
} from "@/data/mock";
import { DashboardMetrics, TrafficEvent, RiskResult, CanaryToken, HoneyMazeHit } from "@/types";

// Keep a local mutable copy of mock data for dynamic UI ticking in mock mode
let localMetrics: DashboardMetrics = { ...mockDashboardMetrics };
let localEvents: TrafficEvent[] = [...mockTrafficEvents];
let localRiskResults: RiskResult[] = [...mockRiskResults];
let localCanaryTokens: CanaryToken[] = [...mockCanaryTokens];
let localHoneyMazeHits: HoneyMazeHit[] = [...mockHoneyMazeHits];

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

// Hook: get dashboard metrics
export function useDashboardMetrics() {
  const { data, error, mutate } = useSWR<DashboardMetrics>("/api/metrics", fetcher, {
    refreshInterval: 1500,
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  if (error || !data) {
    tickMockData();
    return {
      metrics: localMetrics,
      isLoading: false,
      isError: !!error,
      mutate,
    };
  }

  // Update our local sync copy so we don't jump stats if backend goes offline
  localMetrics = { ...data };

  return {
    metrics: data,
    isLoading: false,
    isError: false,
    mutate,
  };
}

// Hook: get live traffic events
export function useTrafficEvents() {
  const { data, error, mutate } = useSWR<TrafficEvent[]>("/api/events", fetcher, {
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

  localEvents = [...data];

  return {
    events: data,
    isLoading: false,
    isError: false,
    mutate,
  };
}

// Hook: get risk results / sessions
export function useRiskResults() {
  const { data, error, mutate } = useSWR<RiskResult[]>("/api/events/risk", fetcher, {
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

  localRiskResults = [...data];

  return {
    riskResults: data,
    isLoading: false,
    isError: false,
    mutate,
  };
}

// Hook: get canary tokens
export function useCanaryTokens() {
  const { data, error, mutate } = useSWR<CanaryToken[]>("/api/metrics/canaries", fetcher, {
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

  localCanaryTokens = [...data];

  return {
    canaryTokens: data,
    isLoading: false,
    isError: false,
    mutate,
  };
}

// Hook: get honey maze hits
export function useHoneyMazeHits() {
  const { data, error, mutate } = useSWR<HoneyMazeHit[]>("/api/metrics/maze", fetcher, {
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

  localHoneyMazeHits = [...data];

  return {
    honeyMazeHits: data,
    isLoading: false,
    isError: false,
    mutate,
  };
}

// Reset client simulator data
export function resetLocalSimulatorData() {
  localMetrics = { ...mockDashboardMetrics };
  localEvents = [...mockTrafficEvents];
  localRiskResults = [...mockRiskResults];
  localCanaryTokens = [...mockCanaryTokens];
  localHoneyMazeHits = [...mockHoneyMazeHits];
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
