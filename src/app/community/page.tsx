"use client";

import { useState, useEffect } from "react";
import { Shield, MessageSquare, ThumbsUp, Eye, Search, AlertTriangle, ArrowUpRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
  Negotiation:  { color: "var(--foreground)", bg: "var(--surface-2)", border: "var(--border)" },
  Promotions:   { color: "var(--accent)",     bg: "var(--accent-muted)", border: "var(--border-bright)" },
  Compensation: { color: "var(--muted)",       bg: "var(--surface-2)", border: "var(--border)" },
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

      {/* ── Top Nav — matches homepage exactly ── */}
      <Navbar />

      {/* ── Main Content — centred ── */}
      <div style={{ display: "flex", justifyContent: "center", width: "100%", flex: 1 }}>
        <main className="w-full px-6 py-8 flex flex-col gap-6" style={{ maxWidth: "1024px" }}>

        {/* Page heading + search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <MessageSquare size={20} style={{ color: "var(--accent)" }} />
              Community Discussions
            </h1>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              Share offers, interview advice, and levelling discussions. AI scraper telemetry active.
            </p>
          </div>

          {/* Search */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-md w-full sm:w-64 flex-shrink-0"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
          >
            <Search size={13} style={{ color: "var(--muted)", flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search discussions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none w-full text-xs text-foreground"
              style={{ caretColor: "var(--accent)" }}
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

        {/* ── Content grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Thread list (2 of 3) */}
          <div className="md:col-span-2 flex flex-col" style={{ border: "1px solid var(--border)", borderRadius: 8 }}>

            {/* Column headers */}
            <div
              className="flex items-center justify-between px-4 py-2.5 text-xs rounded-t-lg"
              style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", color: "var(--muted)" }}
            >
              <span className="font-semibold">Discussion</span>
              <div className="flex items-center gap-5">
                <span className="flex items-center gap-1"><ThumbsUp size={10} /> Likes</span>
                <span className="flex items-center gap-1"><MessageSquare size={10} /> Replies</span>
                <span className="flex items-center gap-1"><Eye size={10} /> Views</span>
              </div>
            </div>

            {/* Rows */}
            {filteredThreads.length === 0 ? (
              <div className="py-12 text-center text-xs" style={{ color: "var(--muted)" }}>
                No threads matched your search.
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const cat = CATEGORY_STYLES[thread.category] ?? {
                  color: "var(--muted)", bg: "var(--surface-2)", border: "var(--border)"
                };
                return (
                  <div
                    key={thread.id}
                    className="flex flex-col gap-3 px-4 py-4 cursor-pointer group transition-colors duration-100 border-b border-border-custom"
                    style={{ borderBottom: "1px solid var(--border)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "var(--surface-2)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                  >
                    {/* Top row: category pill + time */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider"
                        style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.border}` }}
                      >
                        {thread.category}
                      </span>
                      <span className="text-[10px] tabular-nums" style={{ color: "var(--muted)" }}>
                        {thread.timeAgo}
                      </span>
                    </div>

                    {/* Title + excerpt */}
                    <div className="flex flex-col gap-1.5">
                      <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5 group-hover:text-accent transition-colors">
                        {thread.title}
                        <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" style={{ color: "var(--accent)" }} />
                      </h3>
                      <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "var(--muted)" }}>
                        {thread.excerpt}
                      </p>
                    </div>

                    {/* Bottom: author + stats */}
                    <div className="flex items-center justify-between text-xs" style={{ color: "var(--muted)" }}>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold uppercase"
                          style={{ background: "var(--accent-muted)", color: "var(--accent)", border: "1px solid var(--border-bright)" }}
                        >
                          {thread.author[0]}
                        </span>
                        <span>@{thread.author}</span>
                      </div>
                      <div className="flex items-center gap-5 font-mono tabular-nums text-[11px]">
                        <span className="flex items-center gap-1"><ThumbsUp size={10} /> {thread.likes}</span>
                        <span className="flex items-center gap-1"><MessageSquare size={10} /> {thread.replies}</span>
                        <span className="flex items-center gap-1"><Eye size={10} /> {thread.views.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Sidebar (1 of 3) */}
          <div className="flex flex-col gap-4">

            {/* Cyber-defense alert */}
            <div
              className="p-4 rounded-lg flex flex-col gap-3"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderLeft: "2px solid var(--accent)",
              }}
            >
              <div className="flex items-center gap-1.5">
                <Shield size={13} style={{ color: "var(--accent)" }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
                  Cyber-Defense Notice
                </span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                Sequential card hover metrics are tracked. Automated scrapers raise their behaviour risk score automatically.
              </p>
            </div>

            {/* Trending topics */}
            <div
              className="p-4 rounded-lg flex flex-col gap-3"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <span className="text-xs font-semibold text-foreground">Trending Topics</span>
              <ul className="flex flex-col gap-1">
                {[
                  { tag: "#FAANGOfferNegotiations", views: "1.2k views" },
                  { tag: "#VestingStockStrategies",  views: "980 views"  },
                  { tag: "#LevelsFyiScrapingBusted", views: "750 views"  },
                ].map((item) => (
                  <li
                    key={item.tag}
                    className="flex items-center justify-between px-2 py-2 rounded-md cursor-pointer text-xs transition-colors duration-100"
                    style={{ color: "var(--muted)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLLIElement).style.background = "var(--surface-2)";
                      (e.currentTarget as HTMLLIElement).style.color = "var(--foreground)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLLIElement).style.background = "transparent";
                      (e.currentTarget as HTMLLIElement).style.color = "var(--muted)";
                    }}
                  >
                    <span>{item.tag}</span>
                    <span className="font-mono tabular-nums text-[10px]">{item.views}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        </main>
      </div>

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}
