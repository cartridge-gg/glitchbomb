import { cva, type VariantProps } from "class-variance-authority";
import { useMemo } from "react";
import { ElectricBorder } from "@/components/ui/electric-border";
import { MultiplierMath } from "@/helpers/multiplier";
import { cn } from "@/lib/utils";

// Bounds for safety margin (in %)
const SAFETY_MARGIN_MIN = 2;
const SAFETY_MARGIN_MAX = 2;

// Bounds for the number of polygon points
const NOISE_POINTS_MIN = 128;
const NOISE_POINTS_MAX = 256;

// Bounds for noise amplitude (0-1)
const NOISE_AMPLITUDE_MIN = 0.15;
const NOISE_AMPLITUDE_MAX = 0.5;

// Bounds for border width (in %)
const BORDER_WIDTH_MIN = 2;
const BORDER_WIDTH_MAX = 5;

export type MultiplierMagnitude = 1 | 2 | 3 | 4 | 5;

export interface MultiplierProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof multiplierVariants> {
  count: number;
  electricColor?: string;
  electricGradient?: string;
  electricBorderGradient?: string;
  contentOpacity?: number;
  animationFrames?: number;
  cornerRadius?: number;
  safetyMarginMin?: number;
  safetyMarginMax?: number;
  noisePointsMin?: number;
  noisePointsMax?: number;
  noiseAmplitudeMin?: number;
  noiseAmplitudeMax?: number;
  borderWidthMin?: number;
  borderWidthMax?: number;
}

const multiplierVariants = cva(
  "relative flex items-center justify-center rounded-lg transition-all",
  {
    variants: {
      variant: {
        default: "h-full w-auto font-bold",
      },
      size: {
        md: "text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

const multiplierContainerVariants = cva(
  "relative flex items-center justify-center rounded-lg",
  {
    variants: {
      size: {
        md: "h-full",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export const Multiplier = ({
  count,
  variant,
  size,
  className,
  electricColor,
  electricGradient,
  electricBorderGradient,
  contentOpacity,
  animationFrames = 60,
  cornerRadius = 8,
  safetyMarginMin = SAFETY_MARGIN_MIN,
  safetyMarginMax = SAFETY_MARGIN_MAX,
  noisePointsMin = NOISE_POINTS_MIN,
  noisePointsMax = NOISE_POINTS_MAX,
  noiseAmplitudeMin = NOISE_AMPLITUDE_MIN,
  noiseAmplitudeMax = NOISE_AMPLITUDE_MAX,
  borderWidthMin = BORDER_WIDTH_MIN,
  borderWidthMax = BORDER_WIDTH_MAX,
  ...props
}: MultiplierProps) => {
  const magnitude: MultiplierMagnitude = useMemo(() => {
    return Math.floor(Math.min(Math.max(1, count), 5)) as MultiplierMagnitude;
  }, [count]);

  const noiseAmplitude = useMemo(
    () =>
      MultiplierMath.calculateNoiseAmplitude(
        magnitude,
        noiseAmplitudeMin,
        noiseAmplitudeMax,
      ),
    [magnitude, noiseAmplitudeMin, noiseAmplitudeMax],
  );

  const borderWidth = useMemo(
    () =>
      MultiplierMath.calculateBorderWidth(
        magnitude,
        borderWidthMin,
        borderWidthMax,
      ),
    [magnitude, borderWidthMin, borderWidthMax],
  );

  const safetyMargin = useMemo(
    () =>
      MultiplierMath.calculateSafetyMargin(
        magnitude,
        safetyMarginMin,
        safetyMarginMax,
      ),
    [magnitude, safetyMarginMin, safetyMarginMax],
  );

  const noisePoints = useMemo(
    () =>
      MultiplierMath.calculateNoisePoints(
        magnitude,
        noisePointsMin,
        noisePointsMax,
      ),
    [magnitude, noisePointsMin, noisePointsMax],
  );

  const cssGradient = useMemo(
    () => MultiplierMath.getMagnitudeGradient(magnitude),
    [magnitude],
  );

  const cssBorderGradient = useMemo(
    () => MultiplierMath.getMagnitudeBorderGradient(magnitude),
    [magnitude],
  );

  const cssColor = useMemo(
    () => MultiplierMath.getMagnitudeColor(magnitude),
    [magnitude],
  );

  const resolvedGradient = electricGradient ?? cssGradient;
  const resolvedBorderGradient = electricBorderGradient ?? cssBorderGradient;
  const resolvedColor = electricColor ?? cssColor;

  return (
    <ElectricBorder
      color={resolvedColor}
      gradient={resolvedGradient}
      borderGradient={resolvedBorderGradient}
      seed={magnitude * 100}
      animationFrames={animationFrames}
      cornerRadius={cornerRadius}
      noisePoints={noisePoints}
      noiseAmplitude={noiseAmplitude}
      borderWidth={borderWidth}
      safetyMargin={safetyMargin}
      contentOpacity={contentOpacity}
      className={cn(multiplierContainerVariants({ size }), className)}
      {...props}
    >
      <div
        className={cn(
          multiplierVariants({ variant, size }),
          "flex items-center justify-center",
        )}
      >
        <p
          className="font-secondary tracking-widest select-none"
          style={{ color: resolvedColor }}
        >{`${count}X`}</p>
      </div>
    </ElectricBorder>
  );
};
