"use client";

import { useEffect, useState } from "react";
import { Shield, Activity, Users, Ban, AlertTriangle, Zap, Layers, ListChecks } from "lucide-react";
import SimulatorPanel from "@/components/SimulatorPanel";
import LiveTrafficFeed from "@/components/LiveTrafficFeed";
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

const STORY_STEPS = [
  "Bot attack starts",
  "Risk score rises",
  "Defense activates",
  "Bot enters honey maze",
  "Canary salary token proves scraping",
  "Real users remain allowed",
];

export default function ShieldDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("traffic");
  const [currentStep, setCurrentStep] = useState(-1);
  const [mounted, setMounted] = useState(false);

  // SWR hooks for polling
  const { metrics, mutate: mutateMetrics } = useDashboardMetrics();
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
              await runSimulation(type);
              refreshAll();

              // Animate the story panel
              setCurrentStep(0);
              let step = 0;
              const story = setInterval(() => {
                step += 1;
                if (step >= STORY_STEPS.length) {
                  clearInterval(story);
                  return;
                }
                setCurrentStep(step);
              }, 800);
            }}
            onReset={() => {
              setCurrentStep(-1);
              resetLocalSimulatorData();
              refreshAll();
            }}
          />
        </aside>

        {/* ─── Main Content ──────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {/* KPI Cards Row (Spacious Spacing: gap-5) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { label: "Total Requests",      value: metrics.totalRequests.toLocaleString(),  icon: <Activity size={16} />, color: "var(--accent)" },
              { label: "Bots Detected",       value: metrics.botsDetected.toLocaleString(),   icon: <AlertTriangle size={16} />, color: "var(--foreground)" },
              { label: "Blocked Requests",    value: metrics.blockedRequests.toLocaleString(), icon: <Ban size={16} />, color: "var(--foreground)" },
              { label: "False Positive Rate", value: metrics.falsePositiveRate,               icon: <Zap size={16} />, color: "var(--accent)" },
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

          {/* Secondary stats row (Spacious Spacing: gap-5) */}
          <div className="grid grid-cols-4 gap-5">
            {[
              { label: "Throttled",     value: metrics.throttledRequests, color: "var(--muted)" },
              { label: "PoW Challenges", value: metrics.powChallenges,    color: "var(--muted)" },
              { label: "Honey Maze Hits", value: metrics.honeyMazeHits,  color: "var(--accent)" },
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
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-t-lg transition-all duration-200 cursor-pointer"
                  style={{
                    background: activeTab === id ? "var(--surface-2)" : "transparent",
                    color: activeTab === id ? "var(--accent)" : "var(--muted)",
                    borderBottom: activeTab === id ? "2px solid var(--accent)" : "2px solid transparent",
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
                    <span className="text-xs font-semibold ml-2" style={{ color: "var(--accent)" }}>Live Feed</span>
                    <span className="text-xs ml-auto" style={{ color: "var(--muted)" }}>{events.length} events</span>
                  </div>
                  <LiveTrafficFeed events={events} />
                </div>
              )}

              {/* ── Tab: Risk Metrics ── */}
              {activeTab === "risk" && (
                <div className="flex flex-col gap-4">
                  <p className="text-xs font-semibold" style={{ color: "var(--muted)" }}>Risk Score Over Time</p>
                  <RiskScoreChart data={mockRiskTimeline} />
                  <div>
                    <p className="text-xs font-semibold mb-3" style={{ color: "var(--muted)" }}>Top Sessions by Risk</p>
                    <div className="flex flex-col gap-2">
                      {[...riskResults].sort((a, b) => b.score - a.score).map((r) => (
                        <div
                          key={r.sessionId}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg"
                          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                        >
                          <RiskScore score={r.score} size="sm" />
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-xs font-mono truncate" style={{ color: "var(--accent)" }}>
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
                  <div className="glass-card p-4">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--accent)" }}>
                      🪤 Canary Token Attribution
                    </h3>
                    <CanaryTokenTable tokens={canaryTokens} />
                  </div>

                  {/* Honey Maze */}
                  <div className="glass-card p-4">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--accent)" }}>
                      🌀 Honey Maze Entries
                    </h3>
                    {honeyMazeHits.length === 0 ? (
                      <p className="text-xs" style={{ color: "var(--muted)" }}>No maze entries yet.</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {honeyMazeHits.map((h, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg"
                            style={{ background: "var(--accent-muted)", border: "1px solid var(--border-bright)" }}
                          >
                            <span className="text-xs font-mono" style={{ color: "var(--accent)" }}>
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

                  {/* Innovation feature summary cards */}
                  {[
                    { name: "Behavior DNA",          icon: "🧬", color: "var(--foreground)",  desc: "Mouse entropy, typing cadence, dwell" },
                    { name: "Graph of Intent",        icon: "🕸️",  color: "var(--accent)",      desc: "Session nav graph: clean = bot" },
                    { name: "JA4-Style Fingerprint",  icon: "🔬", color: "var(--muted)",  desc: "Header + behavior consistency" },
                    { name: "AI-Agent Trap Beacon",   icon: "⚡", color: "var(--accent)",      desc: "Hidden link triggers on decoy pages" },
                    { name: "Adaptive Friction Brain", icon: "🧠", color: "var(--muted)", desc: "allow → throttle → PoW → maze → block" },
                    { name: "Signed Good-Bot Lane",   icon: "✅", color: "var(--foreground)",  desc: "Cryptographic crawler verification" },
                  ].map(({ name, icon, color, desc }) => (
                    <div key={name} className="glass-card p-3 flex items-start gap-3">
                      <span className="text-xl">{icon}</span>
                      <div>
                        <p className="text-xs font-semibold" style={{ color }}>{name}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{desc}</p>
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
                          <th className="text-left py-2 pr-4 font-semibold">Session</th>
                          <th className="text-left py-2 pr-4 font-semibold">Risk</th>
                          <th className="text-left py-2 pr-4 font-semibold">Action</th>
                          <th className="text-left py-2 font-semibold">Top Signals</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...riskResults].sort((a, b) => b.score - a.score).map((r) => (
                          <tr
                            key={r.sessionId}
                            className="border-b hover:bg-foreground/[0.02] transition-colors cursor-pointer"
                            style={{ borderColor: "var(--border)" }}
                            onClick={() => (window.location.href = `/shield/sessions/${r.sessionId}`)}
                          >
                            <td className="py-3 pr-4 font-mono font-bold" style={{ color: "var(--accent)" }}>
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
              className="glass-card p-4 border glow-red"
              style={{ borderColor: "var(--border-bright)" }}
            >
              <p className="text-xs font-bold mb-3 text-accent">
                🎯 Attack Playbook
              </p>
              <div className="flex flex-wrap gap-2">
                {STORY_STEPS.map((step, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-all duration-500"
                    style={{
                      background: i <= currentStep ? "var(--accent-muted)" : "transparent",
                      border: `1px solid ${i <= currentStep ? "var(--border-bright)" : "var(--border)"}`,
                      color: i <= currentStep ? "var(--accent)" : "var(--muted)",
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
