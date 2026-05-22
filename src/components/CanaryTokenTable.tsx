"use client";
import { CanaryToken } from "@/types";
import { formatTimeAgo } from "@/data/mock";
import { KeyRound } from "lucide-react";

interface Props {
  tokens: CanaryToken[];
}

export default function CanaryTokenTable({ tokens }: Props) {
  if (tokens.length === 0) {
    return (
      <p className="text-center py-6 text-xs" style={{ color: "var(--muted)" }}>
        No canary tokens exposed yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b" style={{ color: "var(--muted)", borderColor: "var(--border)" }}>
            <th className="text-left py-2.5 pr-4 text-[10px] uppercase font-mono tracking-wider font-bold">Token ID</th>
            <th className="text-left py-2.5 pr-4 text-[10px] uppercase font-mono tracking-wider font-bold">Session</th>
            <th className="text-left py-2.5 pr-4 text-[10px] uppercase font-mono tracking-wider font-bold">Company (Fake)</th>
            <th className="text-left py-2.5 pr-4 text-[10px] uppercase font-mono tracking-wider font-bold">Fake Salary</th>
            <th className="text-left py-2.5 text-[10px] uppercase font-mono tracking-wider font-bold">Exposed</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((t) => (
            <tr
              key={t.tokenId}
              className="border-b transition-colors hover:bg-white/[0.02]"
              style={{ borderColor: "var(--border)" }}
            >
              <td className="py-2.5 pr-4">
                <span className="flex items-center gap-1.5 font-mono text-xs font-semibold" style={{ color: "var(--accent-cyan)" }}>
                  <KeyRound size={11} />
                  {t.tokenId}
                </span>
              </td>
              <td className="py-2.5 pr-4 font-mono text-[11px]" style={{ color: "var(--muted)" }}>
                {t.sessionId.slice(0, 12)}…
              </td>
              <td className="py-2.5 pr-4 text-xs font-medium" style={{ color: "var(--foreground)" }}>
                {t.company}
              </td>
              <td className="py-2.5 pr-4 font-mono text-xs font-bold" style={{ color: "var(--foreground)" }}>
                {t.fakeSalary}
              </td>
              <td className="py-2.5 text-xs" style={{ color: "var(--muted)" }}>
                {formatTimeAgo(t.exposedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
