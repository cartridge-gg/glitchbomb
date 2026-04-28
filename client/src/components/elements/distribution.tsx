import { useMemo } from "react";
import {
  BoltIcon,
  BombOrbIcon,
  CrossIcon,
  HeartIcon,
  SparklesIcon,
} from "@/components/icons";
import { DistributionMath, type SegmentConfig } from "@/helpers/distribution";
import { cn } from "@/lib/utils";

export interface DistributionValues {
  bombs: number;
  points: number;
  multipliers: number;
  health: number;
  special: number;
}

interface DistributionProps {
  values: DistributionValues;
  size?: number;
  thickness?: number;
  className?: string;
  showPercentages?: boolean;
}

// Configuration for each segment type
const SEGMENT_CONFIGS: SegmentConfig[] = [
  {
    key: "bombs",
    bgColor: "var(--white-700)", // White-700 for bomb segment
    iconColor: "var(--white-100)", // White for bomb icons
    Icon: BombOrbIcon,
    order: 0,
  },
  {
    key: "points",
    bgColor: "var(--green-700)", // Custom green from preset
    iconColor: "var(--green-100)", // Custom green from preset
    Icon: SparklesIcon,
    order: 1,
  },
  {
    key: "multipliers",
    bgColor: "var(--blue-700)",
    iconColor: "var(--blue-100)",
    Icon: CrossIcon,
    order: 3,
  },
  {
    key: "health",
    bgColor: "var(--salmon-700)",
    iconColor: "var(--salmon-100)",
    Icon: HeartIcon,
    order: 2,
  },
  {
    key: "special",
    bgColor: "var(--purple-700)",
    iconColor: "var(--purple-100)",
    Icon: BoltIcon,
    order: 4,
  },
];

export const Distribution = ({
  values,
  size = 300,
  thickness = 50,
  className,
  showPercentages = false,
}: DistributionProps) => {
  const segments = useMemo(
    () => DistributionMath.calculateSegments(values, SEGMENT_CONFIGS),
    [values],
  );

  const radius = DistributionMath.calculateRadius(size, thickness);
  const circumference = DistributionMath.calculateCircumference(radius);
  const center = size / 2;

  // Minimum percentage needed to show an icon (adjust based on icon size)
  const minPercentageForIcon = DistributionMath.calculateMinPercentageForIcon(
    32,
    circumference,
  );

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center relative",
        className,
      )}
    >
      <svg
        width={size}
        height={size}
        className="transform rotate-180"
        aria-label="Distribution chart"
      >
        <title>Distribution chart</title>
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={thickness}
        />

        {/* Segments */}
        {segments.map((segment, index) => {
          const adjustedPercentage =
            DistributionMath.calculateAdjustedPercentage(segment.percentage, 0);
          const adjustedOffset = DistributionMath.calculateAdjustedOffset(
            segment.offset,
            0,
            index === 0,
          );

          const strokeDasharray = DistributionMath.calculateStrokeDasharray(
            adjustedPercentage,
            circumference,
          );
          const strokeDashoffset = DistributionMath.calculateStrokeDashoffset(
            adjustedOffset,
            circumference,
          );

          return (
            <circle
              key={segment.config.key}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={segment.config.bgColor}
              strokeWidth={thickness}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="butt"
              style={{
                transition:
                  "stroke-dasharray 0.8s cubic-bezier(0.22, 1, 0.36, 1), stroke-dashoffset 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            />
          );
        })}
      </svg>

      {/* Icons overlay */}
      <div className="absolute inset-0" style={{ width: size, height: size }}>
        {segments.map((segment) => {
          // Only show icon if segment is large enough
          if (segment.percentage < minPercentageForIcon) {
            return null;
          }

          const angleInDegrees = DistributionMath.convertAngleToDegrees(
            segment.angle,
          );

          const IconComponent = segment.config.Icon;

          return (
            <div
              key={`icon-${segment.config.key}`}
              className="absolute"
              style={{
                top: "50%",
                left: "50%",
                transform: `rotate(${angleInDegrees}deg) translateY(-${radius}px) rotate(-${angleInDegrees}deg) translate(-50%, -50%)`,
                transformOrigin: "center",
                color: segment.config.iconColor,
                transition:
                  "transform 0.8s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.6s ease-out",
                opacity: segment.percentage > 0 ? 1 : 0,
              }}
            >
              <div className="flex flex-col items-center gap-0.5">
                <IconComponent
                  size={segment.config.key === "special" ? "md" : "lg"}
                />
                {showPercentages && (
                  <span
                    className="font-secondary text-[9px] tracking-wider leading-none whitespace-nowrap"
                    style={{ color: segment.config.iconColor, opacity: 0.8 }}
                  >
                    {Math.round(segment.percentage)}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
