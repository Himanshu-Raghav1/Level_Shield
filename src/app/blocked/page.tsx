"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, Terminal, Lock, Globe, Server, RefreshCw } from "lucide-react";
import dynamic from "next/dynamic";

function AccessBlocked() {
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
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, var(--accent) 1px, transparent 1px)",
          backgroundSize: "24px 24px"
        }}
      />

      <div className="glass-card max-w-lg w-full p-8 text-center glow-red relative overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        {/* Red Glow Banner */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-accent shadow-[0_0_10px_rgba(225,29,72,0.4)]" />

        <div className="flex flex-col items-center gap-5 relative z-10">
          {/* Logo icon */}
          <div 
            className="w-14 h-14 rounded-full flex items-center justify-center mb-1"
            style={{ 
              background: "var(--accent-muted)", 
              border: "1px solid var(--border-bright)",
              boxShadow: "0 0 15px var(--accent-muted)"
            }}
          >
            <ShieldAlert size={28} style={{ color: "var(--accent)" }} />
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-extrabold text-foreground tracking-tight flex items-center justify-center gap-2">
              ACCESS TERMINATED
            </h1>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">
              Malicious Automation / Scraping Detected
            </p>
          </div>

          <p className="text-xs leading-relaxed max-w-sm" style={{ color: "var(--muted)" }}>
            Your connection has been intercepted and blocked by the **Level Shield Anti-Scraping Firewall**. Persistent API crawling and synthetic scraping triggers were identified.
          </p>

          {/* Details terminal */}
          <div className="w-full text-left font-mono text-[10px] space-y-2 bg-surface-2 border rounded-lg p-4" style={{ borderColor: "var(--border)" }}>
            <div className="flex justify-between border-b pb-1.5" style={{ borderColor: "var(--border)" }}>
              <span style={{ color: "var(--muted)" }}>SECURITY EVENT LOG ID:</span>
              <span className="font-bold text-accent">{sessionToken}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-y-1.5 pt-1">
              <div className="flex items-center gap-1.5 text-muted-custom">
                <Globe size={11} style={{ color: "var(--muted)" }} />
                <span>CLIENT IP:</span>
              </div>
              <span className="text-foreground text-right font-bold">{sessionIp}</span>

              <div className="flex items-center gap-1.5 text-muted-custom">
                <Server size={11} style={{ color: "var(--muted)" }} />
                <span>FIREWALL STATUS:</span>
              </div>
              <span className="text-right font-bold text-accent">PERMANENT BAN</span>

              <div className="flex items-center gap-1.5 text-muted-custom">
                <Terminal size={11} style={{ color: "var(--muted)" }} />
                <span>TRIGGERS:</span>
              </div>
              <span className="text-right font-bold text-muted-custom">LOW_BEHAVIOR_ENTROPY</span>

              <div className="flex items-center gap-1.5 text-muted-custom">
                <Lock size={11} style={{ color: "var(--muted)" }} />
                <span>CAPTURED VIA:</span>
              </div>
              <span className="text-right font-bold text-accent">CANARY_EXFILTRATION</span>
            </div>

            <div className="border-t pt-2 mt-2" style={{ borderColor: "var(--border)" }}>
              <span style={{ color: "var(--muted)" }}>TIMESTAMP:</span>
              <span className="text-muted-custom block mt-0.5">{timestamp}</span>
            </div>
          </div>

          <div className="w-full text-left rounded-lg p-3 text-[10px] leading-relaxed bg-surface border border-border-custom text-muted-custom">
            <strong>System Notice:</strong> Attempting to bypass this barrier using proxies or headers rotation will result in cryptographical honeypot tarpitting, consuming client execution threads automatically.
          </div>

          <div className="pt-2">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 border border-border-custom rounded text-[11px] font-bold tracking-wider hover:bg-surface-2 uppercase transition-all flex items-center gap-1.5 cursor-pointer text-muted-custom"
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

export default dynamic(() => Promise.resolve(AccessBlocked), { ssr: false });
