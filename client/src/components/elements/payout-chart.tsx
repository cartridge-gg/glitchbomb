import { useEffect, useRef, useState } from "react";
import {
  BREAK_EVEN_LEVEL,
  exponentialReward,
  MAX_LEVEL,
} from "@/helpers/payout";

export interface PayoutChartProps {
  /** Entry cost in dollars */
  entryCost: number;
}

export const PayoutChart = ({ entryCost }: PayoutChartProps) => {
  // Compute payout at each level (1 through MAX_LEVEL)
  const levels = Array.from({ length: MAX_LEVEL }, (_, i) => i + 1);
  const payouts = levels.map((level) => ({
    level,
    value: exponentialReward(level, entryCost),
  }));

  const maxValue = payouts[payouts.length - 1].value;
  const breakEvenValue = entryCost;

  // Chart dimensions
  const chartW = 300;
  const chartH = 200;
  const padL = 12;
  const padR = 12;
  const padT = 24;
  const padB = 28;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  const xScale = plotW / (levels.length - 1);
  const toX = (i: number) => padL + i * xScale;
  const toY = (val: number) => padT + plotH - (val / (maxValue * 1.1)) * plotH;

  const breakEvenX = toX(BREAK_EVEN_LEVEL - 1);
  const breakEvenY = toY(breakEvenValue);

  // Build staircase path (exponential steps)
  let stairPath = `M ${toX(0)} ${toY(payouts[0].value)}`;
  for (let i = 1; i < payouts.length; i++) {
    stairPath += ` H ${toX(i)} V ${toY(payouts[i].value)}`;
  }
  stairPath += ` H ${padL + plotW}`;

  const labelColor = "rgba(54, 248, 24, 0.40)";
  const valueColor = "#36F818";
  const gridColor = "rgba(54, 248, 24, 0.06)";
  const lineColor = "#36F818";
  const dotColor = "#FFFFFF";

  // X-axis: show a few key level labels
  const xLabels = [1, BREAK_EVEN_LEVEL, MAX_LEVEL];

  // Draw animation
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);
  const [phase, setPhase] = useState<"hidden" | "ready" | "animate">("hidden");

  // Measure path length on mount / cost change
  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const len = path.getTotalLength();
    setPathLength(len);
    setPhase("ready");
  }, [entryCost]);

  // Once measured ("ready"), trigger animation on next frame
  useEffect(() => {
    if (phase !== "ready") return;
    const raf = requestAnimationFrame(() => setPhase("animate"));
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  const animated = phase === "animate";

  return (
    <svg
      viewBox={`0 0 ${chartW} ${chartH}`}
      className="w-full"
      style={{ fontFamily: "inherit" }}
    >
      {/* Horizontal grid at 0 and break-even */}
      <line
        x1={padL}
        y1={toY(0)}
        x2={padL + plotW}
        y2={toY(0)}
        stroke={gridColor}
        strokeWidth={0.5}
      />
      <line
        x1={padL}
        y1={breakEvenY}
        x2={padL + plotW}
        y2={breakEvenY}
        stroke={gridColor}
        strokeWidth={0.5}
      />

      {/* Break-even dashed vertical line (starts below badge) */}
      <line
        x1={breakEvenX}
        y1={padT + 14}
        x2={breakEvenX}
        y2={toY(0)}
        stroke={labelColor}
        strokeWidth={0.8}
        strokeDasharray="3 3"
      />

      {/* Break-even horizontal dashed line */}
      <line
        x1={padL}
        y1={breakEvenY}
        x2={breakEvenX}
        y2={breakEvenY}
        stroke={labelColor}
        strokeWidth={0.8}
        strokeDasharray="3 3"
      />

      {/* "BREAK EVEN" badge */}
      <rect
        x={breakEvenX - 30}
        y={padT - 2}
        width={60}
        height={14}
        rx={3}
        fill="rgba(54, 248, 24, 0.15)"
      />
      <text
        x={breakEvenX}
        y={padT + 9}
        textAnchor="middle"
        fill={valueColor}
        fontSize={7}
        className="font-secondary"
      >
        BREAK EVEN
      </text>

      {/* Staircase payout curve - animated draw */}
      <path
        ref={pathRef}
        d={stairPath}
        fill="none"
        stroke={lineColor}
        strokeWidth={1.5}
        strokeLinejoin="round"
        style={
          pathLength > 0
            ? {
                strokeDasharray: pathLength,
                strokeDashoffset: animated ? 0 : pathLength,
                transition: animated
                  ? "stroke-dashoffset 1.2s ease-out"
                  : "none",
              }
            : { opacity: 0 }
        }
      />

      {/* Break-even dot - fade in after line draws */}
      <circle
        cx={breakEvenX}
        cy={breakEvenY}
        r={3}
        fill={dotColor}
        style={{
          opacity: animated ? 1 : 0,
          transition: animated ? "opacity 0.3s ease-out 1s" : "none",
        }}
      />

      {/* Y-axis labels */}
      <text
        x={padL}
        y={toY(0) + 12}
        textAnchor="start"
        fill={labelColor}
        fontSize={8}
        className="font-secondary"
      >
        $0
      </text>
      <text
        x={padL}
        y={breakEvenY - 6}
        textAnchor="start"
        fill={labelColor}
        fontSize={8}
        className="font-secondary"
      >
        ${breakEvenValue.toFixed(0)}
      </text>
      <text
        x={padL}
        y={toY(maxValue) - 6}
        textAnchor="start"
        fill={valueColor}
        fontSize={8}
        fontWeight="bold"
        className="font-secondary"
      >
        ${maxValue.toFixed(0)}
      </text>

      {/* X-axis level labels */}
      {xLabels.map((level) => (
        <text
          key={`x-${level}`}
          x={toX(level - 1)}
          y={padT + plotH + 16}
          textAnchor="middle"
          fill={labelColor}
          fontSize={8}
          className="font-secondary"
        >
          {level}
        </text>
      ))}
    </svg>
  );
};
