"use client";

import { useState, useEffect } from "react";
import { Shield, Sparkles, Scale, AlertCircle, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { mockSalaries } from "@/data/mock";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
  const getComparisonData = (): CompComparisonPoint[] => {
    const categories = [
      { name: "Entry (L3/IC3)", val: 0 },
      { name: "Mid (L4/IC4)", val: 1 },
      { name: "Senior (L5/IC5)", val: 2 }
    ];

    const getSalaryForCategory = (company: string, categoryIndex: number): number => {
      const rows = mockSalaries.filter((s) => s.company.toLowerCase() === company.toLowerCase());
      if (categoryIndex === 0) {
        const entry = rows.find(r => r.level.includes("3") || r.level.includes("2"));
        if (entry) return parseInt(entry.totalComp.replace(/[$,]/g, "")) || 180000;
        return 185000;
      } else if (categoryIndex === 1) {
        const mid = rows.find(r => r.level.includes("4"));
        if (mid) return parseInt(mid.totalComp.replace(/[$,]/g, "")) || 240000;
        return 245000;
      } else {
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
  const midDiff   = Math.abs(Number(chartData[1][companyA]) - Number(chartData[1][companyB]));
  const seniorDiff = Math.abs(Number(chartData[2][companyA]) - Number(chartData[2][companyB]));
  const maxDiff = Math.max(entryDiff, midDiff, seniorDiff);

  const selectStyle: React.CSSProperties = {
    background: "rgba(18, 18, 22, 0.8)",
    border: "1px solid var(--border)",
    color: "#ffffff",
    outline: "none",
    cursor: "pointer",
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>

      {/* ── Top Nav — matches homepage exactly ── */}
      <Navbar />

      {/* ── Main Content — centred ── */}
      <div style={{ display: "flex", justifyContent: "center", width: "100%", flex: 1 }}>
        <main className="w-full px-6 py-8 flex flex-col gap-6" style={{ maxWidth: "1024px" }}>

        {/* Page heading */}
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Scale size={20} className="text-cyan-400" />
            Compare Compensations
          </h1>
          <p className="text-xs text-zinc-400">
            Side-by-side total compensation across levels. Interactions trigger client-side telemetry.
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

        {/* ── Company Selector Row ── */}
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">Compare</span>

            <select
              value={companyA}
              onChange={(e) => { if (e.target.value !== companyB) setCompanyA(e.target.value); }}
              className="rounded px-2.5 py-1.5 text-xs font-semibold"
              style={selectStyle}
            >
              {availableCompanies.map((c) => (
                <option key={c} value={c} disabled={c === companyB}>{c}</option>
              ))}
            </select>

            <span className="text-xs font-bold font-mono text-zinc-500">vs</span>

            <select
              value={companyB}
              onChange={(e) => { if (e.target.value !== companyA) setCompanyB(e.target.value); }}
              className="rounded px-2.5 py-1.5 text-xs font-semibold"
              style={selectStyle}
            >
              {availableCompanies.map((c) => (
                <option key={c} value={c} disabled={c === companyA}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-cyan-400 sm:ml-auto">
            <Sparkles size={12} />
            Hover bars to analyse
          </div>
        </div>

        {/* ── Chart + Insights Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Chart column (2 of 3) */}
          <div
            className="md:col-span-2 p-5 rounded flex flex-col gap-4"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex flex-col gap-0.5">
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <TrendingUp size={15} className="text-cyan-400" />
                Total Compensation by Level (USD)
              </p>
              <p className="text-[10px] text-zinc-500">
                Aggregated from standardised levelling bands.
              </p>
            </div>

            <div style={{ height: 260, minHeight: 260, minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis
                    dataKey="levelCategory"
                    tick={{ fill: "#71717a", fontSize: 10, fontFamily: "monospace" }}
                    stroke="rgba(255,255,255,0.06)"
                    tickLine={false}
                    axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                  />
                  <YAxis
                    tick={{ fill: "#71717a", fontSize: 10, fontFamily: "monospace" }}
                    stroke="transparent"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${v / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(18, 18, 22, 0.95)",
                      border: "1px solid var(--border)",
                      borderRadius: 4,
                      fontSize: 11,
                      color: "#fff",
                      fontFamily: "inherit",
                    }}
                    cursor={{ fill: "rgba(255,255,255,0.02)" }}
                    formatter={(value) => [`$${Number(value).toLocaleString()}`]}
                  />
                  <Legend wrapperStyle={{ fontSize: 9, fontFamily: "monospace", textTransform: "uppercase", paddingTop: 14 }} />
                  <Bar dataKey={companyA} fill="var(--accent-cyan)" radius={[2, 2, 0, 0]} />
                  <Bar dataKey={companyB} fill="var(--foreground)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Shield Insights column (1 of 3) */}
          <div
            className="p-5 rounded flex flex-col gap-4"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderLeft: "2px solid var(--accent-cyan)",
            }}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <AlertCircle size={13} className="text-cyan-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                  Shield Insights
                </span>
              </div>
              <div style={{ height: 1, background: "linear-gradient(90deg, var(--accent-cyan), transparent)", opacity: 0.2 }} />
            </div>

            {/* Max diff stat */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-zinc-500">Max Leverage Gap</span>
              <span className="font-mono tabular-nums text-xl font-bold text-cyan-400">
                ${maxDiff.toLocaleString()}
              </span>
              <span className="text-xs leading-relaxed text-zinc-400">
                Largest salary difference across comparable levels.
              </span>
            </div>

            {/* Behaviour logging */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-zinc-500">Behaviour Cadence</span>
              <span className="text-xs leading-relaxed text-zinc-400">
                Hover counts and mouse velocities analysed by our client telemetry engine.
              </span>
            </div>

            {/* Session status */}
            <div
              className="mt-auto pt-3 flex items-center justify-between text-xs"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">Session Status</span>
              <span className="badge badge-allow">Allowed</span>
            </div>
          </div>
        </div>
        </main>
      </div>

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}
