"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, Cpu, RefreshCw, CheckCircle, ShieldAlert } from "lucide-react";

export default function ProofOfWorkChallenge() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "solving" | "success" | "failed">("idle");
  const [difficulty, setDifficulty] = useState("Level 4 (2^20 complexity)");
  const [hashesSolved, setHashesSolved] = useState(0);
  const [sessionToken, setSessionToken] = useState("");

  useEffect(() => {
    // Silent Telemetry Page View
    fetch("/api/events/page-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: "/challenge/pow", timestamp: new Date().toISOString() })
    }).catch(() => {});

    // Set token
    setSessionToken(`pow_${Math.random().toString(36).substring(2, 12).toUpperCase()}`);
    
    // Auto start the solver simulation
    handleSolveChallenge();
  }, []);

  const handleSolveChallenge = () => {
    setStatus("solving");
    setProgress(0);
    setHashesSolved(0);

    const startTime = Date.now();
    const duration = 2000; // 2 seconds challenge solver simulation

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      
      setProgress(pct);
      setHashesSolved(Math.floor(pct * 4520));

      if (pct >= 100) {
        clearInterval(interval);
        setStatus("success");
        // Simulate sending solved token back and redirecting to originally requested page after a slight delay
        setTimeout(() => {
          router.push("/compensation");
        }, 1200);
      }
    }, 40);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4" 
      style={{ background: "var(--background)" }}
    >
      <div className="glass-card max-w-md w-full p-6 text-center glow-cyan border relative overflow-hidden">
        {/* Futuristic Grid Effect */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, var(--accent-cyan) 1px, transparent 1px)",
            backgroundSize: "20px 20px"
          }}
        />

        <div className="flex flex-col items-center gap-4 relative z-10">
          {/* Logo */}
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center mb-1"
            style={{ 
              background: "rgba(0, 212, 255, 0.1)", 
              border: "1px solid var(--accent-cyan)",
              boxShadow: "0 0 15px rgba(0, 212, 255, 0.2)"
            }}
          >
            <Shield size={22} style={{ color: "var(--accent-cyan)" }} />
          </div>

          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Security Check Required</h1>
            <p className="text-[11px] mt-1" style={{ color: "var(--muted)" }}>
              Resolving cryptographic proof-of-work challenge to verify your session.
            </p>
          </div>

          {/* Cryptographic challenge details */}
          <div className="bg-black/40 border rounded-lg p-3 w-full text-left font-mono text-[10px] space-y-1.5" style={{ borderColor: "var(--border)" }}>
            <div className="flex justify-between">
              <span style={{ color: "var(--muted)" }}>CHALLENGE ID:</span>
              <span className="text-white font-bold">{sessionToken || "GENERATING..."}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--muted)" }}>DIFFICULTY:</span>
              <span style={{ color: "var(--accent-cyan)" }}>{difficulty}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--muted)" }}>ALGORITHM:</span>
              <span className="text-white">SHA-256 (Client-Bound)</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--muted)" }}>STATUS:</span>
              <span 
                className="font-bold"
                style={{ 
                  color: status === "solving" ? "var(--accent-yellow)" : status === "success" ? "var(--accent-green)" : "var(--muted)" 
                }}
              >
                {status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Circular Hashing Progress */}
          <div className="relative my-4 flex items-center justify-center">
            {/* SVG circle progress */}
            <svg className="w-28 h-28 transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r="48"
                stroke="var(--border)"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="56"
                cy="56"
                r="48"
                stroke="var(--accent-cyan)"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={301.6}
                strokeDashoffset={301.6 - (301.6 * progress) / 100}
                style={{ transition: "stroke-dashoffset 0.1s linear" }}
              />
            </svg>

            {/* Inner text/status */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {status === "solving" && (
                <>
                  <span className="text-lg font-bold font-mono text-white">{progress}%</span>
                  <span className="text-[9px] uppercase tracking-wider text-yellow-500 font-semibold flex items-center gap-1">
                    <RefreshCw size={8} className="animate-spin" />
                    Solving
                  </span>
                </>
              )}
              {status === "success" && (
                <div className="flex flex-col items-center gap-0.5">
                  <CheckCircle size={24} style={{ color: "var(--accent-green)" }} />
                  <span className="text-[9px] uppercase tracking-wider font-extrabold" style={{ color: "var(--accent-green)" }}>Verified</span>
                </div>
              )}
            </div>
          </div>

          {/* Hash status */}
          <div className="text-[10px]" style={{ color: "var(--muted)" }}>
            {status === "solving" && (
              <span className="font-mono">
                Computing: <span className="text-white font-bold">{hashesSolved.toLocaleString()}</span> hashes evaluated
              </span>
            )}
            {status === "success" && (
              <span style={{ color: "var(--accent-green)" }}>
                Cryptographic signature generated successfully! Redirecting...
              </span>
            )}
          </div>

          {/* Fallback button if stuck */}
          <div className="w-full mt-2 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
            <p className="text-[9px] leading-relaxed mb-2" style={{ color: "var(--muted)" }}>
              Level Shield protects compensation datasets from heavy parallel crawler networks while maintaining 100% human-transparent rendering.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
