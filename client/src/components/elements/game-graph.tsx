import { useMemo } from "react";
import type { OrbPulled } from "@/models";

export interface GameGraphProps {
  pulls: OrbPulled[];
  className?: string;
}

// Map orb variant to actual color (using CSS variable values from theme)
const getOrbColor = (variant: string): string => {
  switch (variant) {
    case "green":
      return "#36F818"; // --green-400
    case "red":
      return "#FF1E00"; // --red-100
    case "blue":
      return "#7487FF"; // --blue-100
    case "yellow":
      return "#FFF121"; // --yellow-100
    case "salmon":
      return "#FE5578"; // --salmon-100
    case "orange":
      return "#F1721C"; // --orange-100
    default:
      return "#36F818"; // default to green
  }
};

export const GameGraph = ({ pulls, className = "" }: GameGraphProps) => {
  // Sort pulls by id and take the last 12 for the graph
  const sortedPulls = useMemo(() => {
    return [...pulls].sort((a, b) => a.id - b.id);
  }, [pulls]);

  const recentPulls = sortedPulls.slice(-3); // Last 3 for the header
  const graphPulls = sortedPulls.slice(-12); // Last 12 for the graph

  // Calculate positions for graph points - aligned to grid intersections
  const graphPoints = useMemo(() => {
    if (graphPulls.length === 0) return [];

    // Grid lines in chart area: vertical at 12.5% intervals, horizontal at 20% intervals
    const verticalGridPositions = [12.5, 25, 37.5, 50, 62.5, 75, 87.5];
    const horizontalGridPositions = [20, 40, 60, 80, 100]; // 100 is baseline

    return graphPulls.map((pull, index) => {
      // X: distribute points across vertical grid lines
      const xIndex = Math.round(
        (index / Math.max(graphPulls.length - 1, 1)) *
          (verticalGridPositions.length - 1)
      );
      const x = verticalGridPositions[xIndex];

      // Y: map orb cost to horizontal grid lines (higher cost = higher on chart)
      const cost = pull.orb.cost();
      const maxCost = 25;
      const normalizedCost = Math.min(cost / maxCost, 1);
      // Map: 0 cost = baseline (100%), max cost = top line (20%)
      const yIndex = Math.round(
        normalizedCost * (horizontalGridPositions.length - 2)
      );
      const y = horizontalGridPositions[horizontalGridPositions.length - 1 - yIndex - 1];

      return {
        x,
        y,
        color: getOrbColor(pull.orb.variant()),
        pull,
      };
    });
  }, [graphPulls]);

  if (pulls.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Recent pulls header */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-green-950/50 rounded-full px-3 py-1.5 border border-green-900/50">
          <span className="text-green-500 font-secondary text-xs tracking-widest uppercase">
            Recent
          </span>
          <div className="flex items-center gap-1.5">
            {recentPulls.map((pull) => (
              <div
                key={`recent-${pull.id}`}
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: getOrbColor(pull.orb.variant()),
                  boxShadow: `0 0 6px ${getOrbColor(pull.orb.variant())}`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Graph */}
      <div className="relative w-full h-32">
        {/* Extended grid background with fade */}
        <div
          className="absolute -inset-12 pointer-events-none"
          style={{
            maskImage:
              "radial-gradient(ellipse 80% 90% at 50% 35%, black 30%, transparent 65%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 90% at 50% 35%, black 30%, transparent 65%)",
          }}
        >
          <svg className="absolute inset-0 w-full h-full">
            {/* Vertical grid lines - extended */}
            {Array.from({ length: 16 }).map((_, i) => (
              <line
                key={`v-${i}`}
                x1={`${(i + 1) * 6.25}%`}
                y1="0"
                x2={`${(i + 1) * 6.25}%`}
                y2="100%"
                stroke="rgba(20, 83, 45, 0.5)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            ))}
            {/* Horizontal grid lines - extended */}
            {Array.from({ length: 10 }).map((_, i) => (
              <line
                key={`h-${i}`}
                x1="0"
                y1={`${(i + 1) * 10}%`}
                x2="100%"
                y2={`${(i + 1) * 10}%`}
                stroke="rgba(20, 83, 45, 0.5)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            ))}
          </svg>
        </div>

        {/* Main chart area grid - points align to these */}
        <svg
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Vertical grid lines at 12.5% intervals */}
          {[12.5, 25, 37.5, 50, 62.5, 75, 87.5].map((x) => (
            <line
              key={`chart-v-${x}`}
              x1={`${x}%`}
              y1="0"
              x2={`${x}%`}
              y2="100%"
              stroke="rgba(20, 83, 45, 0.3)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}
          {/* Horizontal grid lines at 20% intervals */}
          {[20, 40, 60, 80].map((y) => (
            <line
              key={`chart-h-${y}`}
              x1="0"
              y1={`${y}%`}
              x2="100%"
              y2={`${y}%`}
              stroke="rgba(20, 83, 45, 0.3)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}
          {/* Bottom baseline - green-200 dotted */}
          <line
            x1="0"
            y1="100%"
            x2="100%"
            y2="100%"
            stroke="#BEF5AA"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        </svg>

        {/* Chart area for points */}
        <div className="absolute inset-0">

          {/* Graph lines and points */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Lines connecting points */}
            {graphPoints.map((point, index) => {
              if (index === 0) return null;
              const prevPoint = graphPoints[index - 1];
              return (
                <line
                  key={`line-${point.pull.id}`}
                  x1={prevPoint.x}
                  y1={prevPoint.y}
                  x2={point.x}
                  y2={point.y}
                  stroke="rgba(74, 222, 128, 0.4)"
                  strokeWidth="0.5"
                />
              );
            })}
          </svg>

          {/* Points (rendered as absolute positioned divs for proper glow) */}
          {graphPoints.map((point) => (
            <div
              key={`point-${point.pull.id}`}
              className="absolute w-3 h-3 rounded-full -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
                backgroundColor: point.color,
                boxShadow: `0 0 8px ${point.color}, 0 0 16px ${point.color}50`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
