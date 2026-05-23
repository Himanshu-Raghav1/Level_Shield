"use client";

import { useEffect, useState } from "react";
import { Shield, Activity, Users, Ban, AlertTriangle, Zap, Layers, ListChecks, Dna, Network, Fingerprint, Radar, Brain, CheckCircle2, KeyRound, Compass } from "lucide-react";
import SimulatorPanel from "@/components/SimulatorPanel";
import LiveTrafficFeed from "@/components/LiveTrafficFeed";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import RiskScoreChart from "@/components/RiskScoreChart";
import CanaryTokenTable from "@/components/CanaryTokenTable";
import RiskScore from "@/components/RiskScore";
import ActionBadge from "@/components/ActionBadge";
import {
  mockRiskTimeline,
  getRiskColor,
  formatTimeAgo,
} from "@/data/mock";
import {
  useDashboardMetrics,
  useTrafficEvents,
  useRiskResults,
  useCanaryTokens,
  useHoneyMazeHits,
  runSimulation,
  resetLocalSimulatorData,
} from "@/lib/client/api";

type Tab = "traffic" | "risk" | "innovation" | "sessions";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "traffic",    label: "Live Traffic",       icon: <Activity size={14} /> },
  { id: "risk",       label: "Risk Metrics",        icon: <AlertTriangle size={14} /> },
  { id: "innovation", label: "Innovation Layers",   icon: <Layers size={14} /> },
  { id: "sessions",   label: "Sessions",            icon: <ListChecks size={14} /> },
];

const STORY_STEPS_BOT = [
  "Bot attack starts",
  "Risk score rises",
  "Defense activates",
  "Bot enters honey maze",
  "Canary salary token proves scraping",
  "Real users remain allowed",
];

const STORY_STEPS_USER = [
  "Safe user browsing session started",
  "Behavior DNA evaluated (High Mouse/Keyboard Entropy)",
  "Zero suspicious scraping patterns detected",
  "Risk score evaluated: Extremely Low risk (Score <= 18)",
  "Verification action: Full seamless access allowed",
  "No interactive challenge (Zero Friction Experience)",
];

function ShieldDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("traffic");
  const [currentStep, setCurrentStep] = useState(-1);
  const [storyType, setStoryType] = useState<"bot" | "user">("bot");
  const [mounted, setMounted] = useState(false);

  // SWR hooks for polling
  const { metrics, riskTimeline, mutate: mutateMetrics } = useDashboardMetrics();
  const { events, mutate: mutateEvents } = useTrafficEvents();
  const { riskResults, mutate: mutateRisk } = useRiskResults();
  const { canaryTokens, mutate: mutateCanary } = useCanaryTokens();
  const { honeyMazeHits, mutate: mutateMaze } = useHoneyMazeHits();

  useEffect(() => {
    setMounted(true);
  }, []);

  const refreshAll = () => {
    mutateMetrics();
    mutateEvents();
    mutateRisk();
    mutateCanary();
    mutateMaze();
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="glass-card px-6 py-4 text-sm" style={{ color: "var(--accent-cyan)" }}>
          Loading Level Shield console...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      {/* Top Nav */}
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* ─── Left Sidebar: Simulator ──────────────────────────────── */}
        <aside
          className="w-52 shrink-0 flex flex-col p-4 border-r overflow-y-auto"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <SimulatorPanel
            onSimulate={async (type) => {
              console.log("Simulating:", type);
              const isBot = ["request-scraper", "sequential-scraper", "playwright-bot", "ai-agent", "fake-googlebot"].includes(type);
              setStoryType(isBot ? "bot" : "user");

              await runSimulation(type);
              refreshAll();

              // Animate the story panel
              setCurrentStep(0);
              let step = 0;
              const stepsLength = isBot ? STORY_STEPS_BOT.length : STORY_STEPS_USER.length;
              const story = setInterval(() => {
                step += 1;
                if (step >= stepsLength) {
                  clearInterval(story);
                  return;
                }
                setCurrentStep(step);
              }, 800);
            }}
            onReset={async () => {
              setCurrentStep(-1);
              await resetLocalSimulatorData();
              refreshAll();
            }}
          />
        </aside>

        {/* ─── Main Content ──────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {/* KPI Cards Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total Requests",      value: metrics.totalRequests.toLocaleString(),  icon: <Activity size={16} />, color: "var(--accent-cyan)" },
              { label: "Bots Detected",       value: metrics.botsDetected.toLocaleString(),   icon: <AlertTriangle size={16} />, color: "var(--foreground)" },
              { label: "Blocked Requests",    value: metrics.blockedRequests.toLocaleString(), icon: <Ban size={16} />, color: "var(--foreground)" },
              { label: "False Positive Rate", value: metrics.falsePositiveRate,               icon: <Zap size={16} />, color: "var(--accent-cyan)" },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="glass-card p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>{label}</span>
                  <span style={{ color }}>{icon}</span>
                </div>
                <span className="text-2xl font-bold font-mono" style={{ color }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Secondary stats row */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Throttled",     value: metrics.throttledRequests, color: "var(--muted)" },
              { label: "PoW Challenges", value: metrics.powChallenges,    color: "var(--muted)" },
              { label: "Honey Maze Hits", value: metrics.honeyMazeHits,  color: "var(--accent-cyan)" },
              { label: "Real Users Protected", value: metrics.realUsersProtected, color: "var(--foreground)" },
            ].map(({ label, value, color }) => (
              <div key={label} className="glass-card px-4 py-3 flex items-center justify-between">
                <span className="text-xs" style={{ color: "var(--muted)" }}>{label}</span>
                <span className="font-bold font-mono text-sm" style={{ color }}>{value.toLocaleString()}</span>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="glass-card flex flex-col flex-1">
            <div className="flex border-b px-4 pt-3 gap-1" style={{ borderColor: "var(--border)" }}>
              {TABS.map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-t-lg transition-all duration-200"
                  style={{
                    background: activeTab === id ? "var(--surface)" : "transparent",
                    color: activeTab === id ? "var(--accent-cyan)" : "var(--muted)",
                    borderBottom: activeTab === id ? "2px solid var(--accent-cyan)" : "2px solid transparent",
                  }}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>

            <div className="p-4 flex-1">
              {/* ── Tab: Live Traffic ── */}
              {activeTab === "traffic" && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <span className="live-dot" />
                    <span className="text-xs font-semibold ml-2" style={{ color: "var(--accent-cyan)" }}>Live Feed</span>
                    <span className="text-xs ml-auto" style={{ color: "var(--muted)" }}>{events.length} events</span>
                  </div>
                  <LiveTrafficFeed events={events} />
                </div>
              )}

              {/* ── Tab: Risk Metrics ── */}
              {activeTab === "risk" && (
                <div className="flex flex-col gap-4">
                  <p className="text-xs font-semibold" style={{ color: "var(--muted)" }}>Risk Score Over Time</p>
                  <RiskScoreChart data={riskTimeline || []} />
                  <div>
                    <p className="text-xs font-semibold mb-3" style={{ color: "var(--muted)" }}>Top Sessions by Risk</p>
                    <div className="flex flex-col gap-2">
                      {[...riskResults].sort((a, b) => b.score - a.score).map((r) => (
                        <div
                          key={r.sessionId}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg"
                          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                        >
                          <RiskScore score={r.score} size="sm" />
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-xs font-mono truncate" style={{ color: "var(--accent-cyan)" }}>
                              {r.sessionId}
                            </span>
                            <span className="text-xs" style={{ color: "var(--muted)" }}>
                              {r.reasons.slice(0, 2).join(", ")}
                            </span>
                          </div>
                          <ActionBadge action={r.action} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Tab: Innovation Layers ── */}
              {activeTab === "innovation" && (
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Canary Tokens */}
                  <div className="glass-card p-3 flex items-start gap-3">
                    <span className="shrink-0 mt-0.5" style={{ color: "var(--accent-cyan)" }}>
                      <KeyRound size={16} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
                        Canary Token Attribution
                      </h3>
                      <div className="mt-2">
                        <CanaryTokenTable tokens={canaryTokens} />
                      </div>
                    </div>
                  </div>

                  {/* Honey Maze */}
                  <div className="glass-card p-3 flex items-start gap-3">
                    <span className="shrink-0 mt-0.5" style={{ color: "var(--accent-cyan)" }}>
                      <Compass size={16} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
                        Honey Maze Entries
                      </h3>
                      <div className="mt-2">
                        {honeyMazeHits.length === 0 ? (
                          <p className="text-xs py-1" style={{ color: "var(--muted)" }}>No maze entries yet.</p>
                        ) : (
                          <div className="flex flex-col gap-1.5">
                            {honeyMazeHits.slice(0, 3).map((h, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between px-3 py-1.5 rounded-lg"
                                style={{ background: "rgba(6,182,212,0.04)", border: "1px solid rgba(6,182,212,0.15)" }}
                              >
                                <span className="text-xs font-mono" style={{ color: "var(--accent-cyan)" }}>
                                  {h.sessionId.slice(0, 14)}…
                                </span>
                                <span className="text-xs ml-auto" style={{ color: "var(--muted)" }}>
                                  {formatTimeAgo(h.enteredAt)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Innovation feature summary cards */}
                  {[
                    { name: "Behavior DNA",          icon: <Dna size={16} />,          desc: "Mouse entropy, typing cadence, dwell" },
                    { name: "Graph of Intent",        icon: <Network size={16} />,      desc: "Session nav graph: clean = bot" },
                    { name: "JA4-Style Fingerprint",  icon: <Fingerprint size={16} />,  desc: "Header + behavior consistency" },
                    { name: "AI-Agent Trap Beacon",   icon: <Radar size={16} />,        desc: "Hidden link triggers on decoy pages" },
                    { name: "Adaptive Friction Brain", icon: <Brain size={16} />,        desc: "allow → throttle → PoW → maze → block" },
                    { name: "Signed Good-Bot Lane",   icon: <CheckCircle2 size={16} />, desc: "Cryptographic crawler verification" },
                  ].map(({ name, icon, desc }) => (
                    <div key={name} className="glass-card p-3 flex items-start gap-3">
                      <span className="shrink-0 mt-0.5" style={{ color: "var(--accent-cyan)" }}>
                        {icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>{name}</h3>
                        <p className="text-xs mt-1 leading-normal" style={{ color: "var(--muted)" }}>{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Tab: Sessions ── */}
              {activeTab === "sessions" && (
                <div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr style={{ color: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
                          <th className="text-left py-2 pr-4 font-medium">Session</th>
                          <th className="text-left py-2 pr-4 font-medium">Risk</th>
                          <th className="text-left py-2 pr-4 font-medium">Action</th>
                          <th className="text-left py-2 font-medium">Top Signals</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...riskResults].sort((a, b) => b.score - a.score).map((r) => (
                          <tr
                            key={r.sessionId}
                            className="border-b hover:bg-white/5 transition-colors cursor-pointer"
                            style={{ borderColor: "var(--border)" }}
                            onClick={() => (window.location.href = `/shield/sessions/${r.sessionId}`)}
                          >
                            <td className="py-3 pr-4 font-mono" style={{ color: "var(--accent-cyan)" }}>
                              {r.sessionId}
                            </td>
                            <td className="py-3 pr-4">
                              <RiskScore score={r.score} size="sm" />
                            </td>
                            <td className="py-3 pr-4">
                              <ActionBadge action={r.action} />
                            </td>
                            <td className="py-3 max-w-xs truncate" style={{ color: "var(--muted)" }}>
                              {r.reasons.join(", ") || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Judge Story Panel */}
          {currentStep >= 0 && (
            <div
              className="glass-card p-4 border"
              style={{
                borderColor: storyType === "bot" ? "var(--accent-cyan)" : "#22c55e",
                boxShadow: storyType === "bot" ? "0 0 12px rgba(0,212,255,0.15)" : "0 0 12px rgba(34,197,94,0.15)",
              }}
            >
              <p className="text-xs font-semibold mb-3" style={{ color: storyType === "bot" ? "var(--accent-cyan)" : "#22c55e" }}>
                {storyType === "bot" ? "🎯 Bot Attack Playbook" : "✅ Safe User Behavior Validation"}
              </p>
              <div className="flex flex-wrap gap-2">
                {(storyType === "bot" ? STORY_STEPS_BOT : STORY_STEPS_USER).map((step, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-all duration-500"
                    style={{
                      background: i <= currentStep 
                        ? (storyType === "bot" ? "rgba(0,212,255,0.15)" : "rgba(34,197,94,0.15)")
                        : "transparent",
                      border: `1px solid ${
                        i <= currentStep 
                          ? (storyType === "bot" ? "var(--accent-cyan)" : "#22c55e")
                          : "var(--border)"
                      }`,
                      color: i <= currentStep 
                        ? (storyType === "bot" ? "var(--accent-cyan)" : "#22c55e")
                        : "var(--muted)",
                      transform: i === currentStep ? "scale(1.05)" : "scale(1)",
                    }}
                  >
                    <span>{i + 1}.</span> {step}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(ShieldDashboard), { ssr: false });
