"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Shield, Search, SlidersHorizontal, ArrowRight, ArrowUpDown, ChevronRight } from "lucide-react";
import { mockSalaries, SalaryRecord, mockCanaryTokens } from "@/data/mock";

function CompensationDirectoryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialSearch = searchParams.get("search") || "";

  const [search, setSearch] = useState(initialSearch);
  const [filterRole, setFilterRole] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const [sortField, setSortField] = useState<"company" | "totalComp" | "experience">("company");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Telemetry page view beacon
  useEffect(() => {
    fetch("/api/events/page-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: "/compensation", timestamp: new Date().toISOString() })
    }).catch(() => {});
  }, []);

  // Filter salaries + dynamic canary row injection!
  const getFilteredSalaries = (): SalaryRecord[] => {
    let list = [...mockSalaries];

    // Inject Canary Token as a fake row if there are search matches (simulates active trap exfiltration)
    const activeCanary = mockCanaryTokens[0];
    if (activeCanary) {
      list.push({
        id: activeCanary.tokenId,
        company: activeCanary.company,
        level: "L6-Decoy",
        title: "Senior Security Architect",
        base: activeCanary.fakeSalary,
        stock: "$120,000",
        bonus: "$60,000",
        totalComp: activeCanary.fakeSalary,
        location: "Remote, US",
        experience: "8 yrs",
        isCanary: true
      });
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) => 
          s.company.toLowerCase().includes(q) || 
          s.title.toLowerCase().includes(q) ||
          s.location.toLowerCase().includes(q)
      );
    }

    if (filterRole !== "all") {
      list = list.filter((s) => s.title.toLowerCase().includes(filterRole.toLowerCase()));
    }

    if (filterLocation !== "all") {
      list = list.filter((s) => s.location.includes(filterLocation));
    }

    // Sorting logic
    list.sort((a, b) => {
      let valA: string | number = a[sortField];
      let valB: string | number = b[sortField];

      if (sortField === "totalComp") {
        valA = parseInt(a.totalComp.replace(/[$,]/g, "")) || 0;
        valB = parseInt(b.totalComp.replace(/[$,]/g, "")) || 0;
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  };

  const toggleSort = (field: "company" | "totalComp" | "experience") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const filtered = getFilteredSalaries();

  // Distinct roles/locations for filters
  const roles = ["all", "Software Engineer", "Senior"];
  const locations = ["all", "Mountain View, CA", "New York, NY", "Menlo Park, CA", "Seattle, WA", "Cupertino, CA", "San Francisco, CA", "Los Gatos, CA"];

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
            { label: "Compensation", href: "/compensation", active: true },
            { label: "Compare", href: "/compare" },
            { label: "Community", href: "/community" },
            { label: "Shield Dashboard", href: "/shield" },
          ].map((item) =>
            item.active ? (
              <span
                key={item.label}
                className="relative text-white font-semibold pb-1"
                style={{
                  textShadow: "0 0 20px rgba(14,165,233,0.4)",
                }}
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
                className="transition-all duration-300 font-medium"
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

      {/* ── Main Catalog View ── */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-10 flex flex-col gap-7">
        {/* Page Header */}
        <div className="flex flex-col gap-1.5">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Software Engineer Compensations
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Explore software engineering job levels and compensation numbers.{" "}
            <span style={{ color: "rgba(14,165,233,0.6)" }}>Real-time anti-scrape protection active.</span>
          </p>
        </div>

        {/* ─── Trap Layer: Hidden Bot Honeypot Decoy Link ─── */}
        {/* Real users cannot see this link because opacity is 0 and it has no dimensions, but scrapers parsing HTML will trigger the honeypot link */}
        <a 
          href="/maze/decoy_directory_trap_beacon" 
          style={{ opacity: 0, position: "absolute", width: 0, height: 0, zIndex: -999 }}
          tabIndex={-1}
          aria-hidden="true"
        >
          View Unlimited Hidden Compensation Ranges
        </a>

        {/* ── Search & Filter Bar ── */}
        <div
          className="p-4 flex flex-col md:flex-row gap-3 items-center justify-between rounded-2xl"
          style={{
            background: "rgba(15,23,42,0.55)",
            border: "1px solid rgba(255,255,255,0.05)",
            backdropFilter: "blur(16px)",
          }}
        >
          {/* Search Input */}
          <div
            className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 w-full md:max-w-xs transition-all duration-300"
            style={{
              background: "rgba(8,13,26,0.6)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
            onFocusCapture={(e) => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.border = "1px solid rgba(14,165,233,0.45)";
              el.style.boxShadow = "0 0 16px rgba(14,165,233,0.12)";
            }}
            onBlurCapture={(e) => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.border = "1px solid rgba(255,255,255,0.07)";
              el.style.boxShadow = "none";
            }}
          >
            <Search size={13} style={{ color: "var(--muted)", flexShrink: 0 }} />
            <input 
              type="text" 
              placeholder="Search directory..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-0 outline-none text-xs text-white placeholder-slate-600 w-full font-sans"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(148,163,184,0.6)" }}>
              <SlidersHorizontal size={11} />
              <span className="font-medium tracking-wide text-[11px] uppercase">Filters</span>
            </div>

            {/* Role Select */}
            <select 
              value={filterRole} 
              onChange={(e) => setFilterRole(e.target.value)}
              className="rounded-xl px-3.5 py-2 text-xs text-slate-200 cursor-pointer font-sans transition-all duration-300 outline-none"
              style={{
                background: "rgba(15,23,42,0.8)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
              onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(14,165,233,0.4)"; }}
              onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.07)"; }}
            >
              <option value="all">All Roles</option>
              <option value="Software Engineer">Software Engineer</option>
              <option value="Senior">Senior Only</option>
            </select>

            {/* Location Select */}
            <select 
              value={filterLocation} 
              onChange={(e) => setFilterLocation(e.target.value)}
              className="rounded-xl px-3.5 py-2 text-xs text-slate-200 cursor-pointer font-sans transition-all duration-300 outline-none"
              style={{
                background: "rgba(15,23,42,0.8)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
              onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(14,165,233,0.4)"; }}
              onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.07)"; }}
            >
              <option value="all">All Locations</option>
              {locations.filter(l => l !== "all").map(l => (
                <option key={l} value={l}>{l.split(",")[0]}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Table View ── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(10,16,30,0.6)",
            border: "1px solid rgba(255,255,255,0.05)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 25px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr
                  style={{
                    background: "rgba(13,26,46,0.7)",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <th
                    className="py-4 px-5 font-semibold uppercase tracking-widest text-[10px] cursor-pointer select-none transition-colors duration-200 hover:text-white"
                    style={{ color: "rgba(148,163,184,0.7)" }}
                    onClick={() => toggleSort("company")}
                  >
                    <span className="flex items-center gap-1.5">
                      Company {sortField === "company" && <span className="text-cyan-400">{sortOrder === "asc" ? "↑" : "↓"}</span>}
                    </span>
                  </th>
                  <th
                    className="py-4 px-5 font-semibold uppercase tracking-widest text-[10px]"
                    style={{ color: "rgba(148,163,184,0.7)" }}
                  >
                    Level &amp; Title
                  </th>
                  <th
                    className="py-4 px-5 font-semibold uppercase tracking-widest text-[10px] text-right cursor-pointer select-none transition-colors duration-200 hover:text-white"
                    style={{ color: "rgba(148,163,184,0.7)" }}
                    onClick={() => toggleSort("totalComp")}
                  >
                    <span className="flex items-center justify-end gap-1.5">
                      Total Comp {sortField === "totalComp" && <span className="text-emerald-400">{sortOrder === "asc" ? "↑" : "↓"}</span>}
                    </span>
                  </th>
                  <th
                    className="py-4 px-5 font-semibold uppercase tracking-widest text-[10px] text-right"
                    style={{ color: "rgba(148,163,184,0.7)" }}
                  >
                    Base / Stock / Bonus
                  </th>
                  <th
                    className="py-4 px-5 font-semibold uppercase tracking-widest text-[10px] cursor-pointer select-none transition-colors duration-200 hover:text-white"
                    style={{ color: "rgba(148,163,184,0.7)" }}
                    onClick={() => toggleSort("experience")}
                  >
                    <span className="flex items-center gap-1.5">
                      Exp {sortField === "experience" && <span className="text-cyan-400">{sortOrder === "asc" ? "↑" : "↓"}</span>}
                    </span>
                  </th>
                  <th
                    className="py-4 px-5 font-semibold uppercase tracking-widest text-[10px]"
                    style={{ color: "rgba(148,163,184,0.7)" }}
                  >
                    Location
                  </th>
                  <th className="py-4 px-5" />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-xs" style={{ color: "var(--muted)" }}>
                      <div className="flex flex-col items-center gap-2">
                        <Search size={20} style={{ color: "rgba(148,163,184,0.3)" }} />
                        <span>No compensations matched your search parameters.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((s, i) => (
                    <tr 
                      key={s.id} 
                      className="transition-all duration-200 cursor-pointer group"
                      style={{ 
                        borderTop: i > 0 ? "1px solid rgba(255,255,255,0.035)" : "none",
                        background: s.isCanary ? "rgba(245,158,11,0.03)" : "transparent",
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLTableRowElement;
                        el.style.background = s.isCanary
                          ? "rgba(245,158,11,0.06)"
                          : "rgba(255,255,255,0.03)";
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLTableRowElement;
                        el.style.background = s.isCanary ? "rgba(245,158,11,0.03)" : "transparent";
                      }}
                      onClick={() => router.push(`/company/${s.company.toLowerCase()}`)}
                    >
                      {/* Company + Canary Badge */}
                      <td className="py-4 px-5 font-bold text-white">
                        <div className="flex items-center gap-2">
                          {s.company}
                          {s.isCanary && (
                            <span 
                              className="px-1.5 py-0.5 rounded text-[9px] font-mono tracking-wider font-extrabold uppercase animate-pulse"
                              style={{
                                background: "rgba(245,158,11,0.1)",
                                color: "var(--accent-yellow)",
                                border: "1px solid rgba(245,158,11,0.3)",
                                boxShadow: "0 0 10px rgba(245,158,11,0.12)",
                              }}
                              title="This fake row is injected as a telemetry canary token! If scraped, it attributes data leakage."
                            >
                              🪤 Canary
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Level & Title */}
                      <td className="py-4 px-5">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-white text-xs">{s.level}</span>
                          <span className="text-[10px]" style={{ color: "var(--muted)" }}>{s.title}</span>
                        </div>
                      </td>

                      {/* Total Comp — Emerald Highlighted */}
                      <td className="py-4 px-5 text-right">
                        <span
                          className="font-mono font-extrabold text-[13px] tracking-wide"
                          style={{
                            color: s.isCanary ? "var(--accent-yellow)" : "var(--accent-green)",
                            textShadow: s.isCanary
                              ? "0 0 16px rgba(245,158,11,0.35)"
                              : "0 0 16px rgba(16,185,129,0.3)",
                          }}
                        >
                          {s.totalComp}
                        </span>
                      </td>

                      {/* Base / Stock / Bonus */}
                      <td className="py-4 px-5 text-right font-mono text-[10px]" style={{ color: "var(--muted)" }}>
                        <div className="flex flex-col items-end gap-0.5">
                          <span>{s.base}</span>
                          <span style={{ color: "rgba(148,163,184,0.5)" }}>{s.stock} / {s.bonus}</span>
                        </div>
                      </td>

                      {/* Experience */}
                      <td className="py-4 px-5 font-semibold text-white text-xs">{s.experience}</td>

                      {/* Location */}
                      <td className="py-4 px-5 text-xs" style={{ color: "var(--muted)" }}>{s.location}</td>

                      {/* Chevron */}
                      <td className="py-4 px-5 text-right">
                        <ChevronRight
                          size={13}
                          className="transition-all duration-200 group-hover:translate-x-0.5"
                          style={{ color: "rgba(148,163,184,0.4)" }}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Row Count */}
        {filtered.length > 0 && (
          <p className="text-[11px] text-right" style={{ color: "rgba(148,163,184,0.4)" }}>
            Showing <span className="text-slate-300 font-semibold">{filtered.length}</span> records
          </p>
        )}
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
        <span>Level Shield Firewall Catalog Security Active</span>
      </footer>
    </div>
  );
}

export default function CompensationDirectory() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 rounded-full animate-spin"
            style={{ border: "2px solid rgba(14,165,233,0.15)", borderTopColor: "var(--accent-cyan)" }}
          />
          <div className="text-xs" style={{ color: "var(--muted)" }}>Initializing Compensation Catalog...</div>
        </div>
      </div>
    }>
      <CompensationDirectoryContent />
    </Suspense>
  );
}
