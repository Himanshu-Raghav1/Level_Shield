"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, Terminal, Lock, Globe, Server, RefreshCw } from "lucide-react";

export default function AccessBlocked() {
  const [sessionIp, setSessionIp] = useState("45.143.201.44");
  const [sessionToken, setSessionToken] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimestamp(new Date().toISOString());
    setSessionToken(`sess_block_${Math.random().toString(36).substring(2, 10).toUpperCase()}`);
    
    // Silent Telemetry Page View
    fetch("/api/events/page-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: "/blocked", timestamp: new Date().toISOString() })
    }).catch(() => {});
  }, []);

  if (!mounted) return null;

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4" 
      style={{ background: "var(--background)" }}
    >
      {/* Pulse background grid effect */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, var(--accent-cyan) 1px, transparent 1px)",
          backgroundSize: "24px 24px"
        }}
      />

      <div className="glass-card max-w-lg w-full p-8 text-center glow-cyan relative overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        {/* Cyan Glow Banner */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]" />

        <div className="flex flex-col items-center gap-5 relative z-10">
          {/* Logo icon */}
          <div 
            className="w-14 h-14 rounded-full flex items-center justify-center mb-1"
            style={{ 
              background: "rgba(6, 182, 212, 0.08)", 
              border: "1px solid var(--accent-cyan)",
              boxShadow: "0 0 15px rgba(6, 182, 212, 0.2)"
            }}
          >
            <ShieldAlert size={28} style={{ color: "var(--accent-cyan)" }} />
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
              ACCESS TERMINATED
            </h1>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent-cyan)" }}>
              Malicious Automation / Scraping Detected
            </p>
          </div>

          <p className="text-xs leading-relaxed max-w-sm" style={{ color: "var(--muted)" }}>
            Your connection has been intercepted and blocked by the **Level Shield Anti-Scraping Firewall**. Persistent API crawling and synthetic scraping triggers were identified.
          </p>

          {/* Details terminal */}
          <div className="w-full text-left font-mono text-[10px] space-y-2 bg-black/45 border rounded-lg p-4" style={{ borderColor: "var(--border)" }}>
            <div className="flex justify-between border-b pb-1.5" style={{ borderColor: "var(--border)" }}>
              <span style={{ color: "var(--muted)" }}>SECURITY EVENT LOG ID:</span>
              <span className="font-bold" style={{ color: "var(--accent-cyan)" }}>{sessionToken}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-y-1.5 pt-1">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Globe size={11} style={{ color: "var(--muted)" }} />
                <span>CLIENT IP:</span>
              </div>
              <span className="text-white text-right font-bold">{sessionIp}</span>

              <div className="flex items-center gap-1.5 text-slate-400">
                <Server size={11} style={{ color: "var(--muted)" }} />
                <span>FIREWALL STATUS:</span>
              </div>
              <span className="text-right font-bold" style={{ color: "var(--foreground)" }}>PERMANENT BAN</span>

              <div className="flex items-center gap-1.5 text-slate-400">
                <Terminal size={11} style={{ color: "var(--muted)" }} />
                <span>TRIGGERS:</span>
              </div>
              <span className="text-right font-bold" style={{ color: "var(--muted)" }}>LOW_BEHAVIOR_ENTROPY</span>

              <div className="flex items-center gap-1.5 text-slate-400">
                <Lock size={11} style={{ color: "var(--muted)" }} />
                <span>CAPTURED VIA:</span>
              </div>
              <span className="text-right font-bold" style={{ color: "var(--accent-cyan)" }}>CANARY_EXFILTRATION</span>
            </div>

            <div className="border-t pt-2 mt-2" style={{ borderColor: "var(--border)" }}>
              <span style={{ color: "var(--muted)" }}>TIMESTAMP:</span>
              <span className="text-slate-300 block mt-0.5">{timestamp}</span>
            </div>
          </div>

          <div className="w-full text-left rounded-lg p-3 text-[10px] leading-relaxed" style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted)" }}>
            <strong>System Notice:</strong> Attempting to bypass this barrier using proxies or headers rotation will result in cryptographical honeypot tarpitting, consuming client execution threads automatically.
          </div>

          <div className="pt-2">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 border rounded text-[11px] font-bold tracking-wider hover:text-white uppercase transition-all flex items-center gap-1.5 cursor-pointer"
              style={{ borderColor: "var(--border)", color: "var(--muted)" }}
            >
              <RefreshCw size={12} />
              Re-Verify Connection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
