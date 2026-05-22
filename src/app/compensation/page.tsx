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

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>

      {/* ── Top Nav — matches homepage exactly ── */}
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
          <span className="text-white border-b-2 pb-0.5" style={{ borderColor: "var(--accent-cyan)" }}>Compensation</span>
          <a href="/compare" className="hover:text-white transition-colors">Compare</a>
          <a href="/community" className="hover:text-white transition-colors">Community</a>
          <a href="/shield" className="hover:text-white transition-colors">Shield Dashboard</a>
        </nav>

        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--accent-green)" }}>
          <span className="live-dot" />
          <span className="ml-2">System Active</span>
        </div>
      </header>

      {/* ── Main Content — centred ── */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8 flex flex-col gap-6">

        {/* Page heading */}
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-white">Software Engineer Compensations</h1>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Explore engineering job levels and total compensation. Real-time anti-scrape protection active.
          </p>
        </div>

        {/* ─── Trap Layer: Hidden Bot Honeypot Decoy Link ─── */}
        <a
          href="/maze/decoy_directory_trap_beacon"
          style={{ opacity: 0, position: "absolute", width: 0, height: 0, zIndex: -999 }}
          tabIndex={-1}
          aria-hidden="true"
        >
          View Unlimited Hidden Compensation Ranges
        </a>

        {/* ── Filter Bar ── */}
        <div
          className="flex flex-col sm:flex-row gap-3 items-start sm:items-center p-4 rounded-lg"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          {/* Search input */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-md w-full sm:w-72"
            style={{ background: "rgba(0,0,0,0.3)", border: "1px solid var(--border)" }}
          >
            <Search size={13} style={{ color: "var(--muted)", flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search company, title, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none w-full text-xs text-white"
              style={{ caretColor: "var(--accent-cyan)" }}
            />
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-5" style={{ background: "var(--border)" }} />

          {/* Filter controls */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted)" }}>
              <SlidersHorizontal size={11} />
              Filter:
            </span>

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="rounded-md px-3 py-1.5 text-xs outline-none cursor-pointer"
              style={{ background: "rgba(0,0,0,0.3)", border: "1px solid var(--border)", color: "#e4e4e7" }}
            >
              <option value="all">All Roles</option>
              <option value="Software Engineer">Software Engineer</option>
              <option value="Senior">Senior Only</option>
            </select>

            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="rounded-md px-3 py-1.5 text-xs outline-none cursor-pointer"
              style={{ background: "rgba(0,0,0,0.3)", border: "1px solid var(--border)", color: "#e4e4e7" }}
            >
              <option value="all">All Locations</option>
              {locations.filter((l) => l !== "all").map((l) => (
                <option key={l} value={l}>{l.split(",")[0]}</option>
              ))}
            </select>
          </div>

          <span className="text-xs sm:ml-auto" style={{ color: "var(--muted)" }}>
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* ── Data Table ── */}
        <div className="w-full overflow-x-auto rounded-lg" style={{ border: "1px solid var(--border)" }}>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
                <th
                  className="py-2.5 px-4 text-left font-semibold cursor-pointer select-none whitespace-nowrap"
                  style={{ color: "var(--muted)" }}
                  onClick={() => toggleSort("company")}
                >
                  Company {sortField === "company" && <span className="text-white">{sortOrder === "asc" ? "↑" : "↓"}</span>}
                </th>
                <th className="py-2.5 px-4 text-left font-semibold" style={{ color: "var(--muted)" }}>
                  Level / Title
                </th>
                <th
                  className="py-2.5 px-4 text-right font-semibold cursor-pointer select-none whitespace-nowrap"
                  style={{ color: "var(--muted)" }}
                  onClick={() => toggleSort("totalComp")}
                >
                  Total Comp {sortField === "totalComp" && <span className="text-white">{sortOrder === "asc" ? "↑" : "↓"}</span>}
                </th>
                <th className="py-2.5 px-4 text-right font-semibold whitespace-nowrap" style={{ color: "var(--muted)" }}>Base</th>
                <th className="py-2.5 px-4 text-right font-semibold whitespace-nowrap" style={{ color: "var(--muted)" }}>Stock / Bonus</th>
                <th
                  className="py-2.5 px-4 text-left font-semibold cursor-pointer select-none"
                  style={{ color: "var(--muted)" }}
                  onClick={() => toggleSort("experience")}
                >
                  Exp {sortField === "experience" && <span className="text-white">{sortOrder === "asc" ? "↑" : "↓"}</span>}
                </th>
                <th className="py-2.5 px-4 text-left font-semibold" style={{ color: "var(--muted)" }}>Location</th>
                <th className="py-2.5 px-4 w-6" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs" style={{ color: "var(--muted)" }}>
                    No results matched your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr
                    key={s.id}
                    className="cursor-pointer transition-colors duration-100 group"
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      background: s.isCanary ? "rgba(245,158,11,0.03)" : "transparent",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "var(--surface)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = s.isCanary ? "rgba(245,158,11,0.03)" : "transparent"; }}
                    onClick={() => router.push(`/company/${s.company.toLowerCase()}`)}
                  >
                    <td className="py-2.5 px-4 font-semibold whitespace-nowrap text-white">
                      <span className="flex items-center gap-2">
                        {s.company}
                        {s.isCanary && (
                          <span
                            className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded"
                            style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.25)" }}
                          >
                            canary
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="font-medium text-white">{s.level}</span>
                      <span className="ml-2" style={{ color: "var(--muted)" }}>{s.title}</span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums font-semibold whitespace-nowrap"
                      style={{ color: s.isCanary ? "#f59e0b" : "var(--accent-green)" }}>
                      {s.totalComp}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums whitespace-nowrap" style={{ color: "var(--muted)" }}>
                      {s.base}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums whitespace-nowrap" style={{ color: "var(--muted)" }}>
                      {s.stock} / {s.bonus}
                    </td>
                    <td className="py-2.5 px-4 tabular-nums" style={{ color: "var(--muted)" }}>{s.experience}</td>
                    <td className="py-2.5 px-4" style={{ color: "var(--muted)" }}>{s.location}</td>
                    <td className="py-2.5 px-4">
                      <ChevronRight size={12} style={{ color: "var(--border)" }} className="group-hover:text-zinc-400 transition-colors" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer
        className="py-4 border-t text-center text-xs"
        style={{ borderColor: "var(--border)", background: "rgba(13,26,46,0.3)", color: "var(--muted)" }}
      >
        Level Shield • Anti-scrape protection active
      </footer>
    </div>
  );
}

export default function CompensationDirectory() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <span className="text-xs" style={{ color: "var(--muted)" }}>Loading...</span>
      </div>
    }>
      <CompensationDirectoryContent />
    </Suspense>
  );
}
