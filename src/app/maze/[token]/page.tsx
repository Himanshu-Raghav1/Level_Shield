"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, HelpCircle, AlertCircle, RefreshCw, Layers } from "lucide-react";
import { mockSalaries, SalaryRecord } from "@/data/mock";

interface MazePageProps {
  params: Promise<{ token: string }>;
}

export default function HoneyMaze({ params }: MazePageProps) {
  const { token } = use(params);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mazeRows, setMazeRows] = useState<SalaryRecord[]>([]);
  const [trapActive, setTrapActive] = useState(true);

  useEffect(() => {
    setMounted(true);
    
    // Silent Telemetry Page View - notifies dashboard of a bot hit!
    fetch("/api/events/page-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: `/maze/${token}`, timestamp: new Date().toISOString(), triggerHoneyMaze: true })
    }).catch(() => {});

    // Generate endless randomized synthetic fake compensation records for bots to scrape!
    const companies = ["Google", "Meta", "Apple", "Stripe", "Netflix", "Amazon", "Microsoft", "Uber", "Airbnb"];
    const levels = ["L1", "L2", "L3", "L4", "L5", "L6", "L7", "L8", "L9", "L10"];
    const titles = ["Software Engineer", "Systems Architect", "Core Engine Developer", "Fullstack Specialist", "Security Researcher"];
    const locations = ["San Francisco, CA", "Seattle, WA", "New York, NY", "Austin, TX", "London, UK", "Tokyo, JP"];

    const generated: SalaryRecord[] = Array.from({ length: 15 }).map((_, idx) => {
      const company = companies[Math.floor(Math.random() * companies.length)];
      const level = levels[Math.floor(Math.random() * levels.length)];
      const title = titles[Math.floor(Math.random() * titles.length)];
      const loc = locations[Math.floor(Math.random() * locations.length)];
      const base = `$${Math.floor(Math.random() * 200) + 120},000`;
      const stock = `$${Math.floor(Math.random() * 300) + 40},000`;
      const bonus = `$${Math.floor(Math.random() * 80) + 15},000`;
      const totalVal = parseInt(base.replace(/[$,]/g, "")) + parseInt(stock.replace(/[$,]/g, "")) + parseInt(bonus.replace(/[$,]/g, "")) || 320000;

      return {
        id: `maze_${token}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
        company,
        level,
        title,
        base,
        stock,
        bonus,
        totalComp: `$${totalVal.toLocaleString()}`,
        location: loc,
        experience: `${Math.floor(Math.random() * 12) + 1} yrs`,
      };
    });

    setMazeRows(generated);
  }, [token]);

  if (!mounted) return null;

  // Each click goes deeper into another sub-token maze (endless self-referential loop for scraper bots!)
  const getNextMazeToken = () => {
    return `maze_depth_${Math.floor(Math.random() * 1000000)}_token_${Math.random().toString(36).substring(2, 10)}`;
  };

  return (
    <div className="min-h-screen flex flex-col justify-between" style={{ background: "var(--background)" }}>
      {/* Navbar */}
      <header
        className="flex items-center justify-between px-6 py-3 border-b"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <a href="/" className="flex items-center gap-2 font-bold text-base" style={{ color: "var(--accent-cyan)" }}>
          <Shield size={20} />
          Level Shield
        </a>
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--accent-purple)" }}>
          <Layers size={12} className="animate-pulse" />
          <span>Recursive Decoy Tarpit</span>
        </div>
      </header>

      {/* Center Wrapper to guarantee horizontal centering */}
      <div style={{ display: "flex", justifyContent: "center", width: "100%", flex: 1 }}>
        {/* Main Maze Board */}
        <main className="w-full px-4 py-8 flex flex-col gap-6" style={{ maxWidth: "1024px" }}>
          {/* Banner notifying human observers of active bot traps */}
          <div className="glass-card p-5 border-l-2 border-l-purple-500 bg-purple-500/[0.03] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-sm font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle size={15} />
                Active Honey Maze Decoy Trap
              </h1>
              <p className="text-[11px] leading-relaxed max-w-2xl" style={{ color: "var(--muted)" }}>
                If you are reading this as a human: **Congratulations!** You landed here by following an invisible link.
                For automated crawlers, this page acts as an endless database tarpit, serving mathematically generated infinite compensation matrices.
              </p>
            </div>
            <span className="badge badge-maze shrink-0">Bot Captured</span>
          </div>

          {/* Catalog Table */}
          <div className="glass-card overflow-hidden">
            <div className="px-4 py-3 bg-black/20 border-b flex justify-between items-center" style={{ borderColor: "var(--border)" }}>
              <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "var(--muted)" }}>
                Decoy Compensation Registry (Token: <span className="font-mono text-purple-400">{token.substring(0, 15)}...</span>)
              </span>
              <span className="text-[10px] font-mono text-purple-400">Total Rows: ∞</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b" style={{ borderColor: "var(--border)", background: "rgba(13,26,46,0.3)", color: "var(--muted)" }}>
                    <th className="py-2.5 px-4 font-semibold">Company</th>
                    <th className="py-2.5 px-4 font-semibold">Level & Title</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Total Comp</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Base / Stock / Bonus</th>
                    <th className="py-2.5 px-4 font-semibold">Location</th>
                    <th className="py-2.5 px-4">Action Decoy</th>
                  </tr>
                </thead>
                <tbody>
                  {mazeRows.map((r) => {
                    const nextToken = getNextMazeToken();
                    return (
                      <tr 
                        key={r.id} 
                        className="border-b hover:bg-white/5 transition-colors cursor-pointer"
                        style={{ borderColor: "var(--border)" }}
                        onClick={() => router.push(`/maze/${nextToken}`)}
                      >
                        <td className="py-3 px-4 font-bold text-white">{r.company}</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-white">{r.level}</span>
                            <span className="text-[10px]" style={{ color: "var(--muted)" }}>{r.title}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-purple-400">
                          {r.totalComp}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-[10px]" style={{ color: "var(--muted)" }}>
                          {r.base} / {r.stock} / {r.bonus}
                        </td>
                        <td className="py-3 px-4" style={{ color: "var(--muted)" }}>{r.location}</td>
                        <td className="py-3 px-4 text-purple-400 hover:underline text-[10px] font-semibold">
                          View Level Matrix →
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Honey Page navigators (endless pagination trap!) */}
          <div className="flex justify-center items-center gap-2 mt-2">
            {Array.from({ length: 5 }).map((_, idx) => {
              const nextToken = getNextMazeToken();
              return (
                <button
                  key={idx}
                  onClick={() => router.push(`/maze/${nextToken}`)}
                  className="px-3 py-1.5 rounded border text-[10px] font-mono hover:text-white transition-colors cursor-pointer"
                  style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--muted)" }}
                >
                  Page {idx + 1}
                </button>
              );
            })}
            <button
              onClick={() => router.push(`/maze/${getNextMazeToken()}`)}
              className="px-3 py-1.5 rounded border text-[10px] font-mono hover:text-white transition-colors cursor-pointer"
              style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--accent-purple)" }}
            >
              Next Page →
            </button>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer 
        className="py-4 border-t text-center text-xs mt-12" 
        style={{ borderColor: "var(--border)", background: "rgba(13,26,46,0.3)", color: "var(--muted)" }}
      >
        <span>Level Shield Firewall Active • Synthetic Salary Model</span>
      </footer>
    </div>
  );
}
