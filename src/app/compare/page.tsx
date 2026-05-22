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

  const navLinks = [
    { label: "Product",          href: "/" },
    { label: "Compensation",     href: "/compensation" },
    { label: "Compare",          href: "/compare", active: true },
    { label: "Community",        href: "/community" },
    { label: "Shield Dashboard", href: "/shield" },
  ];

  const selectStyle: React.CSSProperties = {
    background: "#18181b",
    border: "1px solid #3f3f46",
    color: "#e4e4e7",
    outline: "none",
    cursor: "pointer",
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0a0a0a", color: "#e4e4e7" }}>

      {/* ── Top Navigation ── */}
      <header style={{ borderBottom: "1px solid #27272a", background: "#0a0a0a" }}>
        {/* Brand row */}
        <div className="flex items-center justify-between px-6 py-2.5">
          <a href="/" className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: "#e4e4e7" }}>
            <Shield size={15} style={{ color: "#10b981" }} />
            Level Shield
          </a>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "#10b981" }}>
            <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
            Live
          </div>
        </div>

        {/* Tab row */}
        <nav className="flex items-end px-6 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {navLinks.map((item) =>
            item.active ? (
              <span
                key={item.label}
                className="text-xs font-medium px-3 py-2 whitespace-nowrap cursor-default"
                style={{ color: "#ffffff", borderBottom: "1px solid #ffffff", marginBottom: -1 }}
              >
                {item.label}
              </span>
            ) : (
              <a
                key={item.label}
                href={item.href}
                className="text-xs px-3 py-2 whitespace-nowrap transition-colors duration-150"
                style={{ color: "#71717a", borderBottom: "1px solid transparent", marginBottom: -1 }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#a1a1aa"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#71717a"; }}
              >
                {item.label}
              </a>
            )
          )}
        </nav>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-6 flex flex-col gap-5">

        {/* Page title */}
        <div>
          <h1 className="text-sm font-semibold" style={{ color: "#e4e4e7" }}>
            Compare Compensations
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "#71717a" }}>
            Side-by-side total compensation across levels. Interactions trigger client telemetry.
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

        {/* ── Selector Row ── */}
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center gap-3 py-3 px-4 rounded-md"
          style={{ background: "#111111", border: "1px solid #27272a" }}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs" style={{ color: "#71717a" }}>Compare</span>

            <select
              value={companyA}
              onChange={(e) => { if (e.target.value !== companyB) setCompanyA(e.target.value); }}
              className="rounded-md text-xs px-2.5 py-1.5"
              style={selectStyle}
            >
              {availableCompanies.map((c) => (
                <option key={c} value={c} disabled={c === companyB}>{c}</option>
              ))}
            </select>

            <span className="text-xs font-mono font-bold" style={{ color: "#52525b" }}>vs</span>

            <select
              value={companyB}
              onChange={(e) => { if (e.target.value !== companyA) setCompanyB(e.target.value); }}
              className="rounded-md text-xs px-2.5 py-1.5"
              style={selectStyle}
            >
              {availableCompanies.map((c) => (
                <option key={c} value={c} disabled={c === companyA}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs sm:ml-auto" style={{ color: "#52525b" }}>
            <Sparkles size={11} />
            Hover bars for details
          </div>
        </div>

        {/* ── Chart + Insights Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Chart (2 cols) */}
          <div
            className="md:col-span-2 rounded-md p-4 flex flex-col gap-3"
            style={{ background: "#111111", border: "1px solid #27272a" }}
          >
            <div>
              <p className="text-xs font-semibold" style={{ color: "#e4e4e7" }}>
                Total Compensation by Level (USD)
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#71717a" }}>
                Aggregated from standardized leveling bands.
              </p>
            </div>

            <div style={{ height: 260, minHeight: 260, minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#27272a" vertical={false} />
                  <XAxis
                    dataKey="levelCategory"
                    tick={{ fill: "#52525b", fontSize: 10, fontFamily: "system-ui" }}
                    stroke="#27272a"
                    tickLine={false}
                    axisLine={{ stroke: "#27272a" }}
                  />
                  <YAxis
                    tick={{ fill: "#52525b", fontSize: 10, fontFamily: "ui-monospace, monospace" }}
                    stroke="transparent"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${v / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#18181b",
                      border: "1px solid #3f3f46",
                      borderRadius: 6,
                      fontSize: 11,
                      color: "#e4e4e7",
                      fontFamily: "ui-monospace, monospace",
                    }}
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                    formatter={(value) => [`$${Number(value).toLocaleString()}`]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 11, paddingTop: 12, color: "#71717a" }}
                  />
                  <Bar dataKey={companyA} fill="#10b981" radius={[2, 2, 0, 0]} opacity={0.9} />
                  <Bar dataKey={companyB} fill="#6366f1" radius={[2, 2, 0, 0]} opacity={0.9} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Shield Insights (1 col) */}
          <div
            className="rounded-md p-4 flex flex-col gap-4"
            style={{ background: "#111111", border: "1px solid #27272a", borderLeft: "2px solid #f59e0b" }}
          >
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <AlertCircle size={12} style={{ color: "#f59e0b" }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#f59e0b" }}>
                  Shield Insights
                </span>
              </div>
              <div style={{ height: 1, background: "linear-gradient(90deg, #f59e0b40, transparent)" }} />
            </div>

            {/* Max diff */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold" style={{ color: "#e4e4e7" }}>Max Leverage Gap</span>
              <span
                className="font-mono tabular-nums text-lg font-semibold"
                style={{ color: "#f59e0b" }}
              >
                ${maxDiff.toLocaleString()}
              </span>
              <span className="text-xs" style={{ color: "#71717a" }}>
                Largest salary difference across comparable levels.
              </span>
            </div>

            {/* Behavior logging */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold" style={{ color: "#e4e4e7" }}>Behavior Cadence</span>
              <span className="text-xs" style={{ color: "#71717a" }}>
                Hover counts and mouse velocities are analyzed by our client telemetry engine.
              </span>
            </div>

            {/* Session status */}
            <div
              className="mt-auto pt-3 flex items-center justify-between text-xs"
              style={{ borderTop: "1px solid #27272a" }}
            >
              <span style={{ color: "#71717a" }}>Session:</span>
              <span
                className="font-mono text-xs px-2 py-0.5 rounded"
                style={{
                  background: "rgba(16,185,129,0.1)",
                  color: "#10b981",
                  border: "1px solid rgba(16,185,129,0.2)",
                }}
              >
                allowed
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="px-6 py-4 text-xs" style={{ borderTop: "1px solid #27272a", color: "#3f3f46" }}>
        Level Shield • Synthetic Salary Model
      </footer>
    </div>
  );
}
