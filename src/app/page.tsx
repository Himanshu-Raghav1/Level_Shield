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
    <div className="min-h-screen bg-background flex flex-col antialiased">
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
                background: "var(--accent-muted)",
                borderColor: "var(--border-bright)",
                boxShadow: "0 0 30px var(--accent-muted)",
              }}
            >
              <Shield size={28} className="text-accent" />
            </div>

            {/* Hero Title */}
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
              AI-Era Anti-Scraping<br />
              <span className="text-accent font-black">Compensation Catalog</span>
            </h1>

            {/* Hero Subtext */}
            <p className="text-xs md:text-sm text-muted-custom max-w-lg leading-relaxed mt-2">
              Search real-time software engineering compensations globally.
              Protected by <strong className="text-foreground font-bold">Level Shield Zero-Trust</strong> with
              Behavior DNA, Canary salary tokens, and active challenge layers.
            </p>
          </div>

          {/* Search Box & Trending */}
          <div className="w-full max-w-lg flex flex-col items-center gap-5">
            <form onSubmit={handleSearchSubmit} className="w-full">
              <div 
                className="flex items-center gap-3 bg-surface-2/80 border border-border-custom rounded-lg p-2.5 pl-4 transition-all duration-300 hover:border-accent focus-within:border-accent shadow-xl"
              >
                <Search size={15} className="text-muted-custom shrink-0" />
                <input
                  type="text"
                  placeholder="Search companies e.g. Google, Apple, Stripe..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-xs text-foreground placeholder-muted-custom py-1"
                />
                <button
                  type="submit"
                  className="bg-accent hover:bg-accent-hover active:bg-accent text-white border-none rounded px-5 py-2 text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Trending Searches */}
            <div className="flex items-center justify-center flex-wrap gap-2.5 text-xs">
              <span className="text-[10px] uppercase font-mono tracking-wider text-muted-custom">Trending:</span>
              {trendingCompanies.map((comp) => (
                <button
                  key={comp}
                  onClick={() => router.push(`/compensation?search=${comp}`)}
                  className="px-3 py-1 rounded border border-border-custom bg-surface-2/30 text-muted-custom hover:text-foreground hover:border-accent/40 transition-all text-xs font-semibold cursor-pointer"
                >
                  {comp}
                </button>
              ))}
            </div>
          </div>

          {/* Feature Cards Grid (Optimised Gap from 6 to 8) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl text-left mt-4">
            {[
              {
                title: "Behavioral DNA",
                desc: "Analyzes passive scroll cadence, typing rhythms, and mouse entropy signals dynamically.",
                icon: <Cpu size={16} />,
                color: "var(--foreground)",
                accent: "var(--surface)",
                accentBorder: "var(--border)",
              },
              {
                title: "Canary Salary Tokens",
                desc: "Injects distinct unique markers to identify and blacklist rogue exfiltration engines.",
                icon: <Database size={16} />,
                color: "var(--accent)",
                accent: "var(--accent-muted)",
                accentBorder: "var(--border-bright)",
              },
              {
                title: "Active Challenge Maze",
                desc: "Tarpits malicious scanners inside infinite decoys and cryptographic mathematical puzzles.",
                icon: <Terminal size={16} />,
                color: "var(--muted)",
                accent: "var(--surface-2)",
                accentBorder: "var(--border)",
              },
            ].map((feat) => (
              <div 
                key={feat.title} 
                className="border rounded-lg p-6 flex flex-col gap-5 transition-all duration-300 hover:bg-surface-2/40"
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
                  <h3 className="text-xs font-bold text-foreground mb-2">{feat.title}</h3>
                  <p className="text-xs text-muted-custom leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA link */}
          <a
            href="/compensation"
            className="inline-flex items-center gap-2 mt-4 text-xs font-semibold text-accent hover:text-accent-hover transition-all hover:gap-3"
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
