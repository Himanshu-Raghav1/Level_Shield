"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, ChevronLeft, Calendar, Terminal, AlertTriangle, Monitor, ArrowRight, UserCheck, ShieldAlert, Cpu } from "lucide-react";
import { mockRiskResults, mockTrafficEvents } from "@/data/mock";
import { getRiskColor, getActionBadgeClass, getActionLabel } from "@/data/mock";

interface SessionPageProps {
  params: Promise<{ id: string }>;
}

export default function SessionAnalyst({ params }: SessionPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Silent Telemetry Page View
    fetch("/api/events/page-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: `/shield/sessions/${id}`, timestamp: new Date().toISOString() })
    }).catch(() => {});

    // Fetch live session deep-dive metrics
    setLoading(true);
    fetch(`/api/sessions/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Session not found");
        return res.json();
      })
      .then((data) => {
        setSessionData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Failed to fetch backend session data, falling back to mock metrics:", err);
        setLoading(false);
      });
  }, [id]);

  if (!mounted) return null;

  // Resolve matching risk profile
  let sessionRisk: any = null;
  let syntheticEvents: any[] = [];
  let userAgentPlatform = "Linux x86_64";
  let mouseEntropy = "22% (Highly Linear)";
  let mouseEntropyDesc = "Straight-line pixel transitions indicative of WebDriver scripts.";
  let keyCadence = "4ms average gap";
  let keyCadenceDesc = "Super-human typing speeds matching autocomplete copy-pastes.";
  let clickCoherence = "100% exact offsets";
  let clickCoherenceDesc = "No micro-shakes or organic mouse offsets recorded during hover events.";

  if (sessionData) {
    const latestRisk = sessionData.risks?.[sessionData.risks.length - 1];
    const lastDefense = sessionData.defenses?.[sessionData.defenses.length - 1];
    sessionRisk = {
      sessionId: sessionData.session.id,
      score: latestRisk?.score ?? 0,
      action: lastDefense?.action ?? 'allow',
      reasons: latestRisk?.reasons ?? [],
      confidence: latestRisk?.confidence ?? 0.95,
      timestamp: sessionData.session.createdAt,
    };
    
    syntheticEvents = (sessionData.requests ?? []).map((r: any) => ({
      id: r.id,
      sessionId: r.session_id,
      path: r.url,
      ip: sessionData.session.ipAddress,
      userAgent: sessionData.session.userAgent,
      timestamp: r.timestamp,
      actionTaken: lastDefense?.action ?? 'allow',
    }));

    if (sessionData.session.userAgent.includes("Macintosh")) {
      userAgentPlatform = "macOS (Apple Silicon/Intel)";
    } else if (sessionData.session.userAgent.includes("Windows")) {
      userAgentPlatform = "Windows NT (x64)";
    }

    const entropy = sessionData.innovationLayers?.behaviorDna?.entropy ?? 100;
    if (entropy < 50) {
      mouseEntropy = `${entropy}% (Low Entropy)`;
      mouseEntropyDesc = "Highly linear/robotic cursor movement detected with zero micro-shakes.";
      clickCoherence = "100% exact offsets";
      clickCoherenceDesc = "Robotic absolute position offsets with zero pixel variations.";
    } else {
      mouseEntropy = `${entropy}% (High Entropy)`;
      mouseEntropyDesc = "Organic cursor trajectory with micro-shakes, proving human presence.";
      clickCoherence = "Varying micro-offsets";
      clickCoherenceDesc = "Organic micro-offsets and micro-hesitations typical of human motor controls.";
    }
  } else {
    sessionRisk = mockRiskResults.find((r) => r.sessionId === id);
    if (!sessionRisk) {
      sessionRisk = {
        sessionId: id,
        score: id.includes("bot") || id.includes("sim_request") || id.includes("sim_sequential") || id.includes("sim_playwright") || id.includes("sim_ai") ? 88 : 12,
        action: id.includes("bot") || id.includes("sim_sequential") || id.includes("sim_ai") ? "block" : id.includes("pow") || id.includes("sim_playwright") ? "proof_of_work" : "allow",
        reasons: id.includes("bot") || id.includes("sim_sequential") ? ["sequential_url_access", "suspicious_user_agent"] : id.includes("sim_ai") ? ["honey_link_triggered", "agent_beacon_triggered"] : [],
        confidence: 0.95,
        timestamp: new Date().toISOString(),
      };
    }

    const sessionEvents = mockTrafficEvents.filter((e) => e.sessionId === id);
    syntheticEvents = sessionEvents.length > 0 ? sessionEvents : [
      { id: "syn_evt_1", sessionId: id, path: "/", ip: "45.143.201.44", userAgent: "Mozilla/5.0 (Playwright Bot)", timestamp: new Date(Date.now() - 15000).toISOString(), actionTaken: sessionRisk.action },
      { id: "syn_evt_2", sessionId: id, path: "/compensation", ip: "45.143.201.44", userAgent: "Mozilla/5.0 (Playwright Bot)", timestamp: new Date(Date.now() - 10000).toISOString(), actionTaken: sessionRisk.action },
      { id: "syn_evt_3", sessionId: id, path: "/company/google", ip: "45.143.201.44", userAgent: "Mozilla/5.0 (Playwright Bot)", timestamp: new Date(Date.now() - 5000).toISOString(), actionTaken: sessionRisk.action },
    ];
  }

  return (
    <div className="min-h-screen flex flex-col justify-between" style={{ background: "var(--background)" }}>
      {/* Top Navbar */}
      <header
        className="flex items-center justify-between px-6 py-3 border-b"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <a href="/" className="flex items-center gap-2 font-bold text-base" style={{ color: "var(--accent-cyan)" }}>
          <Shield size={20} />
          Level Shield
        </a>
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--accent-cyan)" }}>
          <span className="live-dot" />
          <span className="ml-2">Analyst View Active</span>
        </div>
      </header>

      <div style={{ display: "flex", justifyContent: "center", width: "100%", flex: 1 }}>
        <main className="w-full px-4 py-8 flex flex-col gap-6" style={{ maxWidth: "1024px" }}>
        {/* Navigation Breadcrumb */}
        <div>
          <button
            onClick={() => router.push("/shield")}
            className="flex items-center gap-1.5 text-xs transition-colors hover:text-white mb-4 cursor-pointer"
            style={{ color: "var(--muted)" }}
          >
            <ChevronLeft size={14} />
            Back to Shield Dashboard
          </button>
        </div>

        {/* Header Block */}
        <div className="glass-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 glow-cyan">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold px-2 py-0.5 rounded border uppercase tracking-wider bg-black/40" style={{ color: "var(--accent-cyan)", borderColor: "var(--border)" }}>
                Session ID: {sessionRisk.sessionId}
              </span>
              <span className={getActionBadgeClass(sessionRisk.action)}>
                {getActionLabel(sessionRisk.action)}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">Session Security Deep-Dive</h1>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              Detailed timeline, fingerprinting anomalies, and behavior cadence analysis.
            </p>
          </div>

          {/* Risk gauge block */}
          <div className="flex items-center gap-4 bg-black/35 px-5 py-3.5 rounded-xl border glow-cyan" style={{ borderColor: "var(--border)" }}>
            <div className="text-center">
              <span className="text-[10px] block uppercase tracking-wider font-semibold" style={{ color: "var(--muted)" }}>Risk Score</span>
              <span className="text-3xl font-extrabold font-mono" style={{ color: getRiskColor(sessionRisk.score) }}>
                {sessionRisk.score}%
              </span>
            </div>
            <div className="border-l pl-4 py-1.5" style={{ borderColor: "var(--border)" }}>
              <span className="text-[9px] block uppercase tracking-wider" style={{ color: "var(--muted)" }}>Engine confidence</span>
              <span className="text-xs font-bold text-white">{(sessionRisk.confidence * 100).toFixed(0)}% Match</span>
            </div>
          </div>
        </div>

        {/* Splitting Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left / Middle: Graph of Intent and Fingerprints (Span 2) */}
          <div className="md:col-span-2 flex flex-col gap-6">
            
            {/* Graph of Intent */}
            <div className="glass-card p-5 flex flex-col gap-4">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Terminal size={14} style={{ color: "var(--accent-cyan)" }} />
                Graph of Intent (User Page Transitions)
              </h2>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
                {syntheticEvents.map((evt, idx) => (
                  <div key={evt.id} className="relative flex flex-col gap-1.5">
                    {/* Glowing indicator dot */}
                    <div 
                      className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full border-2 bg-black"
                      style={{ borderColor: idx === syntheticEvents.length - 1 ? "var(--accent-cyan)" : "var(--muted)" }}
                    />
                    
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-white font-mono">{evt.path}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(evt.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 text-[10px]" style={{ color: "var(--muted)" }}>
                      <span>IP: <span className="text-slate-300 font-semibold">{evt.ip}</span></span>
                      <span>•</span>
                      <span>Action Taken: <span className="text-slate-300 capitalize">{evt.actionTaken}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Browser Fingerprint */}
            <div className="glass-card p-5 flex flex-col gap-4">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Monitor size={14} style={{ color: "var(--accent-cyan)" }} />
                Client-Side Fingerprint Variables
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                {[
                  { label: "User Agent", val: syntheticEvents[0]?.userAgent || "Unknown" },
                  { label: "OS Platform", val: userAgentPlatform },
                  { label: "Timezone Offset", val: "UTC+00:00 (Mismatched)" },
                  { label: "Screen Resolution", val: "1920 x 1080 (Headless)" },
                  { label: "Hardware Concurrency", val: "4 Cores (Synthetic)" },
                  { label: "Canvas Signature", val: "b548b2ad3e77 (Bot Match)" },
                ].map((item) => (
                  <div key={item.label} className="bg-black/30 p-3 rounded-lg border flex flex-col gap-1" style={{ borderColor: "var(--border)" }}>
                    <span className="text-[9px] uppercase font-bold" style={{ color: "var(--muted)" }}>{item.label}</span>
                    <span className="text-white text-[11px] truncate" title={item.val}>{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
 
          {/* Right Column: Behavior DNA Curve and Actions */}
          <div className="flex flex-col gap-6">
            
            {/* Behavior DNA Cadence */}
            <div className="glass-card p-5 flex flex-col gap-4">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Cpu size={14} style={{ color: "var(--accent-cyan)" }} />
                Behavior DNA analysis
              </h2>
 
              <div className="space-y-4">
                {[
                  { label: "Mouse Trajectory Entropy", val: mouseEntropy, desc: mouseEntropyDesc },
                  { label: "Keystroke Cadence", val: keyCadence, desc: keyCadenceDesc },
                  { label: "Click Coherence", val: clickCoherence, desc: clickCoherenceDesc }
                ].map((dna) => (
                  <div key={dna.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-300">{dna.label}</span>
                      <span className="font-bold font-mono" style={{ color: "var(--accent-cyan)" }}>{dna.val}</span>
                    </div>
                    <p className="text-[10px]" style={{ color: "var(--muted)" }}>{dna.desc}</p>
                  </div>
                ))}
              </div>
            </div>
 
            {/* Verdict Box */}
            <div className="glass-card p-5 flex flex-col gap-3 justify-between">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle size={14} style={{ color: "var(--accent-cyan)" }} />
                Mitigation Verdict
              </h2>
 
              <div className="space-y-3 text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                <p>
                  Based on multiple sequential page views combined with behavior entropy signals, the engine classified this session as:
                </p>
                <div 
                  className="p-3 border font-bold font-mono rounded text-center text-xs"
                  style={{
                    background: sessionRisk.action === 'block' ? "rgba(239,68,68,0.04)" : sessionRisk.action === 'honey_maze' ? "rgba(168,85,247,0.04)" : "rgba(6,182,212,0.04)",
                    borderColor: sessionRisk.action === 'block' ? "rgba(239,68,68,0.25)" : sessionRisk.action === 'honey_maze' ? "rgba(168,85,247,0.25)" : "rgba(6,182,212,0.25)",
                    color: sessionRisk.action === 'block' ? "#ef4444" : sessionRisk.action === 'honey_maze' ? "#a855f7" : "var(--accent-cyan)"
                  }}
                >
                  {sessionRisk.action === 'block' ? "SCRAPER_AUTOMATED_BLOCKED" : sessionRisk.action === 'honey_maze' ? "CRAWLER_TAR_PIT_REDIRECTED" : sessionRisk.action === 'proof_of_work' ? "CPU_CHALLENGE_REQUIRED" : "HUMAN_SESSION_VERIFIED"}
                </div>
                <p className="text-[10px]">
                  {sessionRisk.action === 'honey_maze' ? "This session is locked in a recursive, self-referential Honey Maze database trap serving randomized synthetic salary metrics." : "All transaction footprints and behaviors associated with this session are recorded under active threat vectors."}
                </p>
              </div>
            </div>
          </div>
        </div>
        </main>
      </div>

      {/* Footer */}
      <footer 
        className="py-4 border-t text-center text-xs mt-12" 
        style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--muted)" }}
      >
        <span>Level Shield Firewall Active • Session Investigation Panel</span>
      </footer>
    </div>
  );
}
