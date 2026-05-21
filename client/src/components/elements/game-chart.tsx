import type { TouchEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ComposedChart,
  Line,
  type MouseHandlerDataParam,
  ResponsiveContainer,
  Tooltip,
  type TooltipContentProps,
  XAxis,
  YAxis,
} from "recharts";
import type { OrbPulled } from "@/models";

export interface GameChartDataPoint {
  value: number; // The P/L value at this point (delta or absolute based on mode)
  variant: "green" | "red" | "yellow" | "blue" | "pink"; // Color of the dot
  id?: number; // Optional unique ID for animation keys
  /**
   * Optional id of the orb pull associated with this point. When set and a
   * matching pull exists in `pulls`, hovering/tapping the point opens a
   * tooltip describing the pull. Data points that are not pulls (e.g.
   * level markers) should leave this undefined.
   */
  pullId?: number;
}

export interface GameChartProps {
  data: GameChartDataPoint[];
  className?: string;
  mode?: "delta" | "absolute"; // delta = value is change per point, absolute = value is total at each point
  title?: string; // Custom title (default: "P/L")
  baseline?: number; // The baseline value (default: 0 for delta, 100 for absolute)
  goal?: number; // Goal value for the level — sets the chart's y-axis max
  /**
   * Optional list of orb pulls. When provided, hovering/tapping a chart
   * point opens a tooltip describing the corresponding pulled orb. The
   * pulls must be ordered (or orderable by `id`) so the i-th pull maps
   * to the i-th data point.
   */
  pulls?: OrbPulled[];
}

// Margin around the plotting area, in px. Sized so the dots (r=6) can't
// touch the chart edges — 10px = circle radius (6) + 4px breathing room.
const CHART_MARGIN = { top: 10, right: 10, bottom: 10, left: 10 } as const;

// Extra horizontal padding on the X axis, expressed in domain units, so
// the first and last points aren't flush against the plot edges. Mirrors
// the vertical padding we apply via yRange — keeps dots away from the
// corners and makes their tooltip trigger zone easier to hit (especially
// on touch, where the screen edge would otherwise eat half the dot).
const X_AXIS_PADDING = 0.5;

// Map variant to actual color
const getVariantColor = (variant: GameChartDataPoint["variant"]): string => {
  switch (variant) {
    case "green":
      return "#36F818"; // --green-400
    case "red":
      return "#FFFFFF"; // white for bombs
    case "blue":
      return "#9747FF"; // --blue-100
    case "yellow":
      return "#FACC15"; // yellow-400, used for level markers
    case "pink":
      return "#FF0099"; // --orb-heart
    default:
      return "#36F818";
  }
};

const getGlowFilterId = (color: string): string => {
  if (color === "#36F818") return "gc-glow-green";
  if (color === "#FFFFFF") return "gc-glow-white";
  if (color === "#9747FF") return "gc-glow-blue";
  if (color === "#FF0099") return "gc-glow-pink";
  return "gc-glow-yellow";
};

interface CumulativePoint extends GameChartDataPoint {
  cumulative: number;
  index: number;
  resolvedId: number;
}

// Recharts calls dot renderers with these (subset of) props.
interface DotPayload {
  cx?: number;
  cy?: number;
  index?: number;
  payload?: {
    variant?: GameChartDataPoint["variant"];
    resolvedId?: number;
    pullId?: number;
  };
}

/**
 * Render a single chart dot as an SVG circle with a colored glow.
 *
 * Tooltips are NOT attached per-dot anymore — Recharts' native <Tooltip>
 * component handles hover/touch with magnet snapping to the nearest point
 * on the X axis. See the <Tooltip> instance in GameChart for details.
 */
const RenderDot = (props: DotPayload) => {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null) {
    return <g />;
  }
  const variant = payload?.variant ?? "green";
  const color = getVariantColor(variant);
  const filterName = getGlowFilterId(color);
  const isBomb = color === "#FFFFFF";
  const dotKey = `dot-${payload?.resolvedId ?? `${cx}-${cy}`}`;

  return (
    <g key={dotKey} className={isBomb ? "glitch-icon" : undefined}>
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill={color}
        stroke="rgba(255,255,255,0.8)"
        strokeWidth={1}
        filter={`url(#${filterName})`}
      />
    </g>
  );
};

