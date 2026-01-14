import { motion } from "framer-motion";
import { useMemo } from "react";

export interface PLDataPoint {
  value: number; // The P/L value at this point
  variant: "green" | "red" | "yellow" | "blue"; // Color of the dot
  id?: number; // Optional unique ID for animation keys
}

export interface PLGraphProps {
  data: PLDataPoint[];
  className?: string;
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

export const PLGraph = ({ data, className = "" }: PLGraphProps) => {
  // Calculate cumulative P/L at each point
  const cumulativeData = useMemo(() => {
    let cumulative = 0;
    return data.map((point) => {
      cumulative += point.value;
      return {
        ...point,
        cumulative,
      };
    });
  }, [data]);

  // Calculate wins and losses
  const stats = useMemo(() => {
    const wins = data.filter((d) => d.value > 0).length;
    const losses = data.filter((d) => d.value < 0).length;
    const netPL = data.reduce((sum, d) => sum + d.value, 0);
    return { wins, losses, netPL };
  }, [data]);

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
    const max = Math.ceil((maxVal + padding) / 10) * 10;
    const min = Math.floor((minVal - padding) / 10) * 10;

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
      {/* Header: P/L stats and net value */}
      <div className="flex items-center justify-between">
        <div className="font-secondary text-green-700 text-lg tracking-widest uppercase">
          P/L:{" "}
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
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between py-2 z-10">
          <span className="font-secondary text-green-400 text-sm tracking-widest leading-none">
            {yRange.max}
          </span>
          <span
            className="font-secondary text-green-400 text-sm tracking-widest leading-none"
            style={{ position: "absolute", top: `${yRange.zero}%` }}
          >
            0
          </span>
          <span className="font-secondary text-green-400 text-sm tracking-widest leading-none">
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
              const isLastLine = index === graphPoints.length - 1;
              return (
                <motion.line
                  key={`line-${point.id}`}
                  x1={`${prevPoint.x}%`}
                  y1={`${prevPoint.y}%`}
                  x2={`${point.x}%`}
                  y2={`${point.y}%`}
                  stroke="#348F1B"
                  strokeWidth="1.5"
                  initial={isLastLine ? { opacity: 0 } : false}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              );
            })}

            {/* Points as SVG circles */}
            {graphPoints.map((point, index) => {
              const isLastPoint = index === graphPoints.length - 1;
              const filterName = `glow-${point.color === "#36F818" ? "green" : point.color === "#FF1E00" ? "red" : point.color === "#7487FF" ? "blue" : "yellow"}`;
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
                  initial={isLastPoint ? { scale: 0, opacity: 0 } : false}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    duration: isLastPoint ? 0.5 : 0.3,
                    ease: "easeOut",
                    delay: isLastPoint ? 0.2 : 0,
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
