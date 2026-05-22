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

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Negotiation: {
    bg: "rgba(139,92,246,0.08)",
    text: "#a78bfa",
    border: "rgba(139,92,246,0.2)",
  },
  Promotions: {
    bg: "rgba(14,165,233,0.08)",
    text: "#38bdf8",
    border: "rgba(14,165,233,0.2)",
  },
  Compensation: {
    bg: "rgba(16,185,129,0.08)",
    text: "#34d399",
    border: "rgba(16,185,129,0.2)",
  },
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
            { label: "Compare", href: "/compare" },
            { label: "Community", href: "/community", active: true },
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

      {/* ── Main Forum Catalog ── */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-10 flex flex-col gap-7">

        {/* Page Header Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span
                className="p-2 rounded-xl"
                style={{
                  background: "rgba(14,165,233,0.08)",
                  border: "1px solid rgba(14,165,233,0.15)",
                }}
              >
                <MessageSquare size={22} style={{ color: "var(--accent-cyan)" }} />
              </span>
              Community Discussions
            </h1>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              Share offers, interview advice, and leveling discussions.{" "}
              <span style={{ color: "rgba(14,165,233,0.6)" }}>AI scraper telemetry actively monitored.</span>
            </p>
          </div>

          {/* Search Bar */}
          <div
            className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 w-full md:max-w-xs transition-all duration-300 flex-shrink-0"
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
              placeholder="Search discussions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-0 outline-none text-xs text-white placeholder-slate-600 w-full font-sans"
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

        {/* ── Forum Split Layout ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* ── Thread List (2/3 width) ── */}
          <div className="md:col-span-2 flex flex-col gap-4">
            {filteredThreads.length === 0 ? (
              <div
                className="p-12 text-center rounded-2xl"
                style={{
                  background: "rgba(10,16,30,0.6)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <div className="flex flex-col items-center gap-3">
                  <Search size={22} style={{ color: "rgba(148,163,184,0.25)" }} />
                  <span className="text-xs" style={{ color: "var(--muted)" }}>
                    No community threads matched your search parameters.
                  </span>
                </div>
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const catColor = CATEGORY_COLORS[thread.category] || {
                  bg: "rgba(14,165,233,0.08)",
                  text: "var(--accent-cyan)",
                  border: "rgba(14,165,233,0.2)",
                };
                return (
                  <div
                    key={thread.id}
                    className="p-6 rounded-2xl flex flex-col gap-4 transition-all duration-300 cursor-pointer group relative"
                    style={{
                      background: "rgba(10,16,30,0.6)",
                      border: "1px solid rgba(255,255,255,0.05)",
                      backdropFilter: "blur(16px)",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLDivElement;
                      el.style.border = "1px solid rgba(14,165,233,0.2)";
                      el.style.transform = "translateY(-2px)";
                      el.style.boxShadow = "0 20px 40px rgba(0,0,0,0.3), 0 0 30px rgba(14,165,233,0.05)";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLDivElement;
                      el.style.border = "1px solid rgba(255,255,255,0.05)";
                      el.style.transform = "translateY(0)";
                      el.style.boxShadow = "none";
                    }}
                  >
                    {/* Top Row: Category + Timestamp */}
                    <div className="flex items-center justify-between">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          background: catColor.bg,
                          color: catColor.text,
                          border: `1px solid ${catColor.border}`,
                        }}
                      >
                        {thread.category}
                      </span>
                      <span className="text-[11px] font-medium" style={{ color: "rgba(148,163,184,0.45)" }}>
                        {thread.timeAgo}
                      </span>
                    </div>

                    {/* Thread Title + Excerpt */}
                    <div className="flex flex-col gap-1.5">
                      <h3
                        className="text-sm font-bold text-white flex items-center gap-1.5 transition-colors duration-200 group-hover:text-cyan-300"
                      >
                        {thread.title}
                        <ArrowUpRight
                          size={13}
                          className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 group-hover:translate-x-0.5"
                          style={{ color: "var(--accent-cyan)", flexShrink: 0 }}
                        />
                      </h3>
                      <p className="text-xs leading-relaxed" style={{ color: "rgba(148,163,184,0.65)" }}>
                        {thread.excerpt}
                      </p>
                    </div>

                    {/* Bottom Row: Author + Stats */}
                    <div
                      className="flex items-center justify-between pt-3"
                      style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
                    >
                      {/* Author */}
                      <div className="flex items-center gap-2 text-[11px]" style={{ color: "rgba(148,163,184,0.6)" }}>
                        <span
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                          style={{
                            background: "rgba(14,165,233,0.15)",
                            border: "1px solid rgba(14,165,233,0.2)",
                            color: "var(--accent-cyan)",
                          }}
                        >
                          {thread.author[0].toUpperCase()}
                        </span>
                        <span>@{thread.author}</span>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-[11px]" style={{ color: "rgba(148,163,184,0.5)" }}>
                        <span className="flex items-center gap-1.5 transition-colors duration-200 group-hover:text-slate-300">
                          <ThumbsUp size={11} />
                          {thread.likes}
                        </span>
                        <span className="flex items-center gap-1.5 transition-colors duration-200 group-hover:text-slate-300">
                          <MessageSquare size={11} />
                          {thread.replies}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Eye size={11} />
                          {thread.views.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="flex flex-col gap-4">

            {/* Cybersecurity Alert Notice */}
            <div
              className="p-5 rounded-2xl flex flex-col gap-3"
              style={{
                background: "rgba(10,16,30,0.65)",
                border: "1px solid rgba(245,158,11,0.12)",
                borderLeft: "3px solid rgba(245,158,11,0.7)",
                backdropFilter: "blur(16px)",
                boxShadow: "-4px 0 20px rgba(245,158,11,0.04)",
              }}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} style={{ color: "var(--accent-yellow)", flexShrink: 0 }} />
                <h3
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: "var(--accent-yellow)" }}
                >
                  Cyber-Defense Notice
                </h3>
              </div>
              <div
                className="h-[1px]"
                style={{ background: "linear-gradient(90deg, rgba(245,158,11,0.3), transparent)" }}
              />
              <p className="text-[11px] leading-relaxed" style={{ color: "rgba(148,163,184,0.65)" }}>
                We actively track sequential card hover metrics. Automated extraction crawlers attempting to scrape user threads will raise their behavior risk scores.
              </p>
            </div>

            {/* Trending Topics */}
            <div
              className="p-5 rounded-2xl flex flex-col gap-4"
              style={{
                background: "rgba(10,16,30,0.65)",
                border: "1px solid rgba(255,255,255,0.05)",
                backdropFilter: "blur(16px)",
              }}
            >
              <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--accent-cyan)", boxShadow: "0 0 6px var(--accent-cyan)" }}
                />
                Trending Topics
              </h3>
              <ul className="flex flex-col gap-2.5">
                {[
                  { tag: "#FAANGOfferNegotiations", views: "1.2k views" },
                  { tag: "#VestingStockStrategies", views: "980 views" },
                  { tag: "#LevelsFyiScrapingBusted", views: "750 views" },
                ].map((item) => (
                  <li
                    key={item.tag}
                    className="flex justify-between items-center text-xs cursor-pointer transition-all duration-200 rounded-lg px-3 py-2 group"
                    style={{ color: "rgba(148,163,184,0.65)" }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLLIElement;
                      el.style.background = "rgba(14,165,233,0.05)";
                      el.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLLIElement;
                      el.style.background = "transparent";
                      el.style.color = "rgba(148,163,184,0.65)";
                    }}
                  >
                    <span className="font-medium">{item.tag}</span>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
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
