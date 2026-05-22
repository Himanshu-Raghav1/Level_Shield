"use client";
import { getRiskColor } from "@/data/mock";

interface Props {
  score: number;
  size?: "sm" | "md" | "lg";
}

export default function RiskScore({ score, size = "md" }: Props) {
  const color = getRiskColor(score);
  const sizeMap = {
    sm: { ring: 48, stroke: 4, font: "text-xs" },
    md: { ring: 64, stroke: 5, font: "text-sm" },
    lg: { ring: 88, stroke: 6, font: "text-lg" },
  };
  const { ring, stroke, font } = sizeMap[size];
  const radius = (ring - stroke * 2) / 2;
  const circ = 2 * Math.PI * radius;
  const fill = circ - (score / 100) * circ;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: ring, height: ring }}>
      <svg width={ring} height={ring} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={ring / 2}
          cy={ring / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={stroke}
        />
        <circle
          cx={ring / 2}
          cy={ring / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={fill}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s ease, stroke 0.3s ease" }}
        />
      </svg>
      <span
        className={`absolute font-bold font-mono ${font}`}
        style={{ color }}
      >
        {score}
      </span>
    </div>
  );
}
