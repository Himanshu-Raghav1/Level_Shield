"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Shield, Search, SlidersHorizontal, ChevronRight } from "lucide-react";
import { mockSalaries, SalaryRecord, mockCanaryTokens } from "@/data/mock";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
      <Navbar />

      {/* ── Main Content — centred ── */}
      <div style={{ display: "flex", justifyContent: "center", width: "100%", flex: 1 }}>
        <main className="w-full px-6 py-8 flex flex-col gap-6" style={{ maxWidth: "1024px" }}>

        {/* Page heading */}
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-foreground">Software Engineer Compensations</h1>
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
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
          >
            <Search size={13} style={{ color: "var(--muted)", flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search company, title, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none w-full text-xs text-foreground"
              style={{ caretColor: "var(--accent)" }}
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
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--foreground)" }}
            >
              <option value="all">All Roles</option>
              <option value="Software Engineer">Software Engineer</option>
              <option value="Senior">Senior Only</option>
            </select>

            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="rounded-md px-3 py-1.5 text-xs outline-none cursor-pointer"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--foreground)" }}
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
          <table className="w-full text-xs border-collapse" style={{ tableLayout: "fixed", width: "100%" }}>
            <thead>
              <tr style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
                <th
                  className="py-2.5 px-4 text-left font-semibold cursor-pointer select-none whitespace-nowrap"
                  style={{ color: "var(--muted)", width: "16%" }}
                  onClick={() => toggleSort("company")}
                >
                  Company {sortField === "company" && <span className="text-accent">{sortOrder === "asc" ? "↑" : "↓"}</span>}
                </th>
                <th className="py-2.5 px-4 text-left font-semibold" style={{ color: "var(--muted)", width: "24%" }}>
                  Level / Title
                </th>
                <th
                  className="py-2.5 px-4 text-right font-semibold cursor-pointer select-none whitespace-nowrap"
                  style={{ color: "var(--muted)", width: "12%" }}
                  onClick={() => toggleSort("totalComp")}
                >
                  Total Comp {sortField === "totalComp" && <span className="text-accent">{sortOrder === "asc" ? "↑" : "↓"}</span>}
                </th>
                <th className="py-2.5 px-4 text-right font-semibold whitespace-nowrap" style={{ color: "var(--muted)", width: "10%" }}>Base</th>
                <th className="py-2.5 px-4 text-right font-semibold whitespace-nowrap" style={{ color: "var(--muted)", width: "16%" }}>Stock / Bonus</th>
                <th
                  className="py-2.5 px-4 text-left font-semibold cursor-pointer select-none"
                  style={{ color: "var(--muted)", width: "8%" }}
                  onClick={() => toggleSort("experience")}
                >
                  Exp {sortField === "experience" && <span className="text-accent">{sortOrder === "asc" ? "↑" : "↓"}</span>}
                </th>
                <th className="py-2.5 px-4 text-left font-semibold" style={{ color: "var(--muted)", width: "12%" }}>Location</th>
                <th className="py-2.5 px-4 text-right" style={{ width: "2%" }} />
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
                      className="cursor-pointer transition-colors duration-100 group border-b border-border-custom"
                      style={{
                        background: s.isCanary ? "var(--accent-muted)" : "transparent",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "var(--surface-2)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = s.isCanary ? "var(--accent-muted)" : "transparent"; }}
                      onClick={() => router.push(`/company/${s.company.toLowerCase()}`)}
                  >
                    <td className="py-2.5 px-4 font-semibold whitespace-nowrap text-foreground" style={{ width: "16%", overflow: "hidden", textOverflow: "ellipsis" }}>
                      <span className="flex items-center gap-2">
                        {s.company}
                        {s.isCanary && (
                          <span
                            className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border"
                            style={{ background: "var(--accent-muted)", borderColor: "var(--border-bright)", color: "var(--accent)" }}
                          >
                            canary
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="py-2.5 px-4" style={{ width: "24%", overflow: "hidden", textOverflow: "ellipsis" }}>
                      <span className="font-semibold text-foreground">{s.level}</span>
                      <span className="ml-2" style={{ color: "var(--muted)" }}>{s.title}</span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums font-bold whitespace-nowrap"
                      style={{ color: "var(--foreground)", width: "12%" }}>
                      {s.totalComp}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums whitespace-nowrap" style={{ color: "var(--muted)", width: "10%" }}>
                      {s.base}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums whitespace-nowrap" style={{ color: "var(--muted)", width: "16%" }}>
                      {s.stock} / {s.bonus}
                    </td>
                    <td className="py-2.5 px-4 tabular-nums" style={{ color: "var(--muted)", width: "8%" }}>{s.experience}</td>
                    <td className="py-2.5 px-4" style={{ color: "var(--muted)", width: "12%", overflow: "hidden", textOverflow: "ellipsis" }}>{s.location}</td>
                    <td className="py-2.5 px-4 text-right" style={{ width: "2%" }}>
                      <ChevronRight size={12} style={{ color: "var(--border)" }} className="group-hover:text-accent transition-colors" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>

      {/* ── Footer ── */}
      <Footer />
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
