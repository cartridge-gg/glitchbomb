import { useEffect, useRef, useState } from "react";
import {
  breakEvenScore,
  MAX_SCORE,
  maxPayout,
  STARTERPACK_COUNT,
  toTokens,
  tokenPayout,
} from "@/helpers/payout";

export interface PayoutChartProps {
  /** Stake multiplier (1–STARTERPACK_COUNT) */
  stake: number;
  /** Token price in USD. Null = show raw token values. */
  tokenPrice: number | null;
}

export const PayoutChart = ({ stake, tokenPrice }: PayoutChartProps) => {
  const hasPrice = tokenPrice != null && tokenPrice > 0;

  const maxTokens = toTokens(maxPayout(stake));
  const maxVal = hasPrice ? maxTokens * tokenPrice : maxTokens;
  const beScore = breakEvenScore(stake, tokenPrice ?? undefined);
  const beTokens = toTokens(tokenPayout(beScore, stake));
  const beValue = hasPrice ? beTokens * tokenPrice : beTokens;

  // Chart dimensions
  const chartW = 300;
  const chartH = 200;
  const padL = 60;
  const padR = 12;
  const padT = 6;
  const padB = 28;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  const yMax = maxVal * 1.1 || 1;
  const toX = (score: number) => padL + (score / MAX_SCORE) * plotW;
  const toY = (val: number) => padT + plotH - (val / yMax) * plotH;

  // Build smooth curve path by sampling points
  const SAMPLES = 100;
  let curvePath = "";
  for (let i = 0; i <= SAMPLES; i++) {
    const score = (i / SAMPLES) * MAX_SCORE;
    const tokens = toTokens(tokenPayout(score, stake));
    const val = hasPrice ? tokens * tokenPrice : tokens;
    const x = toX(score);
    const y = toY(val);
    curvePath += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }

  // Base (stake=1) reference curve when stake > 1
  const showBaseCurve = stake > 1;
  let basePath = "";
  if (showBaseCurve) {
    for (let i = 0; i <= SAMPLES; i++) {
      const score = (i / SAMPLES) * MAX_SCORE;
      const tokens = toTokens(tokenPayout(score, 1));
      const val = hasPrice ? tokens * tokenPrice : tokens;
      const x = toX(score);
      const y = toY(val);
      basePath += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    }
  }

  const labelColor = "rgba(54, 248, 24, 0.40)";
  const valueColor = "#36F818";
  const gridColor = "rgba(54, 248, 24, 0.06)";
  const lineColor = "#36F818";

  // X-axis labels — score milestones
  const xLabels = [0, 100, 200, 300, 400, MAX_SCORE];

  // Draw animation
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);
  const [phase, setPhase] = useState<"hidden" | "ready" | "animate">("hidden");

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const len = path.getTotalLength();
    setPathLength(len);
    setPhase("ready");
  }, [stake]);

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
      {/* Horizontal grid at 0 */}
      <line
        x1={padL}
        y1={toY(0)}
        x2={padL + plotW}
        y2={toY(0)}
        stroke={gridColor}
        strokeWidth={0.5}
      />

      {/* Break-even dashed vertical line (top → intersection) */}
      {beScore < MAX_SCORE && (
        <>
          <line
            x1={toX(beScore)}
            y1={padT}
            x2={toX(beScore)}
            y2={toY(beValue)}
            stroke={labelColor}
            strokeWidth={0.8}
            strokeDasharray="3 3"
          />

          {/* Break-even dashed horizontal line (left → intersection) */}
          <line
            x1={0}
            y1={toY(beValue)}
            x2={toX(beScore)}
            y2={toY(beValue)}
            stroke={labelColor}
            strokeWidth={0.8}
            strokeDasharray="3 3"
          />

          {/* "BREAK EVEN" badge */}
          <rect
            x={toX(beScore) + 4}
            y={toY(beValue) - 7}
            width={70}
            height={14}
            rx={3}
            fill="rgba(54, 248, 24, 0.15)"
          />
          <text
            x={toX(beScore) + 39}
            y={toY(beValue) + 4}
            textAnchor="middle"
            fill={valueColor}
            fontSize={7}
            className="font-secondary"
          >
            BREAK EVEN {beScore}
          </text>

          {/* Break-even dot */}
          <circle
            cx={toX(beScore)}
            cy={toY(beValue)}
            r={3}
            fill="#FFFFFF"
            style={{
              opacity: animated ? 1 : 0,
              transition: animated ? "opacity 0.3s ease-out 1s" : "none",
            }}
          />
        </>
      )}

      {/* Base tier reference curve */}
      {showBaseCurve && (
        <>
          <path
            d={basePath}
            fill="none"
            stroke="rgba(54, 248, 24, 0.25)"
            strokeWidth={1}
            strokeLinejoin="round"
          />
          <text
            x={padL + plotW - 2}
            y={toY(hasPrice ? toTokens(maxPayout(1)) * tokenPrice : toTokens(maxPayout(1))) + 10}
            textAnchor="end"
            fill={labelColor}
            fontSize={7}
            className="font-secondary"
          >
            1x
          </text>
        </>
      )}

      {/* Main payout curve — animated draw */}
      <path
        ref={pathRef}
        d={curvePath}
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

      {/* Y-axis labels */}
      <text
        x={padL}
        y={toY(0) + 12}
        textAnchor="start"
        fill={labelColor}
        fontSize={8}
        className="font-secondary"
      >
        0
      </text>

      {/* X-axis labels (score) */}
      {xLabels.map((score) => (
        <text
          key={`x-${score}`}
          x={toX(score)}
          y={padT + plotH + 16}
          textAnchor="middle"
          fill={labelColor}
          fontSize={8}
          className="font-secondary"
        >
          {score}
        </text>
      ))}
    </svg>
  );
};
