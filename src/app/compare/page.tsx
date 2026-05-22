"use client";

import { useState, useEffect } from "react";
import { Shield, Sparkles, Scale, AlertCircle, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { mockSalaries } from "@/data/mock";

interface CompComparisonPoint {
  levelCategory: string;
  [companyKey: string]: string | number;
}

export default function SalaryCompare() {
  const [companyA, setCompanyA] = useState("Google");
  const [companyB, setCompanyB] = useState("Meta");
  const [mounted, setMounted] = useState(false);

  // Silent Telemetry Page View
  useEffect(() => {
    setMounted(true);
    fetch("/api/events/page-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: "/compare", timestamp: new Date().toISOString() })
    }).catch(() => {});
  }, []);

  if (!mounted) return null;

  // List of unique companies available
  const availableCompanies = Array.from(new Set(mockSalaries.map((s) => s.company)));

  // Generate comparative data points: Entry, Mid, Senior
  // Google: L3 (195k), L4 (255k), L5 (360k)
  // Meta: IC3 (198k), IC4 (262k), IC5 (380k)
  // Apple: ICT3 (200k), ICT4 (275k), Synthesize a Senior L5 (340k)
  // Others have partials, we'll map them cleanly
  const getComparisonData = (): CompComparisonPoint[] => {
    const categories = [
      { name: "Entry-Level (L3/IC3 equivalent)", val: 0 },
      { name: "Mid-Level (L4/IC4 equivalent)", val: 1 },
      { name: "Senior (L5/IC5 equivalent)", val: 2 }
    ];

    const getSalaryForCategory = (company: string, categoryIndex: number): number => {
      // Find matching row or return a standard default
      const rows = mockSalaries.filter((s) => s.company.toLowerCase() === company.toLowerCase());
      if (categoryIndex === 0) {
        // Entry
        const entry = rows.find(r => r.level.includes("3") || r.level.includes("2"));
        if (entry) return parseInt(entry.totalComp.replace(/[$,]/g, "")) || 180000;
        return 185000;
      } else if (categoryIndex === 1) {
        // Mid
        const mid = rows.find(r => r.level.includes("4"));
        if (mid) return parseInt(mid.totalComp.replace(/[$,]/g, "")) || 240000;
        return 245000;
      } else {
        // Senior
        const senior = rows.find(r => r.level.includes("5") || r.level.includes("Senior") || r.level.includes("L2"));
        if (senior) return parseInt(senior.totalComp.replace(/[$,]/g, "")) || 350000;
        return 340000;
      }
    };

    return categories.map((cat, idx) => ({
      levelCategory: cat.name,
      [companyA]: getSalaryForCategory(companyA, idx),
      [companyB]: getSalaryForCategory(companyB, idx),
    }));
  };

  const chartData = getComparisonData();

  // Find max difference for explanation card
  const entryDiff = Math.abs(Number(chartData[0][companyA]) - Number(chartData[0][companyB]));
  const midDiff = Math.abs(Number(chartData[1][companyA]) - Number(chartData[1][companyB]));
  const seniorDiff = Math.abs(Number(chartData[2][companyA]) - Number(chartData[2][companyB]));
  const maxDiff = Math.max(entryDiff, midDiff, seniorDiff);

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
        <nav className="flex items-center gap-6 text-sm" style={{ color: "var(--muted)" }}>
          <a href="/" className="hover:text-white transition-colors">Product</a>
          <a href="/compensation" className="hover:text-white transition-colors">Compensation</a>
          <span className="text-white border-b-2 pb-0.5" style={{ borderColor: "var(--accent-cyan)" }}>Compare</span>
          <a href="/community" className="hover:text-white transition-colors">Community</a>
          <a href="/shield" className="hover:text-white transition-colors">Shield Dashboard</a>
        </nav>
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--accent-green)" }}>
          <span className="live-dot" />
          <span className="ml-2">Active</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <Scale size={24} style={{ color: "var(--accent-cyan)" }} />
            Compare Compensations
          </h1>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Compare software engineering salary packages side-by-side. Interact with elements to trigger client-side telemetry.
          </p>
        </div>

        {/* ─── Trap Layer: Hidden Bot Honeypot Decoy Link ─── */}
        <a 
          href="/maze/decoy_comparison_trap_beacon" 
          style={{ opacity: 0, position: "absolute", width: 0, height: 0, zIndex: -999 }}
          tabIndex={-1}
          aria-hidden="true"
        >
          View Secret Unreleased Salary Comparison spreadsheets for Tier-1 Tech
        </a>

        {/* Company Selector Dropdowns */}
        <div className="glass-card p-5 flex flex-col sm:flex-row gap-6 items-center justify-between glow-cyan">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>Compare</span>
            <select
              value={companyA}
              onChange={(e) => {
                if (e.target.value !== companyB) setCompanyA(e.target.value);
              }}
              className="bg-opacity-50 border rounded-md px-4 py-2 text-sm text-white font-semibold cursor-pointer w-full sm:w-44 font-sans"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              {availableCompanies.map((c) => (
                <option key={c} value={c} disabled={c === companyB}>{c}</option>
              ))}
            </select>

            <span className="text-xs font-bold" style={{ color: "var(--muted)" }}>VS</span>

            <select
              value={companyB}
              onChange={(e) => {
                if (e.target.value !== companyA) setCompanyB(e.target.value);
              }}
              className="bg-opacity-50 border rounded-md px-4 py-2 text-sm text-white font-semibold cursor-pointer w-full sm:w-44 font-sans"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              {availableCompanies.map((c) => (
                <option key={c} value={c} disabled={c === companyA}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs" style={{ color: "var(--accent-green)" }}>
            <Sparkles size={14} />
            <span>Interactive charts support hover analysis.</span>
          </div>
        </div>

        {/* Comparison Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Chart Column (Span 2) */}
          <div className="glass-card p-6 md:col-span-2 flex flex-col gap-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp size={16} style={{ color: "var(--accent-cyan)" }} />
                Standardized Total Compensation (USD)
              </h2>
              <p className="text-[10px]" style={{ color: "var(--muted)" }}>
                Aggregated statistics based on leveling standards.
              </p>
            </div>

            <div className="h-72 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c3050" />
                  <XAxis dataKey="levelCategory" tick={{ fill: "#64748b", fontSize: 9 }} stroke="#1c3050" />
                  <YAxis tick={{ fill: "#64748b", fontSize: 10 }} stroke="#1c3050" tickFormatter={(v) => `$${v/1000}k`} />
                  <Tooltip
                    contentStyle={{ background: "#0d1a2e", border: "1px solid #1c3050", borderRadius: 8, fontSize: 11, color: "#fff" }}
                    formatter={(value) => [`$${Number(value).toLocaleString()}`]}
                  />
                  <Legend wrapperStyle={{ fontSize: 10, paddingTop: 12 }} />
                  <Bar dataKey={companyA} fill="var(--accent-cyan)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey={companyB} fill="var(--accent-green)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Insights Column */}
          <div className="glass-card p-6 flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle size={15} style={{ color: "var(--accent-yellow)" }} />
                Shield Insights
              </h2>
              
              <div className="space-y-4">
                <div className="bg-black/30 p-3 rounded-lg border text-xs" style={{ borderColor: "var(--border)" }}>
                  <span className="font-semibold text-white block mb-1">Max Leverage Difference</span>
                  <p style={{ color: "var(--muted)" }}>
                    The largest salary difference across comparable levels is {" "}
                    <span className="font-bold font-mono" style={{ color: "var(--accent-yellow)" }}>
                      ${maxDiff.toLocaleString()}
                    </span>
                    .
                  </p>
                </div>

                <div className="bg-black/30 p-3 rounded-lg border text-xs" style={{ borderColor: "var(--border)" }}>
                  <span className="font-semibold text-white block mb-1">Behavior Cadence Logging</span>
                  <p style={{ color: "var(--muted)" }}>
                    Chart hover counts and mouse velocities are currently being analyzed by our client telemetry engine.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t pt-4" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: "var(--muted)" }}>Compare Session Status:</span>
                <span className="badge badge-allow">Allowed</span>
              </div>
            </div>
          </div>
        </div>
      </main>

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
