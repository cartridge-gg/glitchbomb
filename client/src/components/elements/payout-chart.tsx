import { useEffect, useMemo, useRef, useState } from "react";
import {
  breakEvenScore,
  MAX_SCORE,
  maxPayout,
  toTokens,
  tokenPayout,
} from "@/helpers/payout";

export interface PayoutChartProps {
  /** Stake multiplier (1–STARTERPACK_COUNT) */
  stake: number;
  /** Token price in USD. Null = show raw token values. */
  tokenPrice: number | null;
}

/** Format a token value for axis labels. */
function formatTokens(v: number): string {
  if (v === 0) return "0";
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  if (v >= 1) return v.toFixed(1);
  if (v >= 0.01) return v.toFixed(2);
  if (v >= 0.001) return v.toFixed(3);
  return v.toFixed(4);
}

/** Score milestones for the staircase (step-after). */
const STEP_SCORES = Array.from({ length: 21 }, (_, i) => i * 25); // 0,25,50,...,500

export const PayoutChart = ({ stake, tokenPrice }: PayoutChartProps) => {
  const hasPrice = tokenPrice != null && tokenPrice > 0;

  const maxTokens = toTokens(maxPayout(stake));
  const maxVal = hasPrice ? maxTokens * tokenPrice : maxTokens;
  const beScore = breakEvenScore(stake, tokenPrice ?? undefined);
  const beTokens = toTokens(tokenPayout(beScore, stake));
  const beVal = hasPrice ? beTokens * tokenPrice : beTokens;
  const showBreakEven = beScore < MAX_SCORE;

  // Chart dimensions
  const chartW = 320;
  const chartH = 220;
  const padL = 56;
  const padR = 14;
  const padT = showBreakEven ? 24 : 10;
  const padB = 32;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  const yMax = maxVal * 1.15 || 1;
  const toX = (score: number) => padL + (score / MAX_SCORE) * plotW;
  // sqrt scale so the lower values aren't crushed into a flat line
  const toY = (val: number) =>
    padT + plotH - (Math.sqrt(val) / Math.sqrt(yMax)) * plotH;

  // Build staircase path (step-after: hold value, then jump)
  const buildStaircase = useMemo(() => {
    return (stakeVal: number) => {
      let path = "";
      for (let i = 0; i < STEP_SCORES.length; i++) {
        const score = STEP_SCORES[i];
        const tokens = toTokens(tokenPayout(score, stakeVal));
        const val = hasPrice ? tokens * tokenPrice : tokens;
        const x = toX(score);
        const y = toY(val);

        if (i === 0) {
          path = `M ${x} ${y}`;
        } else {
          // Horizontal to current x at previous y, then vertical to current y
          const prevScore = STEP_SCORES[i - 1];
          const prevTokens = toTokens(tokenPayout(prevScore, stakeVal));
          const prevVal = hasPrice ? prevTokens * tokenPrice : prevTokens;
          const prevY = toY(prevVal);
          path += ` L ${x} ${prevY} L ${x} ${y}`;
        }
      }
      return path;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPrice, tokenPrice, yMax]);

  const curvePath = useMemo(
    () => buildStaircase(stake),
    [buildStaircase, stake]
  );
  const showBaseCurve = stake > 1;
  const basePath = useMemo(
    () => (showBaseCurve ? buildStaircase(1) : ""),
    [showBaseCurve, buildStaircase]
  );

  const lineColor = "#36F818";
  const labelColor = "rgba(54, 248, 24, 0.40)";
  const valueColor = "#36F818";
  const gridColor = "rgba(54, 248, 24, 0.06)";
  const pillBg = "rgba(54, 248, 24, 0.12)";
  const pillBorder = "rgba(54, 248, 24, 0.25)";

  // Y-axis ticks: always show max; show break-even if applicable; show 0 if room
  const yTicks = useMemo(() => {
    const ticks: { val: number; label: string; pill?: boolean }[] = [];
    const unit = hasPrice ? "USD" : "tokens";

    ticks.push({
      val: maxVal,
      label: hasPrice
        ? `$${formatTokens(maxVal)}`
        : `${formatTokens(maxVal)} ${unit}`,
    });

    if (showBreakEven && Math.abs(beVal - maxVal) / yMax > 0.12) {
      ticks.push({
        val: beVal,
        label: hasPrice
          ? `$${formatTokens(beVal)}`
          : `${formatTokens(beVal)} ${unit}`,
        pill: true,
      });
    }

    // Show 0 if there's room
    if (ticks.every((t) => t.val / yMax > 0.15)) {
      ticks.push({ val: 0, label: "0" });
    }

    return ticks;
  }, [maxVal, beVal, yMax, showBreakEven, hasPrice]);

  // X-axis ticks: 0, 100, 200, 300, 400, 500 + break-even
  const xTicks = useMemo(() => {
    const ticks: { score: number; label: string; pill?: boolean }[] = [];
    for (let s = 0; s <= MAX_SCORE; s += 100) {
      ticks.push({ score: s, label: `${s}` });
    }
    if (showBreakEven) {
      // Only add break-even if it doesn't overlap a 100-step tick
      const overlaps = ticks.some((t) => Math.abs(t.score - beScore) < 40);
      if (!overlaps) {
        ticks.push({ score: beScore, label: `${beScore}`, pill: true });
      }
    }
    return ticks;
  }, [beScore, showBreakEven]);

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
  }, [stake, tokenPrice]);

  useEffect(() => {
    if (phase !== "ready") return;
    const raf = requestAnimationFrame(() => setPhase("animate"));
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  const animated = phase === "animate";

  // Pill dimensions
  const pillH = 14;
  const pillRx = 4;

  return (
    <svg
      viewBox={`0 0 ${chartW} ${chartH}`}
      className="w-full"
      style={{ fontFamily: "inherit" }}
    >
      <defs>
        <filter id="label-shadow">
          <feDropShadow
            dx="0.5"
            dy="0.5"
            stdDeviation="0"
            floodColor="rgba(0,0,0,0.25)"
          />
        </filter>
      </defs>

      {/* Horizontal grid at 0 */}
      <line
        x1={padL}
        y1={toY(0)}
        x2={padL + plotW}
        y2={toY(0)}
        stroke={gridColor}
        strokeWidth={0.5}
      />

      {/* Break-even crosshairs */}
      {showBreakEven && (
        <>
          {/* Vertical dashed line: top of chart → intersection */}
          <line
            x1={toX(beScore)}
            y1={padT}
            x2={toX(beScore)}
            y2={toY(beVal)}
            stroke={labelColor}
            strokeWidth={0.8}
            strokeDasharray="3 3"
          />

          {/* Horizontal dashed line: Y-axis → intersection */}
          <line
            x1={padL}
            y1={toY(beVal)}
            x2={toX(beScore)}
            y2={toY(beVal)}
            stroke={labelColor}
            strokeWidth={0.8}
            strokeDasharray="3 3"
          />

          {/* Break-even dot */}
          <circle
            cx={toX(beScore)}
            cy={toY(beVal)}
            r={3}
            fill="#FFFFFF"
            stroke="rgba(0,0,0,0.3)"
            strokeWidth={0.5}
            style={{
              opacity: animated ? 1 : 0,
              transition: animated ? "opacity 0.3s ease-out 1s" : "none",
            }}
          />

          {/* "Break Even" pill at top of vertical line */}
          <rect
            x={toX(beScore) - 30}
            y={padT - pillH - 2}
            width={60}
            height={pillH}
            rx={pillRx}
            fill={pillBg}
            stroke={pillBorder}
            strokeWidth={0.5}
          />
          <text
            x={toX(beScore)}
            y={padT - pillH / 2 + 1}
            textAnchor="middle"
            dominantBaseline="central"
            fill={valueColor}
            fontSize={7}
            letterSpacing="0.04em"
            className="font-secondary"
            filter="url(#label-shadow)"
          >
            BREAK EVEN
          </text>
        </>
      )}

      {/* Base tier reference curve (dimmed staircase) */}
      {showBaseCurve && (
        <>
          <path
            d={basePath}
            fill="none"
            stroke="rgba(54, 248, 24, 0.20)"
            strokeWidth={1}
          />
          <text
            x={padL + plotW - 2}
            y={
              toY(
                hasPrice
                  ? toTokens(maxPayout(1)) * tokenPrice
                  : toTokens(maxPayout(1))
              ) + 10
            }
            textAnchor="end"
            fill={labelColor}
            fontSize={7}
            className="font-secondary"
          >
            1x
          </text>
        </>
      )}

      {/* Main payout staircase — animated draw */}
      <path
        ref={pathRef}
        d={curvePath}
        fill="none"
        stroke={lineColor}
        strokeWidth={1.5}
        className="glitch-icon"
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

      {/* Y-axis ticks */}
      {yTicks.map((tick) => {
        const y = toY(tick.val);
        const textX = padL - 4;
        const textW = tick.label.length * 4.5 + 6;
        return (
          <g key={`y-${tick.val}`}>
            {tick.pill && (
              <rect
                x={textX - textW / 2 - 12}
                y={y - pillH / 2}
                width={textW + 8}
                height={pillH}
                rx={pillRx}
                fill={pillBg}
                stroke={pillBorder}
                strokeWidth={0.5}
              />
            )}
            <text
              x={textX}
              y={y}
              textAnchor="end"
              dominantBaseline="central"
              fill={tick.pill ? valueColor : labelColor}
              fontSize={7}
              letterSpacing="0.03em"
              className="font-secondary"
              filter={tick.pill ? "url(#label-shadow)" : undefined}
            >
              {tick.label}
            </text>
          </g>
        );
      })}

      {/* X-axis ticks */}
      {xTicks.map((tick) => {
        const x = toX(tick.score);
        const y = padT + plotH + 14;
        const textW = tick.label.length * 5 + 8;
        return (
          <g key={`x-${tick.score}`}>
            {tick.pill && (
              <rect
                x={x - textW / 2}
                y={y - pillH / 2}
                width={textW}
                height={pillH}
                rx={pillRx}
                fill={pillBg}
                stroke={pillBorder}
                strokeWidth={0.5}
              />
            )}
            <text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              fill={tick.pill ? valueColor : labelColor}
              fontSize={8}
              letterSpacing="0.04em"
              className="font-secondary"
              filter={tick.pill ? "url(#label-shadow)" : undefined}
            >
              {tick.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
