"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Shield, Search, SlidersHorizontal, ChevronRight } from "lucide-react";
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

  const navLinks = [
    { label: "Product", href: "/" },
    { label: "Compensation", href: "/compensation", active: true },
    { label: "Compare", href: "/compare" },
    { label: "Community", href: "/community" },
    { label: "Shield Dashboard", href: "/shield" },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0a0a0a", color: "#e4e4e7" }}>

      {/* ── Top Navigation Bar ── */}
      <header style={{ borderBottom: "1px solid #27272a", background: "#0a0a0a" }}>
        {/* Brand row */}
        <div className="flex items-center justify-between px-6 py-2.5">
          <a href="/" className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: "#e4e4e7" }}>
            <Shield size={15} style={{ color: "#10b981" }} />
            Level Shield
          </a>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "#10b981" }}>
            <span
              style={{
                display: "inline-block",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#10b981",
              }}
            />
            Live
          </div>
        </div>

        {/* Tab row */}
        <nav className="flex items-end px-6 gap-0 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {navLinks.map((item) =>
            item.active ? (
              <span
                key={item.label}
                className="text-xs font-medium px-3 py-2 whitespace-nowrap cursor-default"
                style={{
                  color: "#ffffff",
                  borderBottom: "1px solid #ffffff",
                  marginBottom: -1,
                }}
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

      {/* ── Page Content ── */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-6 flex flex-col gap-4">

        {/* Page title */}
        <div>
          <h1 className="text-sm font-semibold" style={{ color: "#e4e4e7" }}>
            Software Engineer Compensations
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "#71717a" }}>
            Explore engineering job levels and total compensation. Anti-scrape protection active.
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

        {/* ── Filter Bar ── */}
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          {/* Search */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs w-full sm:w-64"
            style={{
              background: "#18181b",
              border: "1px solid #3f3f46",
            }}
          >
            <Search size={12} style={{ color: "#71717a", flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search company, title, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none w-full text-xs"
              style={{ color: "#e4e4e7" }}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1 text-xs" style={{ color: "#52525b" }}>
              <SlidersHorizontal size={11} />
              Filter:
            </span>

            {/* Role */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="rounded-md text-xs px-2.5 py-1.5 outline-none cursor-pointer"
              style={{
                background: "#18181b",
                border: "1px solid #3f3f46",
                color: "#e4e4e7",
              }}
            >
              <option value="all">All Roles</option>
              <option value="Software Engineer">Software Engineer</option>
              <option value="Senior">Senior Only</option>
            </select>

            {/* Location */}
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="rounded-md text-xs px-2.5 py-1.5 outline-none cursor-pointer"
              style={{
                background: "#18181b",
                border: "1px solid #3f3f46",
                color: "#e4e4e7",
              }}
            >
              <option value="all">All Locations</option>
              {locations.filter((l) => l !== "all").map((l) => (
                <option key={l} value={l}>{l.split(",")[0]}</option>
              ))}
            </select>
          </div>

          <span className="text-xs ml-auto hidden sm:block" style={{ color: "#52525b" }}>
            {filtered.length} results
          </span>
        </div>

        {/* ── Full-Width Table ── */}
        <div className="w-full overflow-x-auto" style={{ borderTop: "1px solid #27272a" }}>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid #27272a" }}>
                <th
                  className="py-2 px-3 text-left font-medium cursor-pointer select-none whitespace-nowrap"
                  style={{ color: "#71717a" }}
                  onClick={() => toggleSort("company")}
                >
                  Company{" "}
                  {sortField === "company" && (
                    <span style={{ color: "#a1a1aa" }}>{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </th>
                <th className="py-2 px-3 text-left font-medium" style={{ color: "#71717a" }}>
                  Level / Title
                </th>
                <th
                  className="py-2 px-3 text-right font-medium cursor-pointer select-none whitespace-nowrap"
                  style={{ color: "#71717a" }}
                  onClick={() => toggleSort("totalComp")}
                >
                  Total Comp{" "}
                  {sortField === "totalComp" && (
                    <span style={{ color: "#a1a1aa" }}>{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </th>
                <th className="py-2 px-3 text-right font-medium whitespace-nowrap" style={{ color: "#71717a" }}>
                  Base
                </th>
                <th className="py-2 px-3 text-right font-medium whitespace-nowrap" style={{ color: "#71717a" }}>
                  Stock / Bonus
                </th>
                <th
                  className="py-2 px-3 text-left font-medium cursor-pointer select-none"
                  style={{ color: "#71717a" }}
                  onClick={() => toggleSort("experience")}
                >
                  Exp{" "}
                  {sortField === "experience" && (
                    <span style={{ color: "#a1a1aa" }}>{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </th>
                <th className="py-2 px-3 text-left font-medium" style={{ color: "#71717a" }}>
                  Location
                </th>
                <th className="py-2 px-3 w-6" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-xs" style={{ color: "#52525b" }}>
                    No results matched your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr
                    key={s.id}
                    className="cursor-pointer transition-colors duration-100 group"
                    style={{ borderBottom: "1px solid rgba(39,39,42,0.5)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "rgba(39,39,42,0.5)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = s.isCanary ? "rgba(245,158,11,0.03)" : "transparent"; }}
                    onClick={() => router.push(`/company/${s.company.toLowerCase()}`)}
                  >
                    {/* Company */}
                    <td className="py-2 px-3 font-medium whitespace-nowrap" style={{ color: "#e4e4e7" }}>
                      <span className="flex items-center gap-1.5">
                        {s.company}
                        {s.isCanary && (
                          <span
                            className="text-[9px] font-mono uppercase tracking-wider px-1 py-0.5 rounded"
                            style={{
                              background: "rgba(245,158,11,0.1)",
                              color: "#f59e0b",
                              border: "1px solid rgba(245,158,11,0.25)",
                            }}
                          >
                            canary
                          </span>
                        )}
                      </span>
                    </td>

                    {/* Level + Title */}
                    <td className="py-2 px-3">
                      <span className="font-medium" style={{ color: "#e4e4e7" }}>{s.level}</span>
                      <span className="ml-1.5" style={{ color: "#71717a" }}>{s.title}</span>
                    </td>

                    {/* Total Comp — primary metric */}
                    <td className="py-2 px-3 text-right font-mono tabular-nums font-medium whitespace-nowrap"
                      style={{ color: s.isCanary ? "#f59e0b" : "#10b981" }}>
                      {s.totalComp}
                    </td>

                    {/* Base */}
                    <td className="py-2 px-3 text-right font-mono tabular-nums whitespace-nowrap" style={{ color: "#a1a1aa" }}>
                      {s.base}
                    </td>

                    {/* Stock / Bonus */}
                    <td className="py-2 px-3 text-right font-mono tabular-nums whitespace-nowrap text-xs" style={{ color: "#71717a" }}>
                      {s.stock} / {s.bonus}
                    </td>

                    {/* Experience */}
                    <td className="py-2 px-3 tabular-nums" style={{ color: "#a1a1aa" }}>{s.experience}</td>

                    {/* Location */}
                    <td className="py-2 px-3" style={{ color: "#71717a" }}>{s.location}</td>

                    {/* Arrow */}
                    <td className="py-2 px-3">
                      <ChevronRight size={12} style={{ color: "#3f3f46" }} className="group-hover:text-zinc-500 transition-colors" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="px-6 py-4 text-xs" style={{ borderTop: "1px solid #27272a", color: "#3f3f46" }}>
        Level Shield • Anti-scrape protection active
      </footer>
    </div>
  );
}

export default function CompensationDirectory() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0a" }}>
        <span className="text-xs" style={{ color: "#52525b" }}>Loading...</span>
      </div>
    }>
      <CompensationDirectoryContent />
    </Suspense>
  );
}
