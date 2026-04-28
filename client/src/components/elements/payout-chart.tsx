import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { MAX_SCORE, maxPayout, scoreRewards, toTokens } from "@/helpers/payout";

export interface PayoutChartProps {
  /** Stake multiplier (1–STARTERPACK_COUNT) */
  stake: number;
  /** GLITCH price in USD (from Ekubo). Null = price unavailable. */
  tokenPrice: number | null;
  /** Current token total supply (raw units). */
  supply?: bigint;
  /** Target token supply from config (raw units). */
  target?: bigint;
  /** Player's final score. When provided, renders a "YOU" marker on the curve. */
  score?: number;
}

/** Compact token formatter for labels (e.g., "128", "1.2k"). */
function formatTokens(v: number): string {
  if (v === 0) return "0";
  if (v >= 10000) return `${Math.round(v / 1000)}k`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  if (v >= 10) return Math.round(v).toString();
  if (v >= 1) return v.toFixed(1);
  if (v >= 0.01) return v.toFixed(2);
  return v.toFixed(3);
}

/** Look up cumulative reward at a given score from a precomputed array. */
function cumulAt(arr: number[], score: number): number {
  if (score <= 0 || arr.length === 0) return 0;
  return arr[Math.min(score, arr.length) - 1];
}

const X_TICK_VALUES = [100, 200, 300, 400, 500] as const;

const CHART_W = 404;
const CHART_H = 204;
const PAD_L = 20;
const PAD_R = 20;
// PAD_T aligns the curve endpoint with the flag's vertical center.
const PAD_T = 12;
// PAD_B prevents the curve's stroke from being clipped at the X-axis edge.
const PAD_B = 8;
const PLOT_W = CHART_W - PAD_L - PAD_R;
const PLOT_H = CHART_H - PAD_T - PAD_B;

const FLAG_W = 103.74;
const FLAG_BODY_W = 93;
const FLAG_TIP_W = FLAG_W - FLAG_BODY_W;
const FLAG_H = 24;
const FLAG_RIGHT = CHART_W - PAD_R;

const LINE_COLOR = "#36F818";
const BASE_LINE_COLOR = "rgba(54, 248, 24, 0.20)";
const FLAG_FILL = "#36F818";
const FLAG_TEXT_COLOR = "#040603";
const TOOLTIP_DASH = "rgba(255, 255, 255, 0.35)";
const TOOLTIP_PILL_BORDER = "rgba(255, 255, 255, 0.35)";