/**
 * Build a Recharts <Tooltip> content renderer that shows the pulled orb's
 * category + effect for the currently-active data point. Returns null for
 * points that don't correspond to a pull (e.g. level markers), so Recharts
 * doesn't render an empty tooltip card.
 *
 * Recharts feeds `payload[0].payload` — the original data row — through
 * which we read `pullId` and look up the pull in the closure's Map.
 */
type ChartTooltipRow = {
  pullId?: number;
  variant?: GameChartDataPoint["variant"];
};

const makeTooltipContent = (pullsById: Map<number, OrbPulled> | undefined) => {
  const ChartTooltipContent = ({ active, payload }: TooltipContentProps) => {
    if (!active || payload.length === 0) return null;
    const row = payload[0]?.payload as ChartTooltipRow | undefined;
    if (row?.pullId == null || pullsById == null) return null;

    const pull = pullsById.get(row.pullId);
    const orb = pull?.orb;
    const hasOrbMethods =
      orb != null &&
      typeof orb.color === "function" &&
      typeof orb.logCategory === "function" &&
      typeof orb.logEffect === "function";
    if (!hasOrbMethods) return null;

    const orbColor = orb.color();
    return (
      <div className="flex flex-col gap-2 bg-black-100 border border-white-800 p-3 max-w-[200px] rounded-md">
        <p
          className="font-secondary text-base/3 uppercase"
          style={{ color: orbColor }}
        >
          {orb.logCategory()}
        </p>
        <p
          className="font-secondary text-sm/3 opacity-80"
          style={{ color: orbColor }}
        >
          {orb.logEffect()}
        </p>
      </div>
    );
  };
  return ChartTooltipContent;
};

// Defs containing all SVG filters used by the custom layer.
const ChartFilters = () => (
  <defs>
    <filter id="gc-glow-green" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="gc-glow-white" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="gc-glow-blue" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="gc-glow-yellow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="gc-glow-pink" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    {/* Glitch filter for chart lines — red/blue chromatic split */}
    <filter
      id="gc-glitch-line"
      filterUnits="userSpaceOnUse"
      x="0"
      y="0"
      width="100%"
      height="100%"
      colorInterpolationFilters="sRGB"
    >
      <feOffset in="SourceGraphic" dx="0" dy="0" result="base" />
      <feOffset in="SourceGraphic" dx="-2" dy="0" result="red-shift">
        <animate
          attributeName="dx"
          values="0;0;0;0;0;-3;3;-2;0;0;0;0;0;0;0;0;0;2;-3;2;0;0;0;0;0;0;0;0;0;-2;3;-3;0;0;0;0"
          dur="2.5s"
          repeatCount="indefinite"
        />
      </feOffset>
      <feOffset in="SourceGraphic" dx="2" dy="0" result="blue-shift">
        <animate
          attributeName="dx"
          values="0;0;0;0;0;3;-3;2;0;0;0;0;0;0;0;0;0;-2;3;-2;0;0;0;0;0;0;0;0;0;2;-3;3;0;0;0;0"
          dur="2.5s"
          repeatCount="indefinite"
        />
      </feOffset>
      <feColorMatrix
        in="red-shift"
        type="matrix"
        values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.7 0"
        result="red-channel"
      />
      <feColorMatrix
        in="blue-shift"
        type="matrix"
        values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 0.7 0"
        result="blue-channel"
      />
      <feBlend
        in="red-channel"
        in2="blue-channel"
        mode="screen"
        result="aberration"
      />
      <feBlend in="base" in2="aberration" mode="screen" />
    </filter>
  </defs>
);

