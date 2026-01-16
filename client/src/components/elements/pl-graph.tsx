import { useMemo } from "react";

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
}: PLGraphProps) => {
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
      const netPL = data.length > 0 ? data[data.length - 1].value : 0;
      return { wins, losses, netPL };
    }
    // Delta mode: original logic
    const wins = data.filter((d) => d.value > 0).length;
    const losses = data.filter((d) => d.value < 0).length;
    const netPL = data.reduce((sum, d) => sum + d.value, 0);
    return { wins, losses, netPL };
  }, [data, mode]);

  // Calculate Y-axis range - zero position moves based on data
  const yRange = useMemo(() => {
    if (cumulativeData.length === 0) {
      return { min: -50, max: 50, zero: 50 };
    }

    const values = cumulativeData.map((d) => d.cumulative);
    const maxVal = Math.max(...values, 0);
    const minVal = Math.min(...values, 0);

    // Add padding to both ends
    const padding = Math.max(Math.abs(maxVal), Math.abs(minVal)) * 0.2 || 20;
    let max = Math.ceil((maxVal + padding) / 10) * 10;
    let min = Math.floor((minVal - padding) / 10) * 10;

    // Enforce minimum range of 100 to prevent pills from overlapping
    const minRange = 100;
    const currentRange = max - min;
    if (currentRange < minRange) {
      const expandBy = (minRange - currentRange) / 2;
      max = Math.ceil((max + expandBy) / 10) * 10;
      min = Math.floor((min - expandBy) / 10) * 10;
    }

    // Calculate zero position as percentage from top
    const range = max - min;
    const zero = ((max - 0) / range) * 100;

    return { min, max, zero };
  }, [cumulativeData]);

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
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between py-1 z-10">
          <span className="font-secondary text-green-400 text-sm tracking-widest leading-none bg-green-950 px-3 py-1.5 rounded-full">
            {yRange.max}
          </span>
          {/* Only show 0 pill if it's not too close to top or bottom (15-85% range) */}
          {yRange.zero > 15 && yRange.zero < 85 && (
            <span
              className="font-secondary text-green-400 text-sm tracking-widest leading-none bg-green-950 px-3 py-1.5 rounded-full -translate-y-1/2"
              style={{ position: "absolute", top: `${yRange.zero}%` }}
            >
              0
            </span>
          )}
          <span className="font-secondary text-green-400 text-sm tracking-widest leading-none bg-green-950 px-3 py-1.5 rounded-full">
            {yRange.min}
          </span>
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

          {/* Zero line - dashed white/green */}
          <div
            className="absolute left-0 right-0 border-t border-dashed border-green-700"
            style={{ top: `${yRange.zero}%` }}
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
              return (
                <line
                  key={`line-${point.id}`}
                  x1={`${prevPoint.x}%`}
                  y1={`${prevPoint.y}%`}
                  x2={`${point.x}%`}
                  y2={`${point.y}%`}
                  stroke="#348F1B"
                  strokeWidth="1.5"
                />
              );
            })}

            {/* Points as SVG circles */}
            {graphPoints.map((point) => {
              const filterName = `glow-${point.color === "#36F818" ? "green" : point.color === "#FF1E00" ? "red" : point.color === "#7487FF" ? "blue" : "yellow"}`;
              return (
                <circle
                  key={`point-${point.id}`}
                  cx={`${point.x}%`}
                  cy={`${point.y}%`}
                  r="6"
                  fill={point.color}
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth="1"
                  filter={`url(#${filterName})`}
                />
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};
