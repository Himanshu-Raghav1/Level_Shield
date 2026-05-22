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
          <a href="/compensation" className="hover:text-white transition-colors">Compensation</a>
          <a href="/compare" className="hover:text-white transition-colors">Compare</a>
          <span className="text-white border-b-2 pb-0.5" style={{ borderColor: "var(--accent-cyan)" }}>Community</span>
          <a href="/shield" className="hover:text-white transition-colors">Shield Dashboard</a>
        </nav>
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--accent-green)" }}>
          <span className="live-dot" />
          <span className="ml-2">Active</span>
        </div>
      </header>

      {/* Main Forum catalog */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <MessageSquare size={24} style={{ color: "var(--accent-cyan)" }} />
              Community Discussions
            </h1>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              Share offers, interview advice, and leveling discussions. AI scraper telemetry actively monitored.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-black/30 border rounded-lg px-3 py-1.5 w-full md:max-w-xs" style={{ borderColor: "var(--border)" }}>
            <Search size={14} style={{ color: "var(--muted)" }} />
            <input
              type="text"
              placeholder="Search discussions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-0 outline-none text-xs text-white placeholder-gray-500 w-full font-sans"
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

        {/* Forum Layout split */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Threads list (Span 2) */}
          <div className="md:col-span-2 flex flex-col gap-4">
            {filteredThreads.length === 0 ? (
              <div className="glass-card p-8 text-center text-xs" style={{ color: "var(--muted)" }}>
                No community threads matched your search parameters.
              </div>
            ) : (
              filteredThreads.map((thread) => (
                <div key={thread.id} className="glass-card p-5 hover:border-bright transition-all duration-300 relative group flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span 
                      className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider" 
                      style={{ 
                        background: "var(--surface-2)", 
                        color: "var(--accent-cyan)",
                        border: "1px solid var(--border)"
                      }}
                    >
                      {thread.category}
                    </span>
                    <span className="text-[10px]" style={{ color: "var(--muted)" }}>{thread.timeAgo}</span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors flex items-center gap-1.5 cursor-pointer">
                      {thread.title}
                      <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--accent-cyan)" }} />
                    </h3>
                    <p className="text-xs mt-1.5 leading-relaxed" style={{ color: "var(--muted)" }}>{thread.excerpt}</p>
                  </div>

                  <div className="flex items-center justify-between border-t pt-3 mt-1" style={{ borderColor: "rgba(28,48,80,0.4)" }}>
                    <div className="flex items-center gap-1.5 text-[10px]" style={{ color: "var(--muted)" }}>
                      <span className="w-4 h-4 rounded-full bg-cyan-500/20 flex items-center justify-center text-[9px] font-bold text-cyan-300">
                        {thread.author[0].toUpperCase()}
                      </span>
                      <span>By @{thread.author}</span>
                    </div>

                    <div className="flex items-center gap-4 text-[10px]" style={{ color: "var(--muted)" }}>
                      <span className="flex items-center gap-1"><ThumbsUp size={11} /> {thread.likes}</span>
                      <span className="flex items-center gap-1"><MessageSquare size={11} /> {thread.replies}</span>
                      <span className="flex items-center gap-1"><Eye size={11} /> {thread.views}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Forum Sidebar Column */}
          <div className="flex flex-col gap-4">
            {/* Shield Telemetry Warnings */}
            <div className="glass-card p-5 border-l-2 border-l-yellow-500/80 bg-yellow-500/[0.02] flex flex-col gap-3">
              <h3 className="text-xs font-bold text-yellow-500 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle size={14} />
                Cyber-Defense Notice
              </h3>
              <p className="text-[11px] leading-relaxed" style={{ color: "var(--muted)" }}>
                We actively track sequential card hover metrics. Automated extraction crawlers attempting to scrape user threads will raise their behavior risk scores.
              </p>
            </div>

            {/* Popular Topics Box */}
            <div className="glass-card p-5 flex flex-col gap-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Trending Topics</h3>
              <ul className="text-xs space-y-2.5" style={{ color: "var(--muted)" }}>
                <li className="hover:text-white cursor-pointer transition-colors flex justify-between items-center">
                  <span>#FAANGOfferNegotiations</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40">1.2k views</span>
                </li>
                <li className="hover:text-white cursor-pointer transition-colors flex justify-between items-center">
                  <span>#VestingStockStrategies</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40">980 views</span>
                </li>
                <li className="hover:text-white cursor-pointer transition-colors flex justify-between items-center">
                  <span>#LevelsFyiScrapingBusted</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40">750 views</span>
                </li>
              </ul>
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
