"use client";
import { TrafficEvent } from "@/types";
import ActionBadge from "./ActionBadge";
import { formatTimeAgo } from "@/data/mock";

interface Props {
  events: TrafficEvent[];
}

function parseUserAgentFriendly(ua: string): string {
  if (!ua) return "Unknown Browser";
  const uaLower = ua.toLowerCase();
  if (uaLower.includes("edg/")) return "Edge";
  if (uaLower.includes("chrome") && !uaLower.includes("chromium")) return "Chrome";
  if (uaLower.includes("safari") && !uaLower.includes("chrome")) return "Safari";
  if (uaLower.includes("firefox")) return "Firefox";
  if (uaLower.includes("python-requests")) return "Python Bot";
  if (uaLower.includes("headless")) return "Headless Browser";
  if (uaLower.includes("gptbot")) return "GPTBot (AI Bot)";
  if (uaLower.includes("googlebot")) return "Googlebot";
  return ua.slice(0, 20) + "...";
}

export default function LiveTrafficFeed({ events }: Props) {
  return (
    <div className="flex flex-col gap-1 overflow-y-auto max-h-72">
      {events.length === 0 && (
        <p className="text-center py-8" style={{ color: "var(--muted)" }}>
          No events yet...
        </p>
      )}
      {events.map((evt) => (
        <div
          key={evt.id}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs"
          style={{
            background: "rgba(18, 18, 22, 0.6)",
            borderLeft: "2px solid var(--border-bright)",
            animation: "fadeIn 0.3s ease",
          }}
        >
          <ActionBadge action={evt.actionTaken} />
          <span
            className="font-mono truncate flex-1"
            style={{ color: "var(--accent)" }}
            title={evt.path}
          >
            {evt.path}
          </span>
          <span
            className="hidden md:block truncate max-w-[120px]"
            style={{ color: "var(--muted)" }}
            title={evt.userAgent}
          >
            {parseUserAgentFriendly(evt.userAgent)}
          </span>
          <span style={{ color: "var(--muted)" }} className="shrink-0">
            {formatTimeAgo(evt.timestamp)}
          </span>
        </div>
      ))}
    </div>
  );
}
