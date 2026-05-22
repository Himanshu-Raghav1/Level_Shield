"use client";

import { useState, useEffect } from "react";
import { Shield, MessageSquare, ThumbsUp, Eye, Search, AlertTriangle, ArrowUpRight } from "lucide-react";

interface ForumThread {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  category: string;
  replies: number;
  likes: number;
  views: number;
  timeAgo: string;
}

const CATEGORY_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  Negotiation: { color: "#a78bfa", bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.2)" },
  Promotions:  { color: "#38bdf8", bg: "rgba(14,165,233,0.08)",  border: "rgba(14,165,233,0.2)"  },
  Compensation:{ color: "#34d399", bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.2)"  },
};

export default function CommunityForum() {
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  // Silent Telemetry Page View
  useEffect(() => {
    setMounted(true);
    fetch("/api/events/page-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: "/community", timestamp: new Date().toISOString() })
    }).catch(() => {});
  }, []);

  if (!mounted) return null;

  const initialThreads: ForumThread[] = [
    {
      id: "thread_1",
      title: "Negotiating Meta IC5 SDE offer in 2026",
      excerpt: "Got a Meta IC5 offer for Menlo Park location. Base is $205k, stock $140k/yr. Can I push for more signing bonus or stock? Current base is $195k...",
      author: "cyber_coder",
      category: "Negotiation",
      replies: 18,
      likes: 42,
      views: 520,
      timeAgo: "2 hours ago",
    },
    {
      id: "thread_2",
      title: "Google L4 -> L5 promotion expectations & salary jump",
      excerpt: "Passed L5 calibration. Expected standard L5 salary is around $360k total comp, but I have other counteroffers. How aggressive is Google's promotion match policy?",
      author: "googly_sys",
      category: "Promotions",
      replies: 24,
      likes: 68,
      views: 790,
      timeAgo: "5 hours ago",
    },
    {
      id: "thread_3",
      title: "New York vs San Francisco Software Engineer base salaries",
      excerpt: "Moving from Manhattan to San Francisco. Is there a cost of living salary reduction or adjustments? Stripe and Google seem to treat locations identically in US...",
      author: "nomad_dev",
      category: "Compensation",
      replies: 35,
      likes: 51,
      views: 1250,
      timeAgo: "1 day ago",
    },
    {
      id: "thread_4",
      title: "Netflix Senior Software Engineer compensation model",
      excerpt: "Is Netflix still offering 100% all-cash salary model for seniors ($450k base)? Or are they starting to bundle stock grants into standard offers?",
      author: "stream_master",
      category: "Compensation",
      replies: 12,
      likes: 30,
      views: 410,
      timeAgo: "3 days ago",
    }
  ];

  const filteredThreads = initialThreads.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.excerpt.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
  );

  const navLinks = [
    { label: "Product",          href: "/" },
    { label: "Compensation",     href: "/compensation" },
    { label: "Compare",          href: "/compare" },
    { label: "Community",        href: "/community", active: true },
    { label: "Shield Dashboard", href: "/shield" },
  ];

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

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-sm font-semibold" style={{ color: "#e4e4e7" }}>
              Community Discussions
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "#71717a" }}>
              Offers, negotiations, leveling. AI scraper telemetry active.
            </p>
          </div>

          {/* Search */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs w-full sm:w-64 flex-shrink-0"
            style={{ background: "#18181b", border: "1px solid #3f3f46" }}
          >
            <Search size={12} style={{ color: "#71717a", flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search discussions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none w-full text-xs"
              style={{ color: "#e4e4e7" }}
            />
          </div>
        </div>

        {/* ─── Trap Layer: Hidden Bot Honeypot Decoy Link ─── */}
        <a
          href="/maze/decoy_community_discussion_trap_beacon"
          style={{ opacity: 0, position: "absolute", width: 0, height: 0, zIndex: -999 }}
          tabIndex={-1}
          aria-hidden="true"
        >
          View Secret Restricted Internal Negotiation Spreadsheets
        </a>

        {/* ── Content Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* ── Thread List (2 cols) ── */}
          <div className="md:col-span-2 flex flex-col">
            {/* Column headers */}
            <div
              className="flex items-center justify-between px-3 py-1.5 text-xs"
              style={{ borderBottom: "1px solid #27272a", color: "#52525b" }}
            >
              <span>Discussion</span>
              <div className="flex items-center gap-5">
                <span className="flex items-center gap-1"><ThumbsUp size={10} /> Likes</span>
                <span className="flex items-center gap-1"><MessageSquare size={10} /> Replies</span>
                <span className="flex items-center gap-1"><Eye size={10} /> Views</span>
              </div>
            </div>

            {filteredThreads.length === 0 ? (
              <div className="py-12 text-center text-xs" style={{ color: "#52525b" }}>
                No threads matched your search.
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const cat = CATEGORY_STYLES[thread.category] ?? {
                  color: "#a1a1aa", bg: "rgba(161,161,170,0.08)", border: "rgba(161,161,170,0.2)"
                };
                return (
                  <div
                    key={thread.id}
                    className="flex flex-col gap-2 px-3 py-3 cursor-pointer group transition-colors duration-100"
                    style={{ borderBottom: "1px solid rgba(39,39,42,0.5)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "rgba(39,39,42,0.4)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                  >
                    {/* Top: category + time */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="text-[10px] font-medium px-2 py-0.5 rounded uppercase tracking-wider"
                        style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.border}` }}
                      >
                        {thread.category}
                      </span>
                      <span className="text-[10px] tabular-nums" style={{ color: "#52525b" }}>
                        {thread.timeAgo}
                      </span>
                    </div>

                    {/* Title + excerpt */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col gap-1 min-w-0">
                        <h3
                          className="text-xs font-semibold leading-snug flex items-center gap-1 group-hover:text-white transition-colors"
                          style={{ color: "#d4d4d8" }}
                        >
                          {thread.title}
                          <ArrowUpRight
                            size={11}
                            className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                            style={{ color: "#71717a" }}
                          />
                        </h3>
                        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "#71717a" }}>
                          {thread.excerpt}
                        </p>
                      </div>
                    </div>

                    {/* Bottom: author + stats */}
                    <div className="flex items-center justify-between text-[10px]" style={{ color: "#52525b" }}>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold uppercase"
                          style={{ background: "#27272a", color: "#a1a1aa" }}
                        >
                          {thread.author[0]}
                        </span>
                        <span>@{thread.author}</span>
                      </div>
                      <div className="flex items-center gap-4 tabular-nums font-mono">
                        <span>{thread.likes}</span>
                        <span>{thread.replies}</span>
                        <span>{thread.views.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="flex flex-col gap-4">

            {/* Cyber-defense notice */}
            <div
              className="rounded-md p-3 flex flex-col gap-2"
              style={{
                background: "#111111",
                border: "1px solid #27272a",
                borderLeft: "2px solid #f59e0b",
              }}
            >
              <div className="flex items-center gap-1.5">
                <AlertTriangle size={12} style={{ color: "#f59e0b" }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#f59e0b" }}>
                  Cyber-Defense Notice
                </span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "#71717a" }}>
                Sequential card hover metrics are tracked. Automated scrapers raise their behavior risk score.
              </p>
            </div>

            {/* Trending Topics */}
            <div
              className="rounded-md p-3 flex flex-col gap-3"
              style={{ background: "#111111", border: "1px solid #27272a" }}
            >
              <span className="text-xs font-semibold" style={{ color: "#e4e4e7" }}>
                Trending Topics
              </span>
              <ul className="flex flex-col gap-1">
                {[
                  { tag: "#FAANGOfferNegotiations", views: "1.2k" },
                  { tag: "#VestingStockStrategies",  views: "980" },
                  { tag: "#LevelsFyiScrapingBusted", views: "750" },
                ].map((item) => (
                  <li
                    key={item.tag}
                    className="flex items-center justify-between px-2 py-1.5 rounded cursor-pointer text-xs transition-colors duration-100"
                    style={{ color: "#71717a" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLLIElement).style.background = "#18181b";
                      (e.currentTarget as HTMLLIElement).style.color = "#a1a1aa";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLLIElement).style.background = "transparent";
                      (e.currentTarget as HTMLLIElement).style.color = "#71717a";
                    }}
                  >
                    <span>{item.tag}</span>
                    <span className="font-mono tabular-nums text-[10px]" style={{ color: "#52525b" }}>
                      {item.views}
                    </span>
                  </li>
                ))}
              </ul>
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
