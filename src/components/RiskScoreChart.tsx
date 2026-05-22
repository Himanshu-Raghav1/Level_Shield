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
            <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gScraper" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ff3366" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#ff3366" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gPlaywright" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1c3050" />
        <XAxis
          dataKey="time"
          tickFormatter={formatLabel}
          tick={{ fill: "#64748b", fontSize: 10 }}
          axisLine={{ stroke: "#1c3050" }}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: "#64748b", fontSize: 10 }}
          axisLine={{ stroke: "#1c3050" }}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "#0d1a2e",
            border: "1px solid #1c3050",
            borderRadius: 8,
            fontSize: 12,
            color: "#e2e8f0",
          }}
          labelFormatter={formatLabel}
        />
        <Legend
          wrapperStyle={{ fontSize: 11, color: "#64748b", paddingTop: 8 }}
        />
        <Area type="monotone" dataKey="human" name="Human" stroke="#00ff88" fill="url(#gHuman)" strokeWidth={2} dot={false} />
        <Area type="monotone" dataKey="scraper" name="Scraper" stroke="#ff3366" fill="url(#gScraper)" strokeWidth={2} dot={false} />
        <Area type="monotone" dataKey="playwright" name="Playwright Bot" stroke="#a855f7" fill="url(#gPlaywright)" strokeWidth={2} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
