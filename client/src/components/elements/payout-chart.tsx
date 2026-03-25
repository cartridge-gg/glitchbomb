import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cumulativeRewards, MAX_SCORE, toTokens } from "@/helpers/payout";

export interface PayoutChartProps {
  /** Stake multiplier (1–STARTERPACK_COUNT) */
  stake: number;
  /** GLITCH price in USD (from Ekubo). Null = price unavailable. */
  tokenPrice: number | null;
  /** Current token total supply (raw units). */
  supply?: bigint;
  /** Target token supply from config (raw units). */
  target?: bigint;
  /** Player's final score (moonrocks earned). When provided, renders a "YOU" marker on the curve. */
  score?: number;
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
  score,
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

  // Hover / touch interaction state
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverScore, setHoverScore] = useState<number | null>(null);

  // Chart dimensions
  const chartW = 320;
  const chartH = 220;
  const padL = 36;
  const padR = 14;
  const padT = 10;
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

  // Score marker position
  const showScore = score != null;
  const scoreVal = showScore ? toTokens(cumulAt(rewards, score)) : 0;

  const lineColor = "#36F818";
  const labelColor = "rgba(54, 248, 24, 0.40)";
  const valueColor = "#36F818";
  const gridColor = "rgba(54, 248, 24, 0.06)";
  const pillBg = "rgba(54, 248, 24, 0.12)";
  const pillBorder = "rgba(54, 248, 24, 0.25)";
  const scoreColor = "#FFFFFF";
  const scorePillBg = "rgba(255, 255, 255, 0.15)";
  const scorePillBorder = "rgba(255, 255, 255, 0.35)";

  // Y-axis ticks: always show GLITCH token amounts
  const yTicks = useMemo(() => {
    const ticks: { val: number; label: string }[] = [];

    ticks.push({
      val: maxVal,
      label: formatTokens(maxVal),
    });

    if (ticks.every((t) => t.val / yMax > 0.15)) {
      ticks.push({ val: 0, label: "0" });
    }

    return ticks;
  }, [maxVal, yMax]);

  // X-axis ticks: 0, 100, 200, 300, 400, 500
  const xTicks = useMemo(() => {
    const ticks: { score: number; label: string }[] = [];
    for (let s = 0; s <= MAX_SCORE; s += 100) {
      ticks.push({ score: s, label: `${s}` });
    }
    return ticks;
  }, []);

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

  // Pointer → score conversion for interactivity
  const pointerToScore = useCallback(
    (e: ReactPointerEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg) return null;
      const rect = svg.getBoundingClientRect();
      // Map client position into SVG viewBox coordinates
      const clientX = e.clientX - rect.left;
      const svgX = (clientX / rect.width) * chartW;
      // Clamp to plot area and convert to score
      const clampedX = Math.max(padL, Math.min(svgX, padL + plotW));
      const s = Math.round(((clampedX - padL) / plotW) * MAX_SCORE);
      return Math.max(0, Math.min(s, MAX_SCORE));
    },
    [chartW, padL, plotW],
  );

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<SVGSVGElement>) => {
      setHoverScore(pointerToScore(e));
    },
    [pointerToScore],
  );

  const handlePointerLeave = useCallback(() => {
    setHoverScore(null);
  }, []);

  // Hover reward value
  const hoverVal =
    hoverScore != null ? toTokens(cumulAt(rewards, hoverScore)) : 0;

  // Pill dimensions
  const pillH = 14;
  const pillRx = 4;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${chartW} ${chartH}`}
      className="w-full"
      style={{ fontFamily: "inherit", touchAction: "none" }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
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

      {/* Hover crosshairs + reward tooltip */}
      {hoverScore != null &&
        (() => {
          const hx = toX(hoverScore);
          const hy = toY(hoverVal);
          const tooltipLabel = `${formatTokens(hoverVal)} GLITCH`;
          const tooltipW = tooltipLabel.length * 4.2 + 14;
          // Place tooltip above the dot; if near top, place below
          const tooltipAbove = hy - 20 >= padT;
          const tooltipY = tooltipAbove ? hy - 18 : hy + 8;
          // Clamp horizontally
          const tooltipX = Math.max(
            padL,
            Math.min(hx - tooltipW / 2, padL + plotW - tooltipW),
          );
          return (
            <>
              {/* Vertical dashed line: dot → X-axis */}
              <line
                x1={hx}
                y1={hy}
                x2={hx}
                y2={toY(0)}
                stroke={labelColor}
                strokeWidth={0.6}
                strokeDasharray="2 2"
              />
              {/* Horizontal dashed line: Y-axis → dot */}
              <line
                x1={padL}
                y1={hy}
                x2={hx}
                y2={hy}
                stroke={labelColor}
                strokeWidth={0.6}
                strokeDasharray="2 2"
              />
              {/* Dot on curve */}
              <circle
                cx={hx}
                cy={hy}
                r={3}
                fill={lineColor}
                stroke="rgba(0,0,0,0.3)"
                strokeWidth={0.5}
              />
              {/* Tooltip pill */}
              <rect
                x={tooltipX}
                y={tooltipY}
                width={tooltipW}
                height={pillH}
                rx={pillRx}
                fill={pillBg}
                stroke={pillBorder}
                strokeWidth={0.5}
              />
              <text
                x={tooltipX + tooltipW / 2}
                y={tooltipY + pillH / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fill={valueColor}
                fontSize={7}
                letterSpacing="0.03em"
                className="font-secondary"
                filter="url(#label-shadow)"
              >
                {tooltipLabel}
              </text>
              {/* Score label on X-axis */}
              <text
                x={hx}
                y={padT + plotH + 14}
                textAnchor="middle"
                dominantBaseline="central"
                fill={valueColor}
                fontSize={8}
                letterSpacing="0.04em"
                className="font-secondary"
              >
                {hoverScore}
              </text>
            </>
          );
        })()}

      {/* Score marker crosshairs (rendered after curve so they appear on top) */}
      {showScore &&
        (() => {
          const sx = toX(score);
          const sy = toY(scoreVal);
          const dotR = 4;
          const markerColor = scoreColor;
          const markerPillBg = scorePillBg;
          const markerPillBorder = scorePillBorder;
          // Place pill above the dot; if near top, place below
          const pillAbove = sy - dotR - pillH - 4 >= padT;
          const pillY = pillAbove ? sy - dotR - pillH - 2 : sy + dotR + 2;
          const youPillW = 30;
          // Clamp horizontally so pill stays inside chart
          const pillX = Math.max(
            padL,
            Math.min(sx - youPillW / 2, padL + plotW - youPillW),
          );
          return (
            <>
              {/* Vertical dashed line: dot → X-axis */}
              <line
                x1={sx}
                y1={sy + dotR}
                x2={sx}
                y2={toY(0)}
                stroke={markerPillBorder}
                strokeWidth={0.8}
                strokeDasharray="3 3"
              />

              {/* Horizontal dashed line: Y-axis → dot */}
              {score > 0 && (
                <line
                  x1={padL}
                  y1={sy}
                  x2={sx - dotR}
                  y2={sy}
                  stroke={markerPillBorder}
                  strokeWidth={0.8}
                  strokeDasharray="3 3"
                />
              )}

              {/* Score dot */}
              <circle
                cx={sx}
                cy={sy}
                r={dotR}
                fill={markerColor}
                stroke="rgba(0,0,0,0.4)"
                strokeWidth={0.5}
                style={{
                  opacity: animated ? 1 : 0,
                  transition: animated ? "opacity 0.3s ease-out 1s" : "none",
                }}
              />

              {/* "YOU" pill above/below the dot */}
              <rect
                x={pillX}
                y={pillY}
                width={youPillW}
                height={pillH}
                rx={pillRx}
                fill={markerPillBg}
                stroke={markerPillBorder}
                strokeWidth={0.5}
                style={{
                  opacity: animated ? 1 : 0,
                  transition: animated ? "opacity 0.3s ease-out 1s" : "none",
                }}
              />
              <text
                x={pillX + youPillW / 2}
                y={pillY + pillH / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fill={markerColor}
                fontSize={7}
                letterSpacing="0.06em"
                className="font-secondary"
                filter="url(#label-shadow)"
                style={{
                  opacity: animated ? 1 : 0,
                  transition: animated ? "opacity 0.3s ease-out 1s" : "none",
                }}
              >
                YOU
              </text>
            </>
          );
        })()}

      {/* Y-axis ticks */}
      {yTicks.map((tick) => {
        const y = toY(tick.val);
        const textX = padL - 4;
        return (
          <g key={`y-${tick.val}`}>
            <text
              x={textX}
              y={y}
              textAnchor="end"
              dominantBaseline="central"
              fill={labelColor}
              fontSize={7}
              letterSpacing="0.03em"
              className="font-secondary"
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
        return (
          <g key={`x-${tick.score}`}>
            <text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              fill={labelColor}
              fontSize={8}
              letterSpacing="0.04em"
              className="font-secondary"
            >
              {tick.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
