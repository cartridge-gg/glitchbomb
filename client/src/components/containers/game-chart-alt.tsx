"use client";

import { useMemo } from "react";
import { cva, type VariantProps } from "class-variance-authority";

interface ChartDataPoint {
  pulls: number;
  pnl: number;
  pointType: string;
}

const gameChartAltVariants = cva(
  "bg-black p-3 rounded-lg shadow-sm border border-white h-full flex flex-col",
  {
    variants: {
      variant: {
        default: "",
        compact: "p-2",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface GameChartAltProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gameChartAltVariants> {
  data: ChartDataPoint[];
  title?: string;
  breakevenPoint?: number;
}

interface ChartSegment {
  path: string;
  color: string;
}

export function GameChartAlt({
  data,
  title = "PROFIT/LOSS",
  breakevenPoint = 0,
  variant = "default",
  className,
  ...props
}: GameChartAltProps) {
  // Calculate chart dimensions and scaling
  const chartData = useMemo(() => {
    if (data.length === 0) {
      return {
        points: [],
        pnlValues: [],
        maxValue: 100,
        minValue: -100,
        zeroY: 50,
        range: 200,
      };
    }

    const pnlValues = data.map((d) => d.pnl);
    const maxPoints = Math.max(...pnlValues);
    const minPoints = Math.min(...pnlValues);

    // Add padding to the range so points aren't at edges
    const padding = Math.max(Math.abs(maxPoints), Math.abs(minPoints)) * 0.1 || 10;
    const maxValue = Math.max(maxPoints + padding, breakevenPoint + padding);
    const minValue = Math.min(minPoints - padding, breakevenPoint - padding);
    const range = maxValue - minValue;
    const zeroY = (maxValue / range) * 100;

    return {
      points: data,
      pnlValues,
      maxValue,
      minValue,
      zeroY,
      range,
    };
  }, [data, breakevenPoint]);

  // Generate SVG path segments with color changes at zero crossings
  const chartPaths = useMemo(() => {
    const { points, pnlValues, minValue, range } = chartData;
    if (points.length === 0) return { segments: [], points: [], pnlValues: [] };

    const width = 250;
    const height = 170;

    const segments: ChartSegment[] = [];
    let currentPath = "";
    let currentColor = "";

    pnlValues.forEach((pnl, index) => {
      const x =
        pnlValues.length === 1
          ? width / 2
          : (index / (pnlValues.length - 1)) * width;
      const y = height - ((pnl - minValue) / range) * height;
      const isPositive = pnl >= 0;
      const color = isPositive ? "#10b981" : "#ef4444";

      if (index === 0) {
        currentPath = `M ${x},${y}`;
        currentColor = color;
      } else {
        if (color === currentColor) {
          currentPath += ` L ${x},${y}`;
        } else {
          // Color change - finish current segment and start new one
          segments.push({ path: currentPath, color: currentColor });
          const prevX =
            pnlValues.length === 1
              ? width / 2
              : ((index - 1) / (pnlValues.length - 1)) * width;
          const prevY =
            height - ((pnlValues[index - 1] - minValue) / range) * height;
          currentPath = `M ${prevX},${prevY} L ${x},${y}`;
          currentColor = color;
        }
      }

      if (index === pnlValues.length - 1) {
        segments.push({ path: currentPath, color: currentColor });
      }
    });

    return { segments, points, pnlValues };
  }, [chartData]);

  // Calculate current P/L display
  const currentPnl = useMemo(() => {
    if (data.length === 0) return 0;
    return data[data.length - 1].pnl;
  }, [data]);

  const pnlColorClass = useMemo(() => {
    if (currentPnl > 0) return "text-green-400";
    if (currentPnl < 0) return "text-red-400";
    return "text-white";
  }, [currentPnl]);

  const zeroLineY = useMemo(() => {
    const { minValue, range } = chartData;
    return 170 - ((0 - minValue) / range) * 170;
  }, [chartData]);

  return (
    <div className={gameChartAltVariants({ variant, className })} {...props}>
      <h2 className="text-sm font-bold mb-3 text-white">{title}</h2>

      {/* Compact P/L Header */}
      <div className="mb-2 flex justify-between items-center">
        <div className="text-xs text-gray-400">
          Current P/L
        </div>
        <div className={`text-sm font-bold ${pnlColorClass}`}>
          {currentPnl >= 0 ? "+" : ""}
          {currentPnl}
        </div>
      </div>

      {/* Profit/Loss Chart */}
      <div className="flex-1 flex flex-col min-h-0">
        {data.length > 0 ? (
          <div className="flex-1 bg-black rounded border border-white p-2 overflow-hidden">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 300 220"
              className="w-full h-full min-h-0"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Grid pattern */}
              <defs>
                <pattern
                  id="chart-grid"
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 20 0 L 0 0 0 20"
                    fill="none"
                    stroke="#4b5563"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect
                x="25"
                y="5"
                width="250"
                height="170"
                fill="url(#chart-grid)"
                opacity="0.3"
              />

              {/* Chart area */}
              <g transform="translate(25, 5)">
                {/* Zero line (white dashed) */}
                <line
                  x1="0"
                  y1={zeroLineY}
                  x2="250"
                  y2={zeroLineY}
                  stroke="white"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />

                {/* Chart segments with colors */}
                {chartPaths.segments.map((segment, index) => (
                  <path
                    key={index}
                    d={segment.path}
                    fill="none"
                    stroke={segment.color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      filter: `drop-shadow(0 0 4px ${segment.color})`,
                    }}
                  />
                ))}

                {/* Data points */}
                {chartPaths.pnlValues.map((pnl, index) => {
                  const x =
                    chartPaths.pnlValues.length === 1
                      ? 125
                      : (index / (chartPaths.pnlValues.length - 1)) * 250;
                  const y =
                    170 -
                    ((pnl - chartData.minValue) / chartData.range) * 170;
                  const pointColor = pnl >= 0 ? "#10b981" : "#ef4444";
                  const entry = chartPaths.points[index];

                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r="4"
                      fill={pointColor}
                      stroke="white"
                      strokeWidth="1"
                      className="hover:r-5 transition-all cursor-pointer"
                    >
                      <title>
                        {entry.pointType}: {pnl >= 0 ? "+" : ""}
                        {pnl} P/L
                      </title>
                    </circle>
                  );
                })}
              </g>

              {/* Y-axis */}
              <line
                x1="25"
                y1="5"
                x2="25"
                y2="175"
                stroke="white"
                strokeWidth="1"
              />
              {/* X-axis */}
              <line
                x1="25"
                y1="175"
                x2="275"
                y2="175"
                stroke="white"
                strokeWidth="1"
              />

              {/* Y-axis labels */}
              <text
                x="20"
                y="10"
                fill="white"
                fontSize="8"
                textAnchor="end"
              >
                {Math.round(chartData.maxValue)}
              </text>
              <text
                x="20"
                y="180"
                fill="white"
                fontSize="8"
                textAnchor="end"
              >
                {Math.round(chartData.minValue)}
              </text>
              <text
                x="20"
                y={zeroLineY + 5 + 3}
                fill="white"
                fontSize="8"
                textAnchor="end"
                fontWeight="bold"
              >
                0
              </text>

              {/* X-axis labels */}
              <text x="30" y="190" fill="white" fontSize="8">
                Start
              </text>
              <text
                x="270"
                y="190"
                fill="white"
                fontSize="8"
                textAnchor="end"
              >
                {data.length > 1 ? `Pull ${data.length}` : "Current"}
              </text>
            </svg>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-xs">
            No data yet
          </div>
        )}
      </div>
    </div>
  );
}
