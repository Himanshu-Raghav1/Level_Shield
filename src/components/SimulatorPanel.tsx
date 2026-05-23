"use client";
import { useState } from "react";
import { Play, RotateCcw, Loader2 } from "lucide-react";

type SimType =
  | "normal-user"
  | "power-user"
  | "request-scraper"
  | "sequential-scraper"
  | "playwright-bot"
  | "ai-agent"
  | "fake-googlebot"
  | "good-bot";

interface SimButton {
  type: SimType;
  label: string;
  color: string;
  description: string;
}

const SIM_BUTTONS: SimButton[] = [
  { type: "normal-user",        label: "Normal User",        color: "var(--muted)", description: "Browses naturally, low risk" },
  { type: "power-user",         label: "Power User",         color: "var(--foreground)", description: "Fast but human-like" },
  { type: "request-scraper",    label: "Request Scraper",    color: "var(--accent)", description: "Raw HTTP bulk scrape" },
  { type: "sequential-scraper", label: "Sequential Scraper", color: "var(--accent)", description: "Crawls all salary pages" },
  { type: "playwright-bot",     label: "Playwright Bot",     color: "var(--accent)", description: "Headless browser, zero behavior" },
  { type: "ai-agent",           label: "AI Agent",           color: "var(--accent)", description: "Reads hidden instructions" },
  { type: "fake-googlebot",     label: "Fake Googlebot",     color: "var(--accent)", description: "Spoofed user-agent, no signature" },
  { type: "good-bot",           label: "Signed Good Bot",    color: "var(--foreground)", description: "Verified crawler, allowed" },
];

interface Props {
  onSimulate?: (type: SimType) => Promise<void>;
  onReset?: () => void;
}

export default function SimulatorPanel({ onSimulate, onReset }: Props) {
  const [running, setRunning] = useState<SimType | null>(null);

  async function handleRun(type: SimType) {
    setRunning(type);
    try {
      if (onSimulate) {
        await onSimulate(type);
      } else {
        // Simulate a delay for demo with mock data
        await new Promise((r) => setTimeout(r, 1500));
      }
    } finally {
      setRunning(null);
    }
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      <p className="text-[10px] font-mono font-bold uppercase tracking-wider mb-1" style={{ color: "var(--muted)" }}>
        Simulate Attack
      </p>
      <div className="flex flex-col gap-2">
        {SIM_BUTTONS.map(({ type, label, color, description }) => (
          <button
            key={type}
            onClick={() => handleRun(type)}
            disabled={running !== null}
            title={description}
            className="flex items-center gap-3 w-full px-3 py-2 rounded border text-xs font-semibold text-left transition-all duration-200"
            style={{
              background: running === type ? "var(--accent-muted)" : "var(--surface-2)",
              borderColor: running === type ? color : "var(--border)",
              color: running === type ? color : "var(--foreground)",
              cursor: running !== null ? "not-allowed" : "pointer",
              opacity: running !== null && running !== type ? 0.4 : 1,
            }}
          >
            {running === type ? (
              <Loader2 className="shrink-0 animate-spin" size={12} style={{ color }} />
            ) : (
              <Play className="shrink-0" size={12} style={{ color }} />
            )}
            {label}
          </button>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t" style={{ borderColor: "var(--border)" }}>
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded border text-xs font-bold transition-all duration-200 hover:bg-foreground/5 active:bg-foreground/10"
          style={{
            background: "var(--surface-2)",
            borderColor: "var(--border)",
            color: "var(--muted)",
          }}
        >
          <RotateCcw size={12} />
          Reset Demo
        </button>
      </div>
    </div>
  );
}
