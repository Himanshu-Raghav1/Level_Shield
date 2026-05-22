"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, ChevronLeft, Building2, MapPin, Database, Award, ArrowUpRight, Lock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { mockSalaries, SalaryRecord, mockCanaryTokens } from "@/data/mock";

interface CompanyPageProps {
  params: Promise<{ slug: string }>;
}

export default function CompanyDetail({ params }: CompanyPageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Silent Telemetry Page View
    fetch("/api/events/page-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: `/company/${slug}`, timestamp: new Date().toISOString() })
    }).catch(() => {});
  }, [slug]);

  if (!mounted) return null;

  // Format slug for search/match (e.g. google -> Google, meta -> Meta)
  const normalizedSlug = slug.toLowerCase();
  const companyName = normalizedSlug.charAt(0).toUpperCase() + normalizedSlug.slice(1);

  // Filter salaries for this company
  let companyRows = mockSalaries.filter(
    (s) => s.company.toLowerCase() === normalizedSlug
  );

  // Fallback: If no company found in mock, create synthetic rows so we never show empty screens
  if (companyRows.length === 0) {
    companyRows = [
      { id: "sal_syn_1", company: companyName, level: "L3", title: "Software Engineer", base: "$130,000", stock: "$25,000", bonus: "$10,000", totalComp: "$165,000", location: "Remote, US", experience: "1 yr" },
      { id: "sal_syn_2", company: companyName, level: "L4", title: "Software Engineer II", base: "$160,000", stock: "$45,000", bonus: "$18,000", totalComp: "$223,000", location: "Remote, US", experience: "3 yrs" },
      { id: "sal_syn_3", company: companyName, level: "L5", title: "Senior Software Engineer", base: "$195,000", stock: "$80,000", bonus: "$25,000", totalComp: "$300,000", location: "Remote, US", experience: "5 yrs" }
    ];
  }

  // Inject Canary Salary row
  const activeCanary = mockCanaryTokens.find(c => c.company.toLowerCase() === normalizedSlug) || {
    tokenId: `canary_row_${normalizedSlug}`,
    company: companyName,
    fakeSalary: "$680,000",
    exposedAt: new Date().toISOString(),
    sessionId: "sess_temp_canary"
  };

  const canaryRow: SalaryRecord = {
    id: activeCanary.tokenId,
    company: activeCanary.company,
    level: "L8-Decoy",
    title: "Principal Security Architect",
    base: activeCanary.fakeSalary,
    stock: "$220,000",
    bonus: "$80,000",
    totalComp: activeCanary.fakeSalary,
    location: "Remote, US",
    experience: "10 yrs",
    isCanary: true
  };

  // Combine rows
  const allRows = [...companyRows, canaryRow];

  // Parse chart data from real & canary rows
  const chartData = allRows.map((r) => {
    const baseVal = parseInt(r.base.replace(/[$,]/g, "")) || 0;
    const stockVal = parseInt(r.stock.replace(/[$,]/g, "")) || 0;
    const bonusVal = parseInt(r.bonus.replace(/[$,]/g, "")) || 0;
    return {
      level: r.level,
      Base: baseVal,
      Stock: stockVal,
      Bonus: bonusVal,
      Total: baseVal + stockVal + bonusVal,
      isCanary: r.isCanary
    };
  }).sort((a, b) => a.Total - b.Total);

  // Compute metrics
  const avgSalary = Math.round(
    chartData.reduce((sum, r) => sum + r.Total, 0) / chartData.length
  );
  const maxSalary = Math.max(...chartData.map((r) => r.Total));

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
          <a href="/compare" className="hover:text-white transition-colors">Compare</a>
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
        {/* Navigation Breadcrumb */}
        <div>
          <button
            onClick={() => router.push("/compensation")}
            className="flex items-center gap-1.5 text-xs transition-colors hover:text-white mb-4 cursor-pointer"
            style={{ color: "var(--muted)" }}
          >
            <ChevronLeft size={14} />
            Back to Compensation Directory
          </button>
        </div>

        {/* ─── Trap Layer: Hidden Bot Honeypot Decoy Link ─── */}
        <a 
          href={`/maze/decoy_company_${normalizedSlug}_trap_beacon`} 
          style={{ opacity: 0, position: "absolute", width: 0, height: 0, zIndex: -999 }}
          tabIndex={-1}
          aria-hidden="true"
        >
          View Complete Leveling Matrix details and stock vesting schedule for {companyName}
        </a>

        {/* Company Header Block */}
        <div className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 glow-cyan">
          <div className="flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-lg flex items-center justify-center border"
              style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
            >
              <Building2 size={28} style={{ color: "var(--accent-cyan)" }} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
                {companyName}
                <span className="text-xs font-semibold px-2 py-0.5 rounded border uppercase tracking-wider" style={{ background: "rgba(0, 212, 255, 0.1)", color: "var(--accent-cyan)", borderColor: "rgba(0, 212, 255, 0.3)" }}>
                  Verified
                </span>
              </h1>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                Software Engineer leveling structure and breakdown stats.
              </p>
            </div>
          </div>

          <div className="flex gap-4 flex-wrap">
            <div className="bg-black/35 px-4 py-2.5 rounded-lg border text-left" style={{ borderColor: "var(--border)" }}>
              <span className="text-[10px] block uppercase tracking-wider font-semibold" style={{ color: "var(--muted)" }}>Average Comp</span>
              <span className="text-lg font-bold font-mono" style={{ color: "var(--accent-green)" }}>
                ${avgSalary.toLocaleString()}
              </span>
            </div>
            <div className="bg-black/35 px-4 py-2.5 rounded-lg border text-left" style={{ borderColor: "var(--border)" }}>
              <span className="text-[10px] block uppercase tracking-wider font-semibold" style={{ color: "var(--muted)" }}>Max Level Comp</span>
              <span className="text-lg font-bold font-mono" style={{ color: "var(--accent-yellow)" }}>
                ${maxSalary.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Chart and Detail Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Recharts Stacking Bar Chart */}
          <div className="glass-card p-5 flex flex-col gap-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Award size={14} style={{ color: "var(--accent-cyan)" }} />
                Level Salary Distribution
              </h2>
              <p className="text-[10px]" style={{ color: "var(--muted)" }}>
                Total breakdown showing Base, Stock, and Bonus combinations.
              </p>
            </div>

            <div className="h-64 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c3050" />
                  <XAxis dataKey="level" tick={{ fill: "#64748b", fontSize: 10 }} stroke="#1c3050" />
                  <YAxis tick={{ fill: "#64748b", fontSize: 10 }} stroke="#1c3050" tickFormatter={(v) => `$${v/1000}k`} />
                  <Tooltip 
                    contentStyle={{ background: "#0d1a2e", border: "1px solid #1c3050", borderRadius: 8, fontSize: 11 }}
                    formatter={(value) => [`$${Number(value).toLocaleString()}`]}
                  />
                  <Legend wrapperStyle={{ fontSize: 9, paddingTop: 10 }} />
                  <Bar dataKey="Base" stackId="a" fill="#00ff88" />
                  <Bar dataKey="Stock" stackId="a" fill="#00d4ff" />
                  <Bar dataKey="Bonus" stackId="a" fill="#a855f7" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Column: Mini Salary Detail Table */}
          <div className="glass-card p-5 flex flex-col justify-between">
            <div className="flex flex-col gap-1 mb-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Database size={14} style={{ color: "var(--accent-green)" }} />
                Active Salary Database
              </h2>
              <p className="text-[10px]" style={{ color: "var(--muted)" }}>
                All records matching {companyName}. Active canary detection layer applied.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
                    <th className="py-2 px-3 font-semibold">Level</th>
                    <th className="py-2 px-3 font-semibold">Experience</th>
                    <th className="py-2 px-3 font-semibold text-right">Base / Stock</th>
                    <th className="py-2 px-3 font-semibold text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {allRows.map((r) => (
                    <tr 
                      key={r.id} 
                      className="border-b hover:bg-white/5 transition-colors"
                      style={{ 
                        borderColor: "var(--border)",
                        background: r.isCanary ? "rgba(255, 215, 0, 0.04)" : "transparent"
                      }}
                    >
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-white flex items-center gap-1">
                            {r.level}
                            {r.isCanary && (
                              <span title="Decoy Canary Token Injected">
                                <Lock size={10} style={{ color: "var(--accent-yellow)" }} />
                              </span>
                            )}
                          </span>
                          <span className="text-[9px]" style={{ color: "var(--muted)" }}>{r.title}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-white">{r.experience}</td>
                      <td className="py-3 px-3 text-right font-mono text-[10px]" style={{ color: "var(--muted)" }}>
                        {r.base} / {r.stock}
                      </td>
                      <td className="py-3 px-3 text-right font-bold font-mono" style={{ color: r.isCanary ? "var(--accent-yellow)" : "var(--accent-green)" }}>
                        {r.totalComp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center gap-2 text-[10px] bg-[#112033]/50 p-2.5 rounded-lg border border-yellow-500/20 text-yellow-500/90 font-mono">
              <Lock size={12} className="flex-shrink-0" />
              <span>Canary signature active. Scraping is traced back to specific sessions.</span>
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
