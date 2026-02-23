import { useEffect, useRef, useState } from "react";
import {
  BASE_COST,
  breakEvenPoints,
  MAX_CHART_POINTS,
  maxPayout,
  PAYOUT_STEPS,
  tokenPayout,
} from "@/helpers/payout";

export interface PayoutChartProps {
  /** Entry cost in dollars */
  entryCost: number;
  /** GLITCH token price in USD. Null = not yet loaded. */
  tokenPrice: number | null;
}

export const PayoutChart = ({ entryCost, tokenPrice }: PayoutChartProps) => {
  // When tokenPrice is available, show USD values; otherwise show raw token counts
  const hasPrice = tokenPrice != null && tokenPrice > 0;

  // Build step data from PAYOUT_STEPS (sorted ascending by threshold)
  const steps = [...PAYOUT_STEPS]
    .reverse()
    .map(([threshold, payout]) => {
      const tokens = (payout * entryCost) / BASE_COST;
      return {
        threshold,
        value: hasPrice ? tokens * tokenPrice : tokens,
      };
    });

  const maxTokens = maxPayout(entryCost);
  const maxVal = hasPrice ? maxTokens * tokenPrice : maxTokens;
  const bePoints = breakEvenPoints(entryCost, tokenPrice ?? undefined);
  const beTokens = tokenPayout(bePoints, entryCost);
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

  const yMax = maxVal * 1.1;
  const toX = (pts: number) => padL + (pts / MAX_CHART_POINTS) * plotW;
  const toY = (val: number) => padT + plotH - (val / yMax) * plotH;

  // Build staircase path: H to next threshold, then V to its payout
  let curvePath = `M ${toX(0)} ${toY(0)}`;
  for (let i = 0; i < steps.length; i++) {
    const nextThreshold =
      i < steps.length - 1 ? steps[i + 1].threshold : MAX_CHART_POINTS;
    curvePath += ` H ${toX(steps[i].threshold)} V ${toY(steps[i].value)}`;
    // Extend horizontally to next threshold
    curvePath += ` H ${toX(nextThreshold)}`;
  }

  // Base ($2) reference staircase
  const showBaseCurve = entryCost > BASE_COST;
  let basePath = "";
  if (showBaseCurve) {
    const baseSteps = [...PAYOUT_STEPS].reverse();
    basePath = `M ${toX(0)} ${toY(0)}`;
    for (let i = 0; i < baseSteps.length; i++) {
      const [threshold, payout] = baseSteps[i];
      const val = hasPrice ? payout * tokenPrice : payout;
      const nextThreshold =
        i < baseSteps.length - 1 ? baseSteps[i + 1][0] : MAX_CHART_POINTS;
      basePath += ` H ${toX(threshold)} V ${toY(val)}`;
      basePath += ` H ${toX(nextThreshold)}`;
    }
  }

  const labelColor = "rgba(54, 248, 24, 0.40)";
  const valueColor = "#36F818";
  const gridColor = "rgba(54, 248, 24, 0.06)";
  const lineColor = "#36F818";

  // X-axis labels — moonrock thresholds from the step function
  const xLabels = [0, 100, 150, 200, 250, MAX_CHART_POINTS];

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
  }, [entryCost]);

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
      {/* Horizontal grid at $0 */}
      <line
        x1={padL}
        y1={toY(0)}
        x2={padL + plotW}
        y2={toY(0)}
        stroke={gridColor}
        strokeWidth={0.5}
      />

      {/* Break-even dashed vertical line (top → intersection) */}
      <line
        x1={toX(bePoints)}
        y1={padT}
        x2={toX(bePoints)}
        y2={toY(beValue)}
        stroke={labelColor}
        strokeWidth={0.8}
        strokeDasharray="3 3"
      />

      {/* Break-even dashed horizontal line (left → intersection) */}
      <line
        x1={0}
        y1={toY(beValue)}
        x2={toX(bePoints)}
        y2={toY(beValue)}
        stroke={labelColor}
        strokeWidth={0.8}
        strokeDasharray="3 3"
      />

      {/* "BREAK EVEN" badge — positioned at the intersection */}
      <rect
        x={toX(bePoints) + 4}
        y={toY(beValue) - 7}
        width={70}
        height={14}
        rx={3}
        fill="rgba(54, 248, 24, 0.15)"
      />
      <text
        x={toX(bePoints) + 39}
        y={toY(beValue) + 4}
        textAnchor="middle"
        fill={valueColor}
        fontSize={7}
        className="font-secondary"
      >
        BREAK EVEN{" "}
        {hasPrice ? `$${beValue.toFixed(0)}` : beValue.toFixed(0)}
      </text>

      {/* Break-even dot */}
      <circle
        cx={toX(bePoints)}
        cy={toY(beValue)}
        r={3}
        fill="#FFFFFF"
        style={{
          opacity: animated ? 1 : 0,
          transition: animated ? "opacity 0.3s ease-out 1s" : "none",
        }}
      />

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
            y={
              toY(
                hasPrice
                  ? tokenPayout(MAX_CHART_POINTS, BASE_COST) * tokenPrice
                  : tokenPayout(MAX_CHART_POINTS, BASE_COST),
              ) + 10
            }
            textAnchor="end"
            fill={labelColor}
            fontSize={7}
            className="font-secondary"
          >
            {BASE_COST}x
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

      {/* X-axis labels (points) */}
      {xLabels.map((pts) => (
        <text
          key={`x-${pts}`}
          x={toX(pts)}
          y={padT + plotH + 16}
          textAnchor="middle"
          fill={labelColor}
          fontSize={8}
          className="font-secondary"
        >
          {pts}
        </text>
      ))}
    </svg>
  );
};
