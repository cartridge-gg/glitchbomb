import { motion } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";

export interface PLDataPoint {
  value: number; // The P/L value at this point (delta or absolute based on mode)
  variant: "green" | "red" | "yellow" | "blue"; // Color of the dot
  id?: number; // Optional unique ID for animation keys
}

export interface PLGraphProps {
  data: PLDataPoint[];
  className?: string;
  mode?: "delta" | "absolute"; // delta = value is change per point, absolute = value is total at each point
  title?: string; // Custom title (default: "P/L")
  baseline?: number; // The baseline value (default: 0 for delta, 100 for absolute)
}

// Map variant to actual color
const getVariantColor = (variant: PLDataPoint["variant"]): string => {
  switch (variant) {
    case "green":
      return "#36F818"; // --green-400
    case "red":
      return "#FF1E00"; // --red-100
    case "blue":
      return "#7487FF"; // --blue-100
    case "yellow":
      return "#FFF121"; // --yellow-100
    default:
      return "#36F818";
  }
};

export const PLGraph = ({
  data,
  className = "",
  mode = "delta",
  title = "P/L",
  baseline: baselineProp,
}: PLGraphProps) => {
  // Default baseline: 0 for delta mode, 100 for absolute mode
  const baseline = baselineProp ?? (mode === "absolute" ? 100 : 0);
  // Calculate cumulative values at each point
  const cumulativeData = useMemo(() => {
    if (mode === "absolute") {
      // Values are already absolute (like potential_moonrocks)
      return data.map((point) => ({
        ...point,
        cumulative: point.value,
      }));
    }
    // Delta mode: accumulate values
    let cumulative = 0;
    return data.map((point) => {
      cumulative += point.value;
      return {
        ...point,
        cumulative,
      };
    });
  }, [data, mode]);

  // Calculate wins and losses (based on deltas or value changes)
  const stats = useMemo(() => {
    if (mode === "absolute") {
      // For absolute mode, calculate deltas between consecutive points
      let wins = 0;
      let losses = 0;
      for (let i = 1; i < data.length; i++) {
        const delta = data[i].value - data[i - 1].value;
        if (delta > 0) wins++;
        else if (delta < 0) losses++;
      }
      // Net P/L is relative to baseline (e.g., 100)
      const currentValue =
        data.length > 0 ? data[data.length - 1].value : baseline;
      const netPL = currentValue - baseline;
      return { wins, losses, netPL };
    }
    // Delta mode: original logic
    const wins = data.filter((d) => d.value > 0).length;
    const losses = data.filter((d) => d.value < 0).length;
    const netPL = data.reduce((sum, d) => sum + d.value, 0);
    return { wins, losses, netPL };
  }, [data, mode, baseline]);

  // Calculate Y-axis range - baseline position moves based on data
  const yRange = useMemo(() => {
    if (cumulativeData.length === 0) {
      return {
        min: baseline - 20,
        max: baseline + 20,
        baselinePos: 50,
        hasBelowBaseline: false,
      };
    }

    const values = cumulativeData.map((d) => d.cumulative);
    const maxVal = Math.max(...values, baseline);
    const minVal = Math.min(...values, baseline);
    const hasBelowBaseline = minVal < baseline;

    // Add padding to the top
    const topPadding = Math.max((maxVal - baseline) * 0.2, 10);
    let max = Math.ceil((maxVal + topPadding) / 10) * 10;
    let min: number;

    if (hasBelowBaseline) {
      // If there are values below baseline, include them
      const bottomPadding = Math.max((baseline - minVal) * 0.2, 10);
      min = Math.floor((minVal - bottomPadding) / 10) * 10;
    } else {
      // No values below baseline - min is baseline
      min = baseline;
    }

    // Enforce minimum range to prevent cramped graph
    const minRange = 50;
    const currentRange = max - min;
    if (currentRange < minRange) {
      max = Math.ceil((max + (minRange - currentRange)) / 10) * 10;
    }

    // Calculate baseline position as percentage from top
    const range = max - min;
    const baselinePos = ((max - baseline) / range) * 100;

    return { min, max, baselinePos, hasBelowBaseline };
  }, [cumulativeData, baseline]);

  // Calculate Y-axis labels (max 3 labels: top, middle, bottom)
  const yAxisLabels = useMemo(() => {
    const { min, max, hasBelowBaseline } = yRange;
    const labels: { value: number; position: number }[] = [];
    const range = max - min;

    // Always show max at top
    labels.push({ value: max, position: 0 });

    // Add bottom label
    if (hasBelowBaseline) {
      labels.push({ value: min, position: 100 });
    } else {
      // Show baseline at bottom when no values below baseline
      labels.push({ value: baseline, position: 100 });
    }

    // Add one middle label (baseline or midpoint)
    const baselinePosition = ((max - baseline) / range) * 100;
    // Only add middle label if there's enough space (between 20% and 80%)
    if (baselinePosition > 20 && baselinePosition < 80) {
      labels.push({ value: baseline, position: baselinePosition });
    } else if (labels.length < 3) {
      // If baseline is too close to edges, add a midpoint label
      const midValue = Math.round((max + min) / 2 / 10) * 10;
      const midPosition = ((max - midValue) / range) * 100;
      if (
        midPosition > 20 &&
        midPosition < 80 &&
        midValue !== max &&
        midValue !== min
      ) {
        labels.push({ value: midValue, position: midPosition });
      }
    }

    // Sort by position (top to bottom)
    return labels.sort((a, b) => a.position - b.position);
  }, [yRange, baseline]);

  // Calculate graph points
  const graphPoints = useMemo(() => {
    if (cumulativeData.length === 0) return [];

    const width = 100;
    const height = 100;
    const paddingX = 12;
    const paddingY = 8;

    const { min, max } = yRange;
    const range = max - min;

    return cumulativeData.map((point, index) => {
      const x =
        paddingX +
        (index / Math.max(cumulativeData.length - 1, 1)) *
          (width - paddingX * 2);

      // Y position: higher cumulative = higher on graph (lower y value)
      const normalizedY = (max - point.cumulative) / range;
      const y = paddingY + normalizedY * (height - paddingY * 2);

      return {
        x,
        y,
        color: getVariantColor(point.variant),
        cumulative: point.cumulative,
        index,
        id: point.id ?? index,
      };
    });
  }, [cumulativeData, yRange]);

  // Track which points have been rendered to animate only new ones
  const renderedPointsRef = useRef<Set<number>>(new Set());

  // Determine which points are new (for animation)
  const newPointIds = useMemo(() => {
    const newIds = new Set<number>();
    graphPoints.forEach((point) => {
      if (!renderedPointsRef.current.has(point.id)) {
        newIds.add(point.id);
      }
    });
    return newIds;
  }, [graphPoints]);

  // Update rendered points after render
  useEffect(() => {
    graphPoints.forEach((point) => {
      renderedPointsRef.current.add(point.id);
    });
  }, [graphPoints]);

  if (data.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Header: stats and net value */}
      <div className="flex items-center justify-between">
        <div className="font-secondary text-green-700 text-lg tracking-widest uppercase">
          {title}:{" "}
          <span className="font-secondary text-green-700">
            {stats.wins}/{stats.losses}
          </span>
        </div>
        <div
          className={`font-secondary text-lg tracking-widest ${
            stats.netPL >= 0 ? "text-green-700" : "text-red-400"
          }`}
        >
          {stats.netPL >= 0 ? "+" : ""}
          {stats.netPL}
        </div>
      </div>

      {/* Graph container */}
      <div className="relative w-full h-40">
        {/* Y-axis labels as pills */}
        <div className="absolute left-0 top-0 bottom-0 z-10">
          {yAxisLabels.map((label, index) => (
            <span
              key={`label-${label.value}-${index}`}
              className="absolute font-secondary text-green-400 text-sm tracking-widest leading-none bg-green-950 px-3 py-1.5 rounded-full"
              style={{
                top: `${label.position}%`,
                transform:
                  label.position === 0
                    ? "translateY(0)"
                    : label.position === 100
                      ? "translateY(-100%)"
                      : "translateY(-50%)",
              }}
            >
              {label.value}
            </span>
          ))}
        </div>

        {/* Graph area */}
        <div className="absolute left-10 right-0 top-0 bottom-0">
          {/* Extended grid background with fade */}
          <div
            className="absolute -inset-12 pointer-events-none"
            style={{
              maskImage:
                "radial-gradient(ellipse 100% 120% at 50% 50%, black 30%, transparent 65%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 100% 120% at 50% 50%, black 30%, transparent 65%)",
            }}
          >
            <svg className="absolute inset-0 w-full h-full">
              {/* Vertical grid lines */}
              {Array.from({ length: 12 }).map((_, i) => (
                <line
                  key={`v-${i}`}
                  x1={`${(i + 1) * 7.7}%`}
                  y1="0"
                  x2={`${(i + 1) * 7.7}%`}
                  y2="100%"
                  stroke="rgba(20, 83, 45, 0.4)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              ))}
              {/* Horizontal grid lines */}
              {Array.from({ length: 8 }).map((_, i) => (
                <line
                  key={`h-${i}`}
                  x1="0"
                  y1={`${(i + 1) * 11.1}%`}
                  x2="100%"
                  y2={`${(i + 1) * 11.1}%`}
                  stroke="rgba(20, 83, 45, 0.4)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              ))}
            </svg>
          </div>

          {/* Baseline line - dashed white/green */}
          <div
            className="absolute left-0 right-0 border-t border-dashed border-green-700"
            style={{ top: `${yRange.baselinePos}%` }}
          />

          {/* Chart area for points and lines */}
          <svg className="absolute inset-0 w-full h-full overflow-visible">
            <defs>
              {/* Glow filters for each color */}
              <filter
                id="glow-green"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter
                id="glow-red"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter
                id="glow-blue"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter
                id="glow-yellow"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Lines connecting points */}
            {graphPoints.map((point, index) => {
              if (index === 0) return null;
              const prevPoint = graphPoints[index - 1];
              const isNew = newPointIds.has(point.id);
              return (
                <motion.line
                  key={`line-${point.id}`}
                  x1={`${prevPoint.x}%`}
                  y1={`${prevPoint.y}%`}
                  x2={`${point.x}%`}
                  y2={`${point.y}%`}
                  stroke="#348F1B"
                  strokeWidth="1.5"
                  initial={isNew ? { pathLength: 0, opacity: 0 } : false}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              );
            })}

            {/* Points as SVG circles */}
            {graphPoints.map((point) => {
              const filterName = `glow-${point.color === "#36F818" ? "green" : point.color === "#FF1E00" ? "red" : point.color === "#7487FF" ? "blue" : "yellow"}`;
              const isNew = newPointIds.has(point.id);
              return (
                <motion.circle
                  key={`point-${point.id}`}
                  cx={`${point.x}%`}
                  cy={`${point.y}%`}
                  r="6"
                  fill={point.color}
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth="1"
                  filter={`url(#${filterName})`}
                  initial={isNew ? { scale: 0, opacity: 0 } : false}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    duration: 0.3,
                    ease: "easeOut",
                    delay: isNew ? 0.1 : 0,
                  }}
                />
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};
