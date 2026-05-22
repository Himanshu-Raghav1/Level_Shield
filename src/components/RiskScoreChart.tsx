"use client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DataPoint {
  time: string;
  human: number;
  scraper: number;
  playwright: number;
}

interface Props {
  data: DataPoint[];
}

function formatLabel(label: any) {
  if (!label || typeof label !== "string") return "";
  try {
    return new Date(label).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  } catch {
    return String(label);
  }
}

export default function RiskScoreChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gHuman" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ffffff" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gScraper" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gPlaywright" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#71717a" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#71717a" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" />
        <XAxis
          dataKey="time"
          tickFormatter={formatLabel}
          tick={{ fill: "#71717a", fontSize: 10, fontFamily: "monospace" }}
          axisLine={{ stroke: "rgba(255, 255, 255, 0.06)" }}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: "#71717a", fontSize: 10, fontFamily: "monospace" }}
          axisLine={{ stroke: "rgba(255, 255, 255, 0.06)" }}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "rgba(18, 18, 22, 0.95)",
            border: "1px solid var(--border)",
            borderRadius: 4,
            fontSize: 11,
            color: "#ffffff",
            fontFamily: "inherit",
          }}
          labelFormatter={formatLabel}
        />
        <Legend
          wrapperStyle={{ fontSize: 10, fontFamily: "monospace", textTransform: "uppercase", color: "#71717a", paddingTop: 8 }}
        />
        <Area type="monotone" dataKey="human" name="Human" stroke="#ffffff" fill="url(#gHuman)" strokeWidth={1.5} dot={false} />
        <Area type="monotone" dataKey="scraper" name="Scraper" stroke="#06b6d4" fill="url(#gScraper)" strokeWidth={1.5} dot={false} />
        <Area type="monotone" dataKey="playwright" name="Playwright Bot" stroke="#71717a" fill="url(#gPlaywright)" strokeWidth={1.5} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
