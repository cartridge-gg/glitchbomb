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
  special: number;
}

export interface SpecialBreakdown {
  chips: number;
  moonrocks: number;
}

interface DistributionProps {
  values: DistributionValues;
  specialBreakdown?: SpecialBreakdown;
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
    bgColor: "var(--orb-multiplier-faded)",
    iconColor: "var(--orb-multiplier)",
    Icon: CrossIcon,
    order: 3,
  },
  {
    key: "health",
    bgColor: "var(--orb-heart-faded)",
    iconColor: "var(--orb-heart)",
    Icon: HeartIcon,
    order: 2,
  },
  {
    key: "special",
    bgColor: "var(--orb-moonrock-faded)",
    iconColor: "var(--orb-moonrock)",
    Icon: MoonrockIcon,
    order: 4,
  },
];

const SpecialIcon = ({
  breakdown,
}: {
  breakdown: SpecialBreakdown | undefined;
}) => {
  const hasChips = breakdown ? breakdown.chips > 0 : false;
  const hasMoonrocks = breakdown ? breakdown.moonrocks > 0 : false;

  if (hasChips && hasMoonrocks) {
    return (
      <div
        className="flex items-center gap-px"
        style={{ transform: "rotate(20deg)" }}
      >
        <ChipIcon className="h-[26px] w-[26px]" />
        <div className="h-4 w-px bg-current opacity-25 shrink-0" />
        <MoonrockIcon className="h-[26px] w-[26px]" />
      </div>
    );
  }

  if (hasChips) return <ChipIcon size="lg" />;
  return <MoonrockIcon size="lg" />;
};

export const Distribution = ({
  values,
  specialBreakdown,
  size = 300,
  thickness = 50,
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
          const isSpecial = segment.config.key === "special";

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
              {isSpecial ? (
                <SpecialIcon breakdown={specialBreakdown} />
              ) : (
                <IconComponent size="lg" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
