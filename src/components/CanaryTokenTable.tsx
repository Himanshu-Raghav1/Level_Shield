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
          <tr style={{ color: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
            <th className="text-left py-2 pr-4 font-medium">Token ID</th>
            <th className="text-left py-2 pr-4 font-medium">Session</th>
            <th className="text-left py-2 pr-4 font-medium">Company (Fake)</th>
            <th className="text-left py-2 pr-4 font-medium">Fake Salary</th>
            <th className="text-left py-2 font-medium">Exposed</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((t) => (
            <tr
              key={t.tokenId}
              className="border-b"
              style={{ borderColor: "var(--border)" }}
            >
              <td className="py-2 pr-4">
                <span className="flex items-center gap-1 font-mono" style={{ color: "var(--accent-yellow)" }}>
                  <KeyRound size={10} />
                  {t.tokenId}
                </span>
              </td>
              <td className="py-2 pr-4 font-mono" style={{ color: "var(--muted)" }}>
                {t.sessionId.slice(0, 12)}…
              </td>
              <td className="py-2 pr-4" style={{ color: "var(--foreground)" }}>
                {t.company}
              </td>
              <td className="py-2 pr-4 font-mono" style={{ color: "var(--accent-red)" }}>
                {t.fakeSalary}
              </td>
              <td className="py-2" style={{ color: "var(--muted)" }}>
                {formatTimeAgo(t.exposedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
