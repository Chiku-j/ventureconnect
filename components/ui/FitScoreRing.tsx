"use client";
import { getScoreColor } from "@/lib/matching";

interface FitScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  className?: string;
}

export default function FitScoreRing({
  score,
  size = 72,
  strokeWidth = 6,
  showLabel = true,
  className = "",
}: FitScoreRingProps) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = radius * 2 * Math.PI;
  const filled = (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          style={{ filter: `drop-shadow(0 0 6px ${color}60)`, transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span style={{ fontSize: size * 0.22, fontWeight: 700, color, lineHeight: 1 }}>
            {score}
          </span>
          <span style={{ fontSize: size * 0.13, color: "var(--text-muted)", lineHeight: 1 }}>
            /100
          </span>
        </div>
      )}
    </div>
  );
}
