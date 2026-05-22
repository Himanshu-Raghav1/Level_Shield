"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Search, Terminal, Cpu, Database, Eye } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/compensation?search=${encodeURIComponent(search.trim())}`);
    } else {
      router.push("/compensation");
    }
  };

  const trendingCompanies = ["Google", "Meta", "Apple", "Stripe", "Netflix"];

  return (
    <div className="min-h-screen flex flex-col justify-between" style={{ background: "var(--background)" }}>
      {/* Top Header */}
      <header
        className="flex items-center justify-between px-6 py-3 border-b"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <a href="/" className="flex items-center gap-2 font-bold text-base" style={{ color: "var(--accent-cyan)" }}>
          <Shield size={20} />
          Level Shield
        </a>
        <nav className="flex items-center gap-6 text-sm" style={{ color: "var(--muted)" }}>
          <span className="text-white border-b-2 pb-0.5" style={{ borderColor: "var(--accent-cyan)" }}>Product</span>
          <a href="/compensation" className="hover:text-white transition-colors">Compensation</a>
          <a href="/compare" className="hover:text-white transition-colors">Compare</a>
          <a href="/community" className="hover:text-white transition-colors">Community</a>
          <a href="/shield" className="hover:text-white transition-colors">Shield Dashboard</a>
        </nav>
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--accent-green)" }}>
          <span className="live-dot" />
          <span className="ml-2">System Active</span>
        </div>
      </header>

      {/* Hero Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center max-w-4xl mx-auto w-full">
        {/* Glow Logo */}
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
          style={{ 
            background: "rgba(0, 212, 255, 0.1)", 
            border: "2px solid var(--accent-cyan)",
            boxShadow: "0 0 25px rgba(0, 212, 255, 0.25)"
          }}
        >
          <Shield size={32} style={{ color: "var(--accent-cyan)" }} />
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
          AI-Era Anti-Scraping <br />
          <span style={{ color: "var(--accent-cyan)" }}>Compensation Catalog</span>
        </h1>
        
        <p className="text-sm md:text-base max-w-xl mb-8 leading-relaxed" style={{ color: "var(--muted)" }}>
          Search real-time software engineering compensations globally. Protected by **Level Shield Zero-Trust Bot Mitigation** with Behavior DNA, Canary salary tokens, and active challenge layers.
        </p>

        {/* Glow Search Bar */}
        <form onSubmit={handleSearchSubmit} className="w-full max-w-lg mb-4">
          <div 
            className="flex items-center rounded-xl p-1 bg-opacity-70 border transition-all duration-300"
            style={{ 
              background: "var(--surface)", 
              borderColor: "var(--border)",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)"
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--accent-cyan)";
              e.currentTarget.style.boxShadow = "0 0 15px rgba(0, 212, 255, 0.15)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.3)";
            }}
          >
            <span className="pl-3" style={{ color: "var(--muted)" }}>
              <Search size={18} />
            </span>
            <input 
              type="text" 
              placeholder="Search companies e.g. Google, Apple, Stripe..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent border-0 outline-none px-3 py-2.5 text-sm text-white placeholder-gray-500 font-sans"
            />
            <button 
              type="submit"
              className="px-5 py-2 rounded-lg text-xs font-semibold text-black transition-all"
              style={{ 
                background: "var(--accent-cyan)",
                boxShadow: "0 2px 10px rgba(0, 212, 255, 0.2)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = "brightness(1.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = "none";
              }}
            >
              Search
            </button>
          </div>
        </form>

        {/* Trending list */}
        <div className="flex items-center justify-center flex-wrap gap-2 text-xs mt-3">
          <span style={{ color: "var(--muted)" }}>Trending:</span>
          {trendingCompanies.map((comp) => (
            <button
              key={comp}
              onClick={() => router.push(`/compensation?search=${comp}`)}
              className="px-3 py-1 rounded-md border text-xs transition-colors hover:text-white"
              style={{ borderColor: "var(--border)", background: "var(--surface-2)", color: "var(--muted)" }}
            >
              {comp}
            </button>
          ))}
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-16 max-w-3xl">
          {[
            { 
              title: "Behavioral DNA", 
              desc: "Analyzes passive scroll cadence, typing rhythms, and mouse entropy signals dynamically.", 
              icon: <Cpu size={16} />, 
              color: "var(--accent-green)" 
            },
            { 
              title: "Canary Salary Tokens", 
              desc: "Injects distinct unique markers to identify and blacklist rogue exfiltration engines.", 
              icon: <Database size={16} />, 
              color: "var(--accent-yellow)" 
            },
            { 
              title: "Active Challenge Maze", 
              desc: "Tarpits malicious scanners inside infinite decoys and cryptographic mathematical puzzles.", 
              icon: <Terminal size={16} />, 
              color: "var(--accent-purple)" 
            }
          ].map((feat) => (
            <div key={feat.title} className="glass-card p-4 text-left flex flex-col gap-2">
              <div className="flex items-center gap-2" style={{ color: feat.color }}>
                {feat.icon}
                <span className="text-xs font-bold uppercase tracking-wider">{feat.title}</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer 
        className="py-4 border-t text-center text-xs" 
        style={{ borderColor: "var(--border)", background: "rgba(13,26,46,0.3)", color: "var(--muted)" }}
      >
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <span className="flex items-center gap-1"><Eye size={12} /> Privacy First Telemetry</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Shield size={12} /> Cyber-Shield Engine v1.0</span>
          <span>•</span>
          <span>Synthetic Salary Model</span>
        </div>
      </footer>
    </div>
  );
}
