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
    <div className="min-h-screen flex flex-col justify-between" style={{ background: "var(--background)" }}>
      {/* Top Nav */}
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
          <span className="ml-2">Active</span>
        </div>
      </header>

      {/* Main Catalog View */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Software Engineer Compensations</h1>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Explore software engineering job levels and compensation numbers. Real-time anti-scrape protection active.
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

        {/* Search & Filter Bar */}
        <div className="glass-card p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-2 bg-black/30 border rounded-lg px-3 py-1.5 w-full md:max-w-xs" style={{ borderColor: "var(--border)" }}>
            <Search size={14} style={{ color: "var(--muted)" }} />
            <input 
              type="text" 
              placeholder="Search directory..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-0 outline-none text-xs text-white placeholder-gray-500 w-full font-sans"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
            <div className="flex items-center gap-1 text-xs" style={{ color: "var(--muted)" }}>
              <SlidersHorizontal size={12} />
              <span>Filters:</span>
            </div>

            <select 
              value={filterRole} 
              onChange={(e) => setFilterRole(e.target.value)}
              className="bg-opacity-50 border rounded-md px-3 py-1.5 text-xs text-white cursor-pointer font-sans"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <option value="all">All Roles</option>
              <option value="Software Engineer">Software Engineer</option>
              <option value="Senior">Senior Only</option>
            </select>

            <select 
              value={filterLocation} 
              onChange={(e) => setFilterLocation(e.target.value)}
              className="bg-opacity-50 border rounded-md px-3 py-1.5 text-xs text-white cursor-pointer font-sans"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <option value="all">All Locations</option>
              {locations.filter(l => l !== "all").map(l => (
                <option key={l} value={l}>{l.split(",")[0]}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--border)", background: "rgba(13,26,46,0.5)", color: "var(--muted)" }}>
                  <th className="py-3 px-4 font-semibold cursor-pointer select-none hover:text-white" onClick={() => toggleSort("company")}>
                    Company {sortField === "company" && (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th className="py-3 px-4 font-semibold">Level & Title</th>
                  <th className="py-3 px-4 font-semibold text-right cursor-pointer select-none hover:text-white" onClick={() => toggleSort("totalComp")}>
                    Total Comp {sortField === "totalComp" && (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th className="py-3 px-4 font-semibold text-right">Base / Stock / Bonus</th>
                  <th className="py-3 px-4 font-semibold cursor-pointer select-none hover:text-white" onClick={() => toggleSort("experience")}>
                    Exp {sortField === "experience" && (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th className="py-3 px-4 font-semibold">Location</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-xs" style={{ color: "var(--muted)" }}>
                      No compensations matched your search parameters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => (
                    <tr 
                      key={s.id} 
                      className="border-b hover:bg-white/5 transition-colors duration-150 cursor-pointer"
                      style={{ 
                        borderColor: "var(--border)",
                        // Draw yellow canary highlight for demo visualization
                        background: s.isCanary ? "rgba(255, 215, 0, 0.04)" : "transparent"
                      }}
                      onClick={() => router.push(`/company/${s.company.toLowerCase()}`)}
                    >
                      <td className="py-3.5 px-4 font-bold text-white flex items-center gap-1.5">
                        {s.company}
                        {s.isCanary && (
                          <span 
                            className="px-1.5 py-0.5 rounded text-[8px] font-mono tracking-wider font-extrabold uppercase"
                            style={{ background: "rgba(255,215,0,0.15)", color: "var(--accent-yellow)", border: "1px solid rgba(255,215,0,0.3)" }}
                            title="This fake row is injected as a telemetry canary token! If scraped, it attributes data leakage."
                          >
                            Canary Token
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-white">{s.level}</span>
                          <span className="text-[10px]" style={{ color: "var(--muted)" }}>{s.title}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold" style={{ color: s.isCanary ? "var(--accent-yellow)" : "var(--accent-green)" }}>
                        {s.totalComp}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-[10px]" style={{ color: "var(--muted)" }}>
                        {s.base} / {s.stock} / {s.bonus}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {s.experience}
                      </td>
                      <td className="py-3.5 px-4" style={{ color: "var(--muted)" }}>
                        {s.location}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <ChevronRight size={12} style={{ color: "var(--muted)" }} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer 
        className="py-4 border-t text-center text-xs mt-12" 
        style={{ borderColor: "var(--border)", background: "rgba(13,26,46,0.3)", color: "var(--muted)" }}
      >
        <span>Level Shield Firewall Catalog Security Active</span>
      </footer>
    </div>
  );
}

export default function CompensationDirectory() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center animate-pulse" style={{ background: "var(--background)" }}>
        <div className="text-xs" style={{ color: "var(--muted)" }}>Initializing Compensation Catalog...</div>
      </div>
    }>
      <CompensationDirectoryContent />
    </Suspense>
  );
}

