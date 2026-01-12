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

  // Calculate positions for graph points
  const graphPoints = useMemo(() => {
    if (graphPulls.length === 0) return [];

    const width = 100; // percentage
    const height = 100;
    const padding = 8;

    return graphPulls.map((pull, index) => {
      const x = padding + (index / Math.max(graphPulls.length - 1, 1)) * (width - padding * 2);
      // Y position based on some value - using the orb's cost as a proxy for "value"
      const cost = pull.orb.cost();
      const maxCost = 25;
      const normalizedY = Math.min(cost / maxCost, 1);
      const y = height - padding - normalizedY * (height - padding * 2);

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
        <svg
          className="absolute -inset-4 w-[calc(100%+32px)] h-[calc(100%+32px)]"
          style={{ overflow: "visible" }}
        >
          <defs>
            {/* Fade gradient for vertical lines */}
            <linearGradient id="verticalFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(20, 83, 45, 0)" />
              <stop offset="15%" stopColor="rgba(20, 83, 45, 0.5)" />
              <stop offset="85%" stopColor="rgba(20, 83, 45, 0.5)" />
              <stop offset="100%" stopColor="rgba(20, 83, 45, 0)" />
            </linearGradient>
            {/* Fade gradient for horizontal lines */}
            <linearGradient id="horizontalFade" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(20, 83, 45, 0)" />
              <stop offset="10%" stopColor="rgba(20, 83, 45, 0.5)" />
              <stop offset="90%" stopColor="rgba(20, 83, 45, 0.5)" />
              <stop offset="100%" stopColor="rgba(20, 83, 45, 0)" />
            </linearGradient>
          </defs>
          {/* Vertical grid lines */}
          {Array.from({ length: 10 }).map((_, i) => (
            <line
              key={`v-${i}`}
              x1={`${(i + 1) * 10}%`}
              y1="0"
              x2={`${(i + 1) * 10}%`}
              y2="100%"
              stroke="url(#verticalFade)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}
          {/* Horizontal grid lines */}
          {Array.from({ length: 6 }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={`${(i + 1) * 16.6}%`}
              x2="100%"
              y2={`${(i + 1) * 16.6}%`}
              stroke="url(#horizontalFade)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}
        </svg>

        {/* Chart area */}
        <div className="absolute inset-0 rounded-lg overflow-hidden">
          {/* Bottom baseline */}
          <svg
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="baselineFade" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(129, 244, 100, 0)" />
                <stop offset="10%" stopColor="rgba(129, 244, 100, 1)" />
                <stop offset="90%" stopColor="rgba(129, 244, 100, 1)" />
                <stop offset="100%" stopColor="rgba(129, 244, 100, 0)" />
              </linearGradient>
            </defs>
            <line
              x1="0"
              y1="100%"
              x2="100%"
              y2="100%"
              stroke="url(#baselineFade)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          </svg>

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
