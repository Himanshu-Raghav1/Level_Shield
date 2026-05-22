"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Search, Terminal, Cpu, Database, Eye, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
    <div className="min-h-screen bg-[#09090b] flex flex-col antialiased">
      {/* ── Navigation ── */}
      <Navbar />

      {/* ── Center Wrapper to guarantee horizontal centering ── */}
      <div style={{ display: "flex", justifyContent: "center", width: "100%", flex: 1 }}>
        {/* ── Hero Section ── */}
        <main className="w-full px-6 py-20 flex flex-col items-center justify-center text-center gap-14" style={{ maxWidth: "1024px" }}>
          
          {/* Header Block: Icon, Title, Subtext */}
          <div className="flex flex-col items-center gap-5 max-w-2xl">
            {/* Shield Icon Badge */}
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center border transition-all duration-300 mb-2"
              style={{
                background: "rgba(6, 182, 212, 0.04)",
                borderColor: "rgba(6, 182, 212, 0.2)",
                boxShadow: "0 0 30px rgba(6, 182, 212, 0.08)",
              }}
            >
              <Shield size={28} className="text-cyan-400" />
            </div>

            {/* Hero Title */}
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              AI-Era Anti-Scraping<br />
              <span className="text-cyan-400">Compensation Catalog</span>
            </h1>

            {/* Hero Subtext */}
            <p className="text-xs md:text-sm text-zinc-400 max-w-lg leading-relaxed mt-2">
              Search real-time software engineering compensations globally.
              Protected by <strong className="text-white font-semibold">Level Shield Zero-Trust</strong> with
              Behavior DNA, Canary salary tokens, and active challenge layers.
            </p>
          </div>

          {/* Search Box & Trending */}
          <div className="w-full max-w-lg flex flex-col items-center gap-5">
            <form onSubmit={handleSearchSubmit} className="w-full">
              <div 
                className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800 rounded-lg p-2.5 pl-4 transition-all duration-300 hover:border-cyan-500/50 focus-within:border-cyan-500 shadow-xl"
              >
                <Search size={15} className="text-zinc-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Search companies e.g. Google, Apple, Stripe..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-xs text-white placeholder-zinc-500 py-1"
                />
                <button
                  type="submit"
                  className="bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-black border-none rounded px-5 py-2 text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Trending Searches */}
            <div className="flex items-center justify-center flex-wrap gap-2.5 text-xs">
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">Trending:</span>
              {trendingCompanies.map((comp) => (
                <button
                  key={comp}
                  onClick={() => router.push(`/compensation?search=${comp}`)}
                  className="px-3 py-1 rounded border border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:text-white hover:border-cyan-500/30 transition-all text-xs font-semibold cursor-pointer"
                >
                  {comp}
                </button>
              ))}
            </div>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl text-left mt-4">
            {[
              {
                title: "Behavioral DNA",
                desc: "Analyzes passive scroll cadence, typing rhythms, and mouse entropy signals dynamically.",
                icon: <Cpu size={16} />,
                color: "var(--foreground)",
                accent: "rgba(255, 255, 255, 0.02)",
                accentBorder: "rgba(255, 255, 255, 0.08)",
              },
              {
                title: "Canary Salary Tokens",
                desc: "Injects distinct unique markers to identify and blacklist rogue exfiltration engines.",
                icon: <Database size={16} />,
                color: "var(--accent-cyan)",
                accent: "rgba(6, 182, 212, 0.03)",
                accentBorder: "rgba(6, 182, 212, 0.2)",
              },
              {
                title: "Active Challenge Maze",
                desc: "Tarpits malicious scanners inside infinite decoys and cryptographic mathematical puzzles.",
                icon: <Terminal size={16} />,
                color: "var(--muted)",
                accent: "rgba(255, 255, 255, 0.01)",
                accentBorder: "rgba(255, 255, 255, 0.05)",
              },
            ].map((feat) => (
              <div 
                key={feat.title} 
                className="bg-zinc-900/40 border rounded-lg p-6 flex flex-col gap-5 transition-all duration-300 hover:bg-zinc-900/60"
                style={{
                  borderColor: feat.accentBorder,
                  background: feat.accent,
                }}
              >
                <div 
                  className="w-10 h-10 rounded flex items-center justify-center border"
                  style={{
                    background: feat.accent,
                    borderColor: feat.accentBorder,
                    color: feat.color,
                  }}
                >
                  {feat.icon}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white mb-2">{feat.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA link */}
          <a
            href="/compensation"
            className="inline-flex items-center gap-2 mt-4 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-all hover:gap-3"
          >
            Browse all compensations <ArrowRight size={13} />
          </a>
        </main>
      </div>

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}
