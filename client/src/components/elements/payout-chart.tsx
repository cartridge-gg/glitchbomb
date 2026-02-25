import { useEffect, useMemo, useRef, useState } from "react";
import {
  breakEvenScore,
  cumulativeRewards,
  MAX_SCORE,
  toTokens,
} from "@/helpers/payout";

export interface PayoutChartProps {
  /** Stake multiplier (1–STARTERPACK_COUNT) */
  stake: number;
  /** GLITCH price in USD (from Ekubo). Null = price unavailable. */
  tokenPrice: number | null;
  /** Current token total supply (raw units). */
  supply?: bigint;
  /** Target token supply from config (raw units). */
  target?: bigint;
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

/** Helper to look up cumulative reward at a score from precomputed array. */
function cumulAt(arr: number[], score: number): number {
  if (score <= 0 || arr.length === 0) return 0;
  return arr[Math.min(score, arr.length) - 1];
}

/** Score sample points for the cumulative curve. */
const STEP_SCORES = Array.from({ length: 51 }, (_, i) => i * 10); // 0,10,20,...,500

export const PayoutChart = ({
  stake,
  tokenPrice,
  supply = 0n,
  target = 0n,
}: PayoutChartProps) => {
  const hasPrice = tokenPrice != null && tokenPrice > 0;

  const rewards = useMemo(
    () => cumulativeRewards(stake, supply, target),
    [stake, supply, target],
  );
  const baseRewardsArr = useMemo(
    () => (stake > 1 ? cumulativeRewards(1, supply, target) : []),
    [stake, supply, target],
  );

  // Y-axis always in GLITCH tokens (like Nums shows NUMS)
  const maxVal = toTokens(cumulAt(rewards, MAX_SCORE));
  const beScore = breakEvenScore(
    stake,
    tokenPrice ?? undefined,
    supply,
    target,
  );
  const beVal = toTokens(cumulAt(rewards, beScore));
  const showBreakEven = beScore < MAX_SCORE;

  // Chart dimensions
  const chartW = 320;
  const chartH = 220;
  const padL = 36;
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

  // Build smooth cumulative curve path
  const buildCurve = useMemo(() => {
    return (cumulArr: number[]) => {
      let path = "";
      for (let i = 0; i < STEP_SCORES.length; i++) {
        const score = STEP_SCORES[i];
        const val = toTokens(cumulAt(cumulArr, score));
        const x = toX(score);
        const y = toY(val);
        path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
      }
      return path;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yMax]);

  const curvePath = useMemo(() => buildCurve(rewards), [buildCurve, rewards]);
  const showBaseCurve = stake > 1;
  const basePath = useMemo(
    () => (showBaseCurve ? buildCurve(baseRewardsArr) : ""),
    [showBaseCurve, buildCurve, baseRewardsArr],
  );

  const lineColor = "#36F818";
  const labelColor = "rgba(54, 248, 24, 0.40)";
  const valueColor = "#36F818";
  const gridColor = "rgba(54, 248, 24, 0.06)";
  const pillBg = "rgba(54, 248, 24, 0.12)";
  const pillBorder = "rgba(54, 248, 24, 0.25)";

  // Y-axis ticks: always show GLITCH token amounts
  const yTicks = useMemo(() => {
    const ticks: { val: number; label: string; pill?: boolean }[] = [];

    ticks.push({
      val: maxVal,
      label: formatTokens(maxVal),
    });

    if (showBreakEven && Math.abs(beVal - maxVal) / yMax > 0.12) {
      ticks.push({
        val: beVal,
        label: formatTokens(beVal),
        pill: true,
      });
    }

    if (ticks.every((t) => t.val / yMax > 0.15)) {
      ticks.push({ val: 0, label: "0" });
    }

    return ticks;
  }, [maxVal, beVal, yMax, showBreakEven]);

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

      {/* Token price label */}
      {hasPrice && (
        <text
          x={padL + plotW}
          y={padT - 2}
          textAnchor="end"
          fill={labelColor}
          fontSize={7}
          className="font-secondary"
        >
          1 USD = {formatTokens(1 / tokenPrice)} GLITCH
        </text>
      )}

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
            y={padT - pillH / 2 - 2}
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
            y={toY(toTokens(cumulAt(baseRewardsArr, MAX_SCORE))) + 10}
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
        const labelW = tick.label.length * 4.5;
        const pillPad = 5;
        return (
          <g key={`y-${tick.val}`}>
            {tick.pill && (
              <rect
                x={textX - labelW - pillPad}
                y={y - pillH / 2}
                width={labelW + pillPad * 2}
                height={pillH}
                rx={pillRx}
                fill="#071E03"
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