export const PayoutChart = ({
  stake,
  tokenPrice,
  supply = 0n,
  target = 0n,
  score,
}: PayoutChartProps) => {
  const rewards = useMemo(
    () => scoreRewards(stake, supply, target),
    [stake, supply, target],
  );
  const baseRewardsArr = useMemo(
    () => (stake > 1 ? scoreRewards(1, supply, target) : []),
    [stake, supply, target],
  );

  const maxTokens = useMemo(
    () => toTokens(maxPayout(stake, supply, target)),
    [stake, supply, target],
  );
  const maxUsd =
    tokenPrice != null && tokenPrice > 0 && maxTokens > 0
      ? maxTokens * tokenPrice
      : null;
  const maxUsdLabel = maxUsd != null ? `$${maxUsd.toFixed(2)}` : null;
  const flagLabel = `${formatTokens(maxTokens)} GLITCH`;

  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverScore, setHoverScore] = useState<number | null>(null);
  const isHovering = hoverScore != null;

  // sqrt scale on Y so low values aren't crushed into a flat line.
  const yMax = maxTokens || 1;
  const toX = (s: number) => PAD_L + (s / MAX_SCORE) * PLOT_W;
  const toY = (val: number) =>
    PAD_T + PLOT_H - (Math.sqrt(val) / Math.sqrt(yMax)) * PLOT_H;

  const buildCurve = useMemo(() => {
    const curveToX = (s: number) => PAD_L + (s / MAX_SCORE) * PLOT_W;
    const curveToY = (val: number) =>
      PAD_T + PLOT_H - (Math.sqrt(val) / Math.sqrt(yMax)) * PLOT_H;
    return (rewardArr: number[]) => {
      const maxScore = rewardArr.length;
      if (maxScore === 0) return "";
      let path = `M ${curveToX(0)} ${curveToY(0)}`;
      let prevTokens = 0;
      for (let s = 1; s <= maxScore; s++) {
        const tokens = toTokens(rewardArr[s - 1]);
        if (tokens !== prevTokens) {
          path += ` L ${curveToX(s)} ${curveToY(prevTokens)}`;
          path += ` L ${curveToX(s)} ${curveToY(tokens)}`;
          prevTokens = tokens;
        }
      }
      path += ` L ${curveToX(maxScore)} ${curveToY(prevTokens)}`;
      return path;
    };
  }, [yMax]);

  const curvePath = useMemo(() => buildCurve(rewards), [buildCurve, rewards]);
  const showBaseCurve = stake > 1;
  const basePath = useMemo(
    () => (showBaseCurve ? buildCurve(baseRewardsArr) : ""),
    [showBaseCurve, buildCurve, baseRewardsArr],
  );

  const showScore = score != null;
  const scoreVal = showScore ? toTokens(cumulAt(rewards, score)) : 0;

  const pointerToScore = useCallback((e: ReactPointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const svgX = (clientX / rect.width) * CHART_W;
    const clampedX = Math.max(PAD_L, Math.min(svgX, PAD_L + PLOT_W));
    const s = Math.round(((clampedX - PAD_L) / PLOT_W) * MAX_SCORE);
    return Math.max(0, Math.min(s, MAX_SCORE));
  }, []);

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<SVGSVGElement>) => {
      setHoverScore(pointerToScore(e));
    },
    [pointerToScore],
  );
  const handlePointerLeave = useCallback(() => setHoverScore(null), []);

  const hoverVal =
    hoverScore != null ? toTokens(cumulAt(rewards, hoverScore)) : 0;

  const flagPoints = [
    `${FLAG_TIP_W},${FLAG_H / 2}`,
    "0,0",
    `${FLAG_W},0`,
    `${FLAG_W},${FLAG_H}`,
    `0,${FLAG_H}`,
  ].join(" ");
  const flagTextX = FLAG_TIP_W + FLAG_BODY_W / 2;
  const flagTextY = FLAG_H / 2;

  const flagRightPct = ((CHART_W - FLAG_RIGHT) / CHART_W) * 100;
  const hoverHx = hoverScore != null ? toX(hoverScore) : 0;
  const hoverHy = hoverScore != null ? toY(hoverVal) : 0;
  const hxPct = (hoverHx / CHART_W) * 100;
  const hyPct = (hoverHy / CHART_H) * 100;
  const yPillLeftPct = (PAD_L / CHART_W) * 100;

  const scoreSx = showScore ? toX(score) : 0;
  const scoreSy = showScore ? toY(scoreVal) : 0;
  const scoreXPct = (scoreSx / CHART_W) * 100;
  const scoreYPct = (scoreSy / CHART_H) * 100;

  return (
    <div
      className="@container/pc flex h-full w-full min-h-0 min-w-0 flex-1 flex-col font-secondary"
      style={{ containerType: "inline-size" }}
    >
      <div className="relative min-h-0 min-w-0 flex-1">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          className="absolute inset-0 block h-full w-full"
          preserveAspectRatio="none"
          style={{ touchAction: "none" }}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          aria-label="Payout Chart"
          role="img"
        >
          {showBaseCurve && (
            <path
              d={basePath}
              fill="none"
              stroke={BASE_LINE_COLOR}
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          )}

          <path
            d={curvePath}
            fill="none"
            stroke={LINE_COLOR}
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
            style={{
              filter:
                "drop-shadow(2px 2px 0 rgba(255,0,0,0.35)) drop-shadow(-2px -2px 0 rgba(0,0,255,0.35))",
            }}
          />

          {hoverScore != null && (
            <>
              <line
                x1={hoverHx}
                y1={hoverHy}
                x2={hoverHx}
                y2={CHART_H}
                stroke={TOOLTIP_DASH}
                strokeWidth={1}
                strokeDasharray="3 3"
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1={PAD_L}
                y1={hoverHy}
                x2={hoverHx}
                y2={hoverHy}
                stroke={TOOLTIP_DASH}
                strokeWidth={1}
                strokeDasharray="3 3"
                vectorEffect="non-scaling-stroke"
              />
            </>
          )}

          {showScore && !isHovering && (
            <>
              <line
                x1={scoreSx}
                y1={scoreSy}
                x2={scoreSx}
                y2={CHART_H}
                stroke={TOOLTIP_PILL_BORDER}
                strokeWidth={1}
                strokeDasharray="3 3"
                vectorEffect="non-scaling-stroke"
              />
              {score > 0 && (
                <line
                  x1={PAD_L}
                  y1={scoreSy}
                  x2={scoreSx}
                  y2={scoreSy}
                  stroke={TOOLTIP_PILL_BORDER}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  vectorEffect="non-scaling-stroke"
                />
              )}
            </>
          )}
        </svg>

        {maxUsdLabel && (
          <div className="pointer-events-none absolute left-0 top-0 z-10 font-secondary text-tertiary-100">
            <div className="flex items-start gap-[2px]">
              <span className="font-secondary text-[32px] leading-[0.7]">
                {maxUsdLabel}
              </span>
            </div>
            <div className="mt-[6px] font-secondary text-[16px] leading-[0.7]">
              Max Reward
            </div>
          </div>
        )}

        <div
          className="pointer-events-none absolute top-0 z-10"
          style={{
            right: `calc(${flagRightPct}% - 1.25px)`,
            width: `${FLAG_W}px`,
            height: `${FLAG_H}px`,
          }}
        >
          <svg
            viewBox={`0 0 ${FLAG_W} ${FLAG_H}`}
            className="block h-full w-full"
            aria-hidden="true"
          >
            <polygon points={flagPoints} fill={FLAG_FILL} />
            <text
              x={flagTextX}
              y={flagTextY}
              textAnchor="middle"
              dominantBaseline="central"
              fill={FLAG_TEXT_COLOR}
              fontSize={16}
              letterSpacing="0.02em"
              className="font-secondary"
            >
              {flagLabel}
            </text>
          </svg>
        </div>

        {hoverScore != null && (
          <>
            <div
              className="pointer-events-none absolute z-20 size-[6px] rounded-full border border-black/60 bg-white"
              style={{
                left: `${hxPct}%`,
                top: `${hyPct}%`,
                transform: "translate(-50%, -50%)",
              }}
            />
            <div
              className="pointer-events-none absolute z-20 whitespace-nowrap rounded-[4px] bg-[#1a1d1e] px-[6px] py-[4px] font-secondary text-[14px] leading-[0.7] text-white"
              style={{
                left: `${yPillLeftPct}%`,
                top: `${hyPct}%`,
                transform: "translateY(-50%)",
              }}
            >
              {formatTokens(hoverVal)} GLITCH
            </div>
          </>
        )}

        {showScore && !isHovering && (
          <>
            <div
              className="pointer-events-none absolute z-20 size-[8px] rounded-full border border-black/60 bg-white"
              style={{
                left: `${scoreXPct}%`,
                top: `${scoreYPct}%`,
                transform: "translate(-50%, -50%)",
              }}
            />
            <div
              className="pointer-events-none absolute z-20 rounded-[4px] border border-white/35 bg-white/12 px-[6px] py-[3px] font-secondary text-[10px] font-bold uppercase leading-none tracking-[0.1em] text-white"
              style={{
                left: `${scoreXPct}%`,
                top: `${scoreYPct}%`,
                transform: "translate(-50%, calc(-100% - 10px))",
              }}
            >
              YOU
            </div>
          </>
        )}
      </div>

      <div className="relative flex items-center pt-3 font-secondary text-white-100">
        {hoverScore != null && (
          <div
            className="pointer-events-none absolute top-0 h-3 border-l border-dashed border-white/35"
            style={{ left: `${(toX(hoverScore) / CHART_W) * 100}%` }}
          />
        )}
        {showScore && !isHovering && (
          <div
            className="pointer-events-none absolute top-0 h-3 border-l border-dashed border-white/35"
            style={{ left: `${(toX(score) / CHART_W) * 100}%` }}
          />
        )}
        <span className="flex-1 text-center font-secondary text-[14px] leading-[0.7] uppercase">
          Score
        </span>
        {X_TICK_VALUES.map((n) => (
          <span
            key={n}
            className="flex-1 text-center font-secondary text-[14px] leading-[0.7]"
          >
            {n}+
          </span>
        ))}
        {isHovering && hoverScore != null && (
          <span
            className="pointer-events-none absolute top-3 -translate-x-1/2 whitespace-nowrap rounded-[4px] bg-[#1a1d1e] px-[6px] py-[4px] font-secondary text-[14px] leading-[0.7]"
            style={{ left: `${(toX(hoverScore) / CHART_W) * 100}%` }}
          >
            {hoverScore}
          </span>
        )}
      </div>
    </div>
  );
};
