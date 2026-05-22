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

  const selectStyle = {
    background: "rgba(15,23,42,0.85)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "white",
    outline: "none",
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>

      {/* ── Premium Sticky Header ── */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 border-b"
        style={{
          borderColor: "rgba(255,255,255,0.04)",
          background: "rgba(8,13,26,0.75)",
          backdropFilter: "blur(20px) saturate(150%)",
          WebkitBackdropFilter: "blur(20px) saturate(150%)",
        }}
      >
        {/* Logo */}
        <a
          href="/"
          className="flex items-center gap-2 font-bold text-sm tracking-wide transition-all duration-300 hover:scale-105"
          style={{ color: "var(--accent-cyan)" }}
        >
          <Shield size={19} />
          <span className="hidden sm:inline">Level Shield</span>
        </a>

        {/* Nav Links */}
        <nav className="flex items-center gap-7 text-sm">
          {[
            { label: "Product", href: "/" },
            { label: "Compensation", href: "/compensation" },
            { label: "Compare", href: "/compare", active: true },
            { label: "Community", href: "/community" },
            { label: "Shield Dashboard", href: "/shield" },
          ].map((item) =>
            item.active ? (
              <span
                key={item.label}
                className="relative text-white font-semibold pb-1"
                style={{ textShadow: "0 0 20px rgba(14,165,233,0.4)" }}
              >
                {item.label}
                <span
                  className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                  style={{
                    background: "linear-gradient(90deg, var(--accent-cyan), var(--accent-purple))",
                    boxShadow: "0 0 8px rgba(14,165,233,0.7)",
                  }}
                />
              </span>
            ) : (
              <a
                key={item.label}
                href={item.href}
                className="font-medium transition-all duration-300"
                style={{ color: "var(--muted)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
              >
                {item.label}
              </a>
            )
          )}
        </nav>

        {/* Live Badge */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide"
          style={{
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.25)",
            color: "var(--accent-green)",
            boxShadow: "0 0 12px rgba(16,185,129,0.08)",
          }}
        >
          <span className="live-dot" />
          <span className="ml-1">Active</span>
        </div>
      </header>

      {/* ── Main Container ── */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-10 flex flex-col gap-7">

        {/* Page Header */}
        <div className="flex flex-col gap-1.5">
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <span
              className="p-2 rounded-xl"
              style={{
                background: "rgba(14,165,233,0.08)",
                border: "1px solid rgba(14,165,233,0.15)",
              }}
            >
              <Scale size={22} style={{ color: "var(--accent-cyan)" }} />
            </span>
            Compare Compensations
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Compare software engineering salary packages side-by-side.{" "}
            <span style={{ color: "rgba(14,165,233,0.6)" }}>Interact with elements to trigger client-side telemetry.</span>
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

        {/* ── Company Selector Card ── */}
        <div
          className="p-6 flex flex-col sm:flex-row gap-6 items-center justify-between rounded-2xl"
          style={{
            background: "rgba(15,23,42,0.55)",
            border: "1px solid rgba(255,255,255,0.05)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 0 30px rgba(14,165,233,0.05)",
          }}
        >
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {/* Company A Selector */}
            <div className="flex flex-col gap-1 flex-1 sm:flex-none">
              <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(148,163,184,0.5)" }}>
                Company A
              </label>
              <select
                value={companyA}
                onChange={(e) => {
                  if (e.target.value !== companyB) setCompanyA(e.target.value);
                }}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold cursor-pointer font-sans transition-all duration-300 w-full sm:w-44"
                style={selectStyle}
              >
                {availableCompanies.map((c) => (
                  <option key={c} value={c} disabled={c === companyB}>{c}</option>
                ))}
              </select>
            </div>

            {/* VS Divider */}
            <div
              className="flex items-center justify-center w-9 h-9 rounded-full text-xs font-extrabold tracking-wider self-end mb-0.5"
              style={{
                background: "rgba(139,92,246,0.1)",
                border: "1px solid rgba(139,92,246,0.25)",
                color: "var(--accent-purple)",
              }}
            >
              VS
            </div>

            {/* Company B Selector */}
            <div className="flex flex-col gap-1 flex-1 sm:flex-none">
              <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(148,163,184,0.5)" }}>
                Company B
              </label>
              <select
                value={companyB}
                onChange={(e) => {
                  if (e.target.value !== companyA) setCompanyB(e.target.value);
                }}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold cursor-pointer font-sans transition-all duration-300 w-full sm:w-44"
                style={selectStyle}
              >
                {availableCompanies.map((c) => (
                  <option key={c} value={c} disabled={c === companyA}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div
            className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg"
            style={{
              background: "rgba(16,185,129,0.05)",
              border: "1px solid rgba(16,185,129,0.12)",
              color: "var(--accent-green)",
            }}
          >
            <Sparkles size={13} />
            <span>Hover chart bars to analyze data.</span>
          </div>
        </div>

        {/* ── Comparison Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Chart Column (2/3) */}
          <div
            className="md:col-span-2 p-6 rounded-2xl flex flex-col gap-5"
            style={{
              background: "rgba(10,16,30,0.65)",
              border: "1px solid rgba(255,255,255,0.05)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 25px 50px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            <div>
              <h2
                className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-white"
              >
                <TrendingUp size={15} style={{ color: "var(--accent-cyan)" }} />
                Standardized Total Compensation (USD)
              </h2>
              <p className="text-[11px] mt-1" style={{ color: "var(--muted)" }}>
                Aggregated statistics based on leveling standards.
              </p>
            </div>

            <div className="h-72 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,41,59,0.6)" vertical={false} />
                  <XAxis
                    dataKey="levelCategory"
                    tick={{ fill: "#475569", fontSize: 9 }}
                    stroke="rgba(30,41,59,0.4)"
                    tickLine={false}
                    axisLine={{ stroke: "rgba(30,41,59,0.4)" }}
                  />
                  <YAxis
                    tick={{ fill: "#475569", fontSize: 10 }}
                    stroke="rgba(30,41,59,0.4)"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${v/1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(8,13,26,0.95)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 12,
                      fontSize: 11,
                      color: "#fff",
                      backdropFilter: "blur(16px)",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                    }}
                    cursor={{ fill: "rgba(14,165,233,0.04)" }}
                    formatter={(value) => [`$${Number(value).toLocaleString()}`]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 11, paddingTop: 16, color: "#94a3b8" }}
                  />
                  <Bar dataKey={companyA} fill="var(--accent-cyan)" radius={[6, 6, 0, 0]} opacity={0.85} />
                  <Bar dataKey={companyB} fill="var(--accent-green)" radius={[6, 6, 0, 0]} opacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Shield Insights Column — Cybersecurity Alert Card */}
          <div
            className="p-6 rounded-2xl flex flex-col justify-between"
            style={{
              background: "rgba(10,16,30,0.65)",
              border: "1px solid rgba(255,255,255,0.05)",
              borderLeft: "3px solid rgba(245,158,11,0.7)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 25px 50px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04), -4px 0 20px rgba(245,158,11,0.04)",
            }}
          >
            {/* Header */}
            <div className="flex flex-col gap-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle size={14} style={{ color: "var(--accent-yellow)" }} />
                  <h2
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: "var(--accent-yellow)" }}
                  >
                    Shield Insights
                  </h2>
                </div>
                <div
                  className="h-[1px] w-full mt-2"
                  style={{ background: "linear-gradient(90deg, rgba(245,158,11,0.3), transparent)" }}
                />
              </div>

              {/* Max Leverage Insight */}
              <div
                className="p-4 rounded-xl flex flex-col gap-2"
                style={{
                  background: "rgba(245,158,11,0.04)",
                  border: "1px solid rgba(245,158,11,0.1)",
                }}
              >
                <span className="text-xs font-bold text-white">Max Leverage Difference</span>
                <p className="text-[11px] leading-relaxed" style={{ color: "var(--muted)" }}>
                  Largest salary gap across comparable levels:
                </p>
                <span
                  className="font-mono font-extrabold text-xl tracking-wide"
                  style={{
                    color: "var(--accent-yellow)",
                    textShadow: "0 0 20px rgba(245,158,11,0.4)",
                  }}
                >
                  ${maxDiff.toLocaleString()}
                </span>
              </div>

              {/* Behavior Logging Insight */}
              <div
                className="p-4 rounded-xl flex flex-col gap-2"
                style={{
                  background: "rgba(14,165,233,0.03)",
                  border: "1px solid rgba(14,165,233,0.08)",
                }}
              >
                <span className="text-xs font-bold text-white">Behavior Cadence Logging</span>
                <p className="text-[11px] leading-relaxed" style={{ color: "var(--muted)" }}>
                  Chart hover counts and mouse velocities are currently being analyzed by our client telemetry engine.
                </p>
              </div>
            </div>

            {/* Session Status Footer */}
            <div
              className="mt-4 pt-4 flex items-center justify-between text-xs"
              style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
            >
              <span style={{ color: "var(--muted)" }}>Session Status:</span>
              <span className="badge badge-allow">Allowed</span>
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer 
        className="py-5 border-t text-center text-[11px] tracking-wide"
        style={{
          borderColor: "rgba(255,255,255,0.04)",
          background: "rgba(8,13,26,0.5)",
          color: "rgba(148,163,184,0.4)",
        }}
      >
        <span>Level Shield Firewall Active • Synthetic Salary Model</span>
      </footer>
    </div>
  );
}