export const GameChart = ({
  data,
  className = "",
  mode = "delta",
  title = "P/L",
  baseline: baselineProp,
  goal,
  pulls,
}: GameChartProps) => {
  // Default baseline: 0 for delta mode, 100 for absolute mode
  const baseline = baselineProp ?? (mode === "absolute" ? 100 : 0);

  // Build a lookup of pull by id so each data point can resolve its
  // corresponding pull (data points and pulls share the same id space,
  // but plData may include entries with no matching pull such as level
  // markers, so index-based mapping is incorrect).
  const pullsById = useMemo(() => {
    if (!pulls) return undefined;
    const map = new Map<number, OrbPulled>();
    for (const pull of pulls) {
      map.set(pull.id, pull);
    }
    return map;
  }, [pulls]);
  const tooltipContent = useMemo(
    () => makeTooltipContent(pullsById),
    [pullsById],
  );

  // Detect touch / no-hover device. On hover-capable devices we let Recharts'
  // <Tooltip> handle hover natively (with magnet snap on the X axis). On
  // touch devices we control `active` + `defaultIndex` ourselves so the
  // tooltip opens on tap, follows the finger on slide, and only closes
  // when the user taps outside the chart.
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: none)");
    setIsTouchDevice(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsTouchDevice(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const [mobileActiveIndex, setMobileActiveIndex] = useState<
    number | undefined
  >(undefined);
  // Desktop hover-driven active index. We mirror Recharts' internal
  // `activeTooltipIndex` here so we can draw a vertical reference line on
  // the active point (Recharts doesn't expose its hover index through a
  // public prop). Only used when not on a touch device.
  const [desktopActiveIndex, setDesktopActiveIndex] = useState<
    number | undefined
  >(undefined);
  const chartAreaRef = useRef<HTMLDivElement>(null);

  // The single index the reference line tracks: mobile state on touch
  // devices, desktop hover state otherwise. `undefined` hides the line.
  const activeIndex = isTouchDevice ? mobileActiveIndex : desktopActiveIndex;

  // Close mobile tooltip when the user taps outside the chart area.
  useEffect(() => {
    if (!isTouchDevice || mobileActiveIndex == null) return;
    const onPointerDown = (e: PointerEvent) => {
      const node = chartAreaRef.current;
      if (!node) return;
      if (!node.contains(e.target as Node)) {
        setMobileActiveIndex(undefined);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isTouchDevice, mobileActiveIndex]);

  // Recharts v3: activeTooltipIndex is number | string | null | undefined.
  const activeTooltipIndexToNumber = (
    idx: MouseHandlerDataParam["activeTooltipIndex"],
  ): number | undefined => {
    if (typeof idx === "number") return idx;
    if (typeof idx === "string") {
      const parsed = Number.parseInt(idx, 10);
      return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
  };

  // Recharts touch handlers — snap to the nearest point on X.
  //
  // Note: Recharts' internal touchEventsMiddleware only updates the active
  // tooltip index on `touchmove`, not `touchstart` (see Recharts source:
  // state/touchEventsMiddleware.js). So on `touchmove` we can rely on
  // `nextState.activeTooltipIndex`, but on `touchstart` we have to compute
  // the nearest dot index ourselves from the touch coordinates and the
  // rendered <circle cx> values.
  const handleTouchMove = (nextState: MouseHandlerDataParam) => {
    const parsed = activeTooltipIndexToNumber(nextState.activeTooltipIndex);
    if (parsed !== undefined) setMobileActiveIndex(parsed);
  };

  // Desktop hover handlers — mirror Recharts' active index into our state
  // so the reference line can follow the magnet (Recharts itself snaps to
  // the nearest X point and exposes the index in the handler's nextState).
  const handleMouseMove = (nextState: MouseHandlerDataParam) => {
    if (nextState.isTooltipActive === false) {
      setDesktopActiveIndex(undefined);
      return;
    }
    const parsed = activeTooltipIndexToNumber(nextState.activeTooltipIndex);
    if (parsed !== undefined) setDesktopActiveIndex(parsed);
  };

  const handleMouseLeave = () => {
    setDesktopActiveIndex(undefined);
  };

  const handleTouchStart = (
    _nextState: MouseHandlerDataParam,
    event: TouchEvent<SVGGraphicsElement>,
  ) => {
    const touch = event.touches[0];
    if (!touch) return;
    // Find the rendered chart surface and the relative X of the touch.
    const surface = chartAreaRef.current?.querySelector(".recharts-surface");
    if (!surface) return;
    const surfaceBox = surface.getBoundingClientRect();
    const touchX = touch.clientX - surfaceBox.left;
    // Pick the dot whose cx (within the surface coordinate system) is
    // closest to the touch X. recharts-line-dots circles are emitted in
    // data order, so the dot's positional index matches `cumulativeData`.
    const circles = surface.querySelectorAll<SVGCircleElement>(
      ".recharts-line-dots circle",
    );
    if (circles.length === 0) return;
    let nearestIndex = 0;
    let nearestDist = Infinity;
    circles.forEach((circle, i) => {
      const cx = Number.parseFloat(circle.getAttribute("cx") ?? "0");
      const dist = Math.abs(cx - touchX);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIndex = i;
      }
    });
    setMobileActiveIndex(nearestIndex);
  };

  // Calculate cumulative values at each point
  const cumulativeData = useMemo<CumulativePoint[]>(() => {
    if (mode === "absolute") {
      return data.map((point, index) => ({
        ...point,
        cumulative: point.value,
        index,
        resolvedId: point.id ?? index,
      }));
    }
    let cumulative = 0;
    return data.map((point, index) => {
      cumulative += point.value;
      return {
        ...point,
        cumulative,
        index,
        resolvedId: point.id ?? index,
      };
    });
  }, [data, mode]);

  // Calculate net P/L for the pill display
  const netPL = useMemo(() => {
    if (data.length === 0) return 0;
    if (mode === "absolute") {
      return data[data.length - 1].value - baseline;
    }
    return data.reduce((sum, d) => sum + d.value, 0);
  }, [data, mode, baseline]);

  // Calculate Y-axis range — fit tightly to data, use goal as max when provided
  const yRange = useMemo(() => {
    if (cumulativeData.length === 0) {
      return { min: baseline - 20, max: baseline + 20 };
    }

    const values = cumulativeData.map((d) => d.cumulative);
    const dataMin = Math.min(...values);
    const dataMax = Math.max(...values);

    let min = dataMin;
    let max = goal != null ? Math.max(goal, dataMax) : dataMax;

    // Add 30% padding on both ends so dots aren't right on the edge
    // (keeps points away from the chart corners).
    const range = max - min || 1;
    const padding = range * 0.3;
    min = Math.floor(min - padding);
    max = Math.ceil(max + padding);

    // Enforce minimum range to prevent cramped graph
    const minRange = 20;
    if (max - min < minRange) {
      const midpoint = (max + min) / 2;
      min = Math.floor(midpoint - minRange / 2);
      max = Math.ceil(midpoint + minRange / 2);
    }

    // Don't let the range extend below baseline when no data is below it
    if (dataMin >= baseline && min < baseline) {
      const excess = baseline - min;
      min = baseline;
      max += excess;
    }

    return { min, max };
  }, [cumulativeData, baseline, goal]);

  // Where the baseline sits within Recharts' plotting area, as a
  // fraction in [0..1] from the top of the plot to the bottom of the plot.
  // Used together with CHART_MARGIN to compute the baseline's pixel
  // position in CSS (which scales with the container's actual height).
  const baselinePlotFraction = useMemo(() => {
    const { min, max } = yRange;
    const range = max - min || 1;
    return (max - baseline) / range;
  }, [yRange, baseline]);

  // Calculate Y-axis labels: lowest dot, baseline, goal/highest dot.
  // Positions are computed as percentages relative to the chart area so
  // they align with Recharts' Y scale (which uses our [min, max] domain).
  const yAxisLabels = useMemo(() => {
    if (cumulativeData.length === 0) return [];

    const { min, max } = yRange;
    const range = max - min || 1;

    const values = cumulativeData.map((d) => d.cumulative);
    const dataMin = Math.min(...values);
    const dataMax = Math.max(...values);

    // Position as % from top of the chart plotting area.
    const toPos = (value: number) => ((max - value) / range) * 100;

    const labels: { value: number; position: number }[] = [];

    const highValue = goal != null ? Math.max(goal, dataMax) : dataMax;
    labels.push({ value: highValue, position: toPos(highValue) });

    const lowValue = dataMin;

    if (lowValue < baseline) {
      labels.push({ value: baseline, position: toPos(baseline) });
      if (lowValue !== highValue) {
        labels.push({ value: lowValue, position: toPos(lowValue) });
      }
    } else if (lowValue !== highValue) {
      labels.push({ value: lowValue, position: toPos(lowValue) });
    }

    labels.sort((a, b) => a.position - b.position);
    const MIN_GAP = 12;
    const result: { value: number; position: number; stackBelow?: boolean }[] =
      [];
    for (const label of labels) {
      const prev = result[result.length - 1];
      if (prev && label.position - prev.position < MIN_GAP) {
        result.push({ ...label, position: prev.position, stackBelow: true });
      } else {
        result.push(label);
      }
    }
    return result;
  }, [yRange, cumulativeData, baseline, goal]);

  if (data.length === 0) {
    return null;
  }

  // Recharts data: index serves as the X dimension, cumulative as Y.
  // We pass variant + resolvedId + pullId through so the custom dot
  // renderer can color the dot per data point and look up the pull.
  const chartData = cumulativeData.map((p) => ({
    index: p.index,
    cumulative: p.cumulative,
    variant: p.variant,
    resolvedId: p.resolvedId,
    pullId: p.pullId,
  }));

  return (
    <div className={`flex flex-col gap-3 h-full ${className}`}>
      <div
        className="relative w-full flex-1 min-h-0"
        aria-label={title}
        role="img"
      >
        {/* Y-axis labels as pills. The container is inset by CHART_MARGIN
            so label `position` (a percentage of the plotting area) aligns
            with Recharts' Y scale. Labels are centered on their position
            via translateY(-50%), keeping them inside the chart canvas at
            the extremes (top=0% and top=100%) instead of overflowing. */}
        <div
          className="absolute left-0 z-10 w-10 pointer-events-none"
          style={{
            top: `${CHART_MARGIN.top}px`,
            bottom: `${CHART_MARGIN.bottom}px`,
          }}
        >
          {yAxisLabels.map((label, index) => (
            <span
              key={`label-${label.value}-${index}`}
              className="absolute inline-flex items-center justify-center w-10 h-5 font-secondary text-primary-100 text-base/5 leading-none bg-black-100 rounded-full"
              style={{
                top: `${label.position}%`,
                transform: "translateY(-50%)",
              }}
            >
              {label.value}
            </span>
          ))}
        </div>

        {/* Net P/L pill */}
        <div className="absolute right-0 top-0 z-10 pointer-events-none">
          <span
            className={`inline-flex items-center justify-center w-10 h-5 font-secondary text-base leading-none bg-black-100 rounded-full ${
              netPL >= 0 ? "text-primary-100" : "text-red-400"
            }`}
          >
            {netPL >= 0 ? "+" : ""}
            {netPL}
          </span>
        </div>

        {/* Extended grid background — outside Recharts so it can bleed
            past the edges with a fading mask. Vertical bleed kept modest
            (0.75rem) to avoid collisions with surrounding UI (header). */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "-0.75rem",
            bottom: "-0.75rem",
            left: "-4rem",
            right: "-4rem",
            maskImage:
              "linear-gradient(to right, transparent, black 25%, black 75%, transparent), linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 25%, black 75%, transparent), linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
            maskComposite: "intersect",
            WebkitMaskComposite: "source-in",
          }}
        >
          <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
            {Array.from({ length: 12 }, (_, i) => (i + 1) * 7.7).map((pos) => (
              <line
                key={`v-${pos}`}
                x1={`${pos}%`}
                y1="0"
                x2={`${pos}%`}
                y2="100%"
                stroke="var(--primary-700)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            ))}
            {Array.from({ length: 8 }, (_, i) => (i + 1) * 11.1).map((pos) => (
              <line
                key={`h-${pos}`}
                x1="0"
                y1={`${pos}%`}
                x2="100%"
                y2={`${pos}%`}
                stroke="var(--primary-700)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            ))}
            {/* Baseline — extends a bit past the plot area but not all the
                way across the grid (which bleeds 4rem on each side for the
                fading background). Y math: grid SVG spans
                top:-0.75rem..bottom:-0.75rem, so:
                  Y(svg) = 0.75rem + margin.top + plotFraction * plotHeight
                  plotHeight = 100% (svg) - 1.5rem - margin.top - margin.bottom
                X math: grid SVG extends 4rem on each side past the chart
                container; we want the baseline to start/end near the plot
                edges (with a small bleed) rather than at the full grid
                edges, so we inset it by 3rem on each side. */}
            {(() => {
              const baselineY = `calc(0.75rem + ${CHART_MARGIN.top}px + ${baselinePlotFraction} * (100% - 1.5rem - ${CHART_MARGIN.top + CHART_MARGIN.bottom}px))`;
              return (
                <line
                  x1="3rem"
                  y1={baselineY}
                  x2="calc(100% - 3rem)"
                  y2={baselineY}
                  stroke="var(--primary-300)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              );
            })()}
          </svg>
        </div>

        {/* Vertical reference line on the active tooltip point — drawn
            outside the Recharts plot area so it can bleed past the chart
            top/bottom and fade out smoothly (avoids a hard cut at the
            plot edges). Horizontally aligned with the Recharts plot:
            its left/right inset matches the Y-labels width (10 = 40px)
            plus CHART_MARGIN.left / right, so 0%..100% inside this
            overlay maps exactly to the plot's X domain. The X position
            of the line accounts for the X axis padding so it aligns
            with the corresponding rendered dot:
              domain = [-pad, n - 1 + pad]
              X%(i)  = (i + pad) / (n - 1 + 2 * pad) * 100
            Vertical bleed kept modest (0.75rem) so the line doesn't
            collide with surrounding UI (e.g. the header above). */}
        {activeIndex != null && cumulativeData.length > 0 && (
          <div
            className="absolute pointer-events-none z-0"
            style={{
              top: "-0.75rem",
              bottom: "-0.75rem",
              left: `calc(2.5rem + ${CHART_MARGIN.left}px)`,
              right: `${CHART_MARGIN.right}px`,
              maskImage:
                "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
            }}
            aria-hidden="true"
          >
            {(() => {
              // Mirror the upper bound that <XAxis domain={...}> uses so
              // single-point cases (n === 1) place the line on the dot
              // rather than at the geometric center of the plot. Recharts
              // is given an upper bound of Math.max(n - 1, 1), and we
              // must use the same value here to stay aligned.
              const upper = Math.max(cumulativeData.length - 1, 1);
              const denom = upper + 2 * X_AXIS_PADDING;
              const xPct =
                denom > 0 ? ((activeIndex + X_AXIS_PADDING) / denom) * 100 : 50;
              return (
                <svg
                  className="absolute inset-0 w-full h-full"
                  aria-hidden="true"
                >
                  <line
                    x1={`${xPct}%`}
                    y1="0"
                    x2={`${xPct}%`}
                    y2="100%"
                    stroke="var(--white-600)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                </svg>
              );
            })()}
          </div>
        )}

        {/* Recharts area — disable focus outline on the inner SVG/wrapper
            (Recharts adds tabindex/focus styles by default). */}
        <div
          ref={chartAreaRef}
          className="absolute left-10 right-0 top-0 bottom-0 [&_*:focus]:outline-none [&_*:focus-visible]:outline-none"
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={CHART_MARGIN}
              // Touch handlers drive the mobile magnet: on `touchmove`
              // Recharts itself computes `activeTooltipIndex` (nearest
              // point on X) and we mirror it into our controlled state.
              // On `touchstart` Recharts does NOT update its index, so we
              // compute the nearest dot ourselves from the touch X and
              // rendered <circle cx> values — guarantees the tooltip
              // appears immediately on tap without requiring a slide.
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              // Desktop hover handlers — mirror Recharts' active index so
              // the vertical reference line can highlight the same point
              // the tooltip is currently showing.
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <ChartFilters />
              {/* Grid is rendered by the extended grid overlay above so we
                  don't render Recharts' <CartesianGrid> here — having both
                  caused doubled lines where their positions overlapped. */}
              <XAxis
                dataKey="index"
                type="number"
                // Pad the domain so the first/last points sit inside the
                // plot rather than on the very edge — see X_AXIS_PADDING.
                domain={[
                  -X_AXIS_PADDING,
                  Math.max(cumulativeData.length - 1, 1) + X_AXIS_PADDING,
                ]}
                hide
              />
              <YAxis
                type="number"
                domain={[yRange.min, yRange.max]}
                hide
                allowDataOverflow={false}
              />
              {/* Single Recharts tooltip — magnet behavior is built-in:
                  it snaps to the nearest point on the X axis.
                  - Desktop: uncontrolled, Recharts handles hover natively.
                  - Touch: controlled via `active` + `defaultIndex` so taps
                    open it, slides update it, and it persists until the
                    user taps outside (handled by the outside-pointerdown
                    effect above).
                  - `cursor={false}` removes Recharts' default vertical line.
                  - `isAnimationActive={false}` keeps slide feedback instant. */}
              <Tooltip
                content={tooltipContent}
                cursor={false}
                isAnimationActive={false}
                {...(isTouchDevice
                  ? {
                      active: mobileActiveIndex != null,
                      defaultIndex: mobileActiveIndex,
                    }
                  : {})}
              />
              {/* Main line — Recharts handles tracing animation natively.
                  - filter applies the chromatic-glitch filter to the path.
                  - dot is a custom renderer that colors each circle per
                    variant and applies the matching glow filter.
                  - key={chartData.length} forces a remount of <Line> when
                    the data length changes, which resets Recharts' internal
                    `previousPointsRef`. Without this, Recharts interpolates
                    each existing point from a shifted previous position
                    (because prevPoints.length / points.length != 1),
                    producing a yo-yo effect during the trace animation. */}
              <Line
                key={chartData.length}
                type="linear"
                dataKey="cumulative"
                stroke="var(--white-400)"
                strokeWidth={1.5}
                filter="url(#gc-glitch-line)"
                dot={RenderDot}
                activeDot={false}
                isAnimationActive
                animateNewValues
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
