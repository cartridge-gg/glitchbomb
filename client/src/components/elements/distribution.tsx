import { useMemo } from "react";
import {
  BombOrbIcon,
  ChipIcon,
  CrossIcon,
  HeartIcon,
  MoonrockIcon,
  SparklesIcon,
} from "@/components/icons";
import { DistributionMath, type SegmentConfig } from "@/helpers/distribution";
import { cn } from "@/lib/utils";

export interface DistributionValues {
  bombs: number;
  points: number;
  multipliers: number;
  health: number;
  chips: number;
  moonrocks: number;
}

interface DistributionProps {
  values: DistributionValues;
  size?: number;
  thickness?: number;
  className?: string;
}

// Configuration for each segment type
const SEGMENT_CONFIGS: SegmentConfig[] = [
  {
    key: "bombs",
    bgColor: "var(--red-300)", // Custom red from preset
    iconColor: "var(--red-100)", // Custom red from preset
    Icon: BombOrbIcon,
    order: 0,
  },
  {
    key: "points",
    bgColor: "var(--green-900)", // Custom green from preset
    iconColor: "var(--green-400)", // Custom green from preset
    Icon: SparklesIcon,
    order: 1,
  },
  {
    key: "multipliers",
    bgColor: "var(--yellow-300)", // Custom yellow from preset
    iconColor: "var(--yellow-100)", // Custom yellow from preset
    Icon: CrossIcon,
    order: 3,
  },
  {
    key: "health",
    bgColor: "var(--salmon-300)", // Custom salmon from preset
    iconColor: "var(--salmon-100)", // Custom salmon from preset
    Icon: HeartIcon,
    order: 2,
  },
  {
    key: "chips",
    bgColor: "var(--orange-300)", // Custom orange from preset
    iconColor: "var(--orange-100)", // Custom orange from preset
    Icon: ChipIcon,
    order: 5,
  },
  {
    key: "moonrocks",
    bgColor: "var(--blue-300)", // Custom blue from preset
    iconColor: "var(--blue-100)", // Custom blue from preset
    Icon: MoonrockIcon,
    order: 4,
  },
];

export const Distribution = ({
  values,
  size = 450,
  thickness = 75,
  className,
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
        viewBox={`0 0 ${size} ${size}`}
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
          stroke="rgba(255, 255, 255, 0.1)"
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
                  "stroke-dasharray 0.5s ease-in-out, stroke-dashoffset 0.5s ease-in-out",
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
              className="absolute transition-transform duration-500 ease-in-out"
              style={{
                top: "50%",
                left: "50%",
                transform: `rotate(${angleInDegrees}deg) translateY(-${radius}px) rotate(-${angleInDegrees}deg) translate(-50%, -50%)`,
                transformOrigin: "center",
                color: segment.config.iconColor,
              }}
            >
              <IconComponent size="2xl" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
