"use client";

import { Shield, Eye } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-border-custom bg-background py-8 mt-16 transition-all duration-300 flex justify-center">
      <div className="w-full px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-custom max-w-[1024px]">
        <div className="flex items-center gap-2">
          <Shield size={14} className="text-muted-custom/70" />
          <span>Level Shield Firewall Active • Synthetic Salary Model</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><Eye size={12} /> Privacy First Telemetry</span>
          <span className="text-muted-custom/40">•</span>
          <span>Version 1.0.0</span>
        </div>
      </div>
    </footer>
  );
}
