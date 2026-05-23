"use client";

import { usePathname } from "next/navigation";
import { Shield } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname() || "/";

  const tabs = [
    { label: "Product", href: "/" },
    { label: "Compensation", href: "/compensation" },
    { label: "Compare", href: "/compare" },
    { label: "Community", href: "/community" },
    { label: "Shield Dashboard", href: "/shield" },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    if (href === "/compensation") {
      return pathname.startsWith("/compensation") || pathname.startsWith("/company");
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="w-full border-b border-border-custom bg-background/95 backdrop-blur-md sticky top-0 z-50 transition-all duration-300"
      style={{ display: "flex", justifyContent: "center", width: "100%" }}
    >
      <div className="w-full px-6 h-14 flex items-center justify-between" style={{ maxWidth: "1024px" }}>
        {/* Logo */}
        <a 
          href="/" 
          className="flex items-center gap-2 font-bold text-sm tracking-tight text-foreground hover:text-accent transition-colors"
        >
          <Shield size={16} className="text-accent" />
          <span>Level Shield</span>
        </a>

        {/* Dense flat tabs list */}
        <nav className="flex items-center gap-6 md:gap-8 h-full">
          {tabs.map((tab) => {
            const active = isActive(tab.href);
            return (
              <a
                key={tab.href}
                href={tab.href}
                className={`relative flex items-center h-full text-[11px] md:text-xs font-semibold tracking-wide transition-all duration-300 ${
                  active ? "text-accent" : "text-muted-custom hover:text-foreground"
                }`}
              >
                {tab.label}
                {/* Clean, flat underline indicator */}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent shadow-[0_0_12px_rgba(225,29,72,0.4)]" />
                )}
              </a>
            );
          })}
        </nav>

        {/* System Active Badge */}
        <div className="flex items-center gap-2 text-xs font-semibold text-accent">
          <span className="live-dot" />
          <span className="hidden sm:inline text-[10px] tracking-wider uppercase font-mono text-muted-custom">System Active</span>
        </div>
      </div>
    </header>
  );
}
