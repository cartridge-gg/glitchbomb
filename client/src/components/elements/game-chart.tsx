import { useMemo } from "react";
import {
  ComposedChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import {
  TapTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
 * Build a dot renderer for Recharts <Line>. Each dot is wrapped in a
 * TapTooltip that displays the matching orb pull's category + effect when
 * hovered/tapped.
 *
 * The factory takes a Map keyed by pull id so each data point can look up
 * its pull by `resolvedId` (the data point's stable id). Index-based
 * mapping doesn't work because plData often contains entries that have no
 * matching pull (e.g. level markers / game start with orb=0).
 */
const makeRenderDot = (pullsById: Map<number, OrbPulled> | undefined) => {
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

    const circle = (
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill={color}
        stroke="rgba(255,255,255,0.8)"
        strokeWidth={1}
        filter={`url(#${filterName})`}
      />
    );

    const pull =
      pullsById != null && payload?.pullId != null
        ? pullsById.get(payload.pullId)
        : undefined;

    // Defensively check the orb has the expected methods before rendering
    // a tooltip — guards against deserialized/mocked orbs missing methods.
    const orb = pull?.orb;
    const hasOrbMethods =
      orb != null &&
      typeof orb.color === "function" &&
      typeof orb.logCategory === "function" &&
      typeof orb.logEffect === "function";

    if (!hasOrbMethods) {
      return (
        <g key={dotKey} className={isBomb ? "glitch-icon" : undefined}>
          {circle}
        </g>
      );
    }

    const orbColor = orb.color();
    return (
      <g key={dotKey} className={isBomb ? "glitch-icon" : undefined}>
        {/* TooltipProvider here so each dot can be used standalone, even
            when GameChart is rendered outside a global TooltipProvider
            (e.g. in Storybook). delayDuration=0 matches BagItem behavior. */}
        <TooltipProvider delayDuration={0}>
          <TapTooltip>
            <TooltipTrigger asChild>{circle}</TooltipTrigger>
            <TooltipContent className="flex flex-col gap-2 bg-black-100 border border-white-800 p-3 max-w-[200px]">
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
            </TooltipContent>
          </TapTooltip>
        </TooltipProvider>
      </g>
    );
  };
  return RenderDot;
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
  const renderDot = useMemo(() => makeRenderDot(pullsById), [pullsById]);

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

    // Add small padding (8%) so dots aren't right on the edge
    const range = max - min || 1;
    const padding = range * 0.08;
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
        {/* Y-axis labels as pills */}
        <div className="absolute left-0 top-0 bottom-0 z-10 w-10 pointer-events-none">
          {yAxisLabels.map((label, index) => (
            <span
              key={`label-${label.value}-${index}`}
              className="absolute inline-flex items-center justify-center w-10 h-5 font-secondary text-primary-100 text-base/5 leading-none bg-black-100 rounded-full"
              style={{
                top: `${label.position}%`,
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
            past the edges with a fading mask. */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "-2rem",
            bottom: "-2rem",
            left: "-4rem",
            right: "-4rem",
            maskImage:
              "linear-gradient(to right, transparent, black 25%, black 75%, transparent), linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 25%, black 75%, transparent), linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
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
                stroke="rgba(20, 83, 45, 0.4)"
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
                stroke="rgba(20, 83, 45, 0.4)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            ))}
            {/* Baseline — extends as far as the grid (past the chart edges)
                so it isn't clipped at the canvas border. The grid SVG spans
                top:-2rem..bottom:-2rem of the chart, so:
                  svgHeight = chartHeight + 4rem
                  chartHeight = 100% (svg) - 4rem
                  plotHeight = chartHeight - margin.top - margin.bottom
                  Y(svg) = 2rem + margin.top + plotFraction * plotHeight
                Expressed in CSS calc() so it scales with chart height. */}
            {(() => {
              const baselineY = `calc(2rem + ${CHART_MARGIN.top}px + ${baselinePlotFraction} * (100% - 4rem - ${CHART_MARGIN.top + CHART_MARGIN.bottom}px))`;
              return (
                <line
                  x1="0"
                  y1={baselineY}
                  x2="100%"
                  y2={baselineY}
                  stroke="#15803d"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              );
            })()}
          </svg>
        </div>

        {/* Recharts area — disable focus outline on the inner SVG/wrapper
            (Recharts adds tabindex/focus styles by default). */}
        <div className="absolute left-10 right-0 top-0 bottom-0 [&_*:focus]:outline-none [&_*:focus-visible]:outline-none">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={CHART_MARGIN}>
              <ChartFilters />
              {/* Grid is rendered by the extended grid overlay above so we
                  don't render Recharts' <CartesianGrid> here — having both
                  caused doubled lines where their positions overlapped. */}
              <XAxis
                dataKey="index"
                type="number"
                domain={[0, Math.max(cumulativeData.length - 1, 1)]}
                hide
              />
              <YAxis
                type="number"
                domain={[yRange.min, yRange.max]}
                hide
                allowDataOverflow={false}
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
                stroke="var(--primary-400)"
                strokeWidth={1.5}
                filter="url(#gc-glitch-line)"
                dot={renderDot}
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
