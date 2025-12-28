import { cva, type VariantProps } from "class-variance-authority";
import { useMemo } from "react";
import { MultiplierMath } from "@/helpers/multiplier";
import { cn } from "@/lib/utils";

const ANIMATION_FRAMES = 60; // Number of animation frames (higher = smoother)
const CORNER_RADIUS = 8; // Corner radius (equivalent to rounded-lg)

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

export interface MultiplierProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof multiplierVariants> {
  count: number;
  magnitude: 1 | 2 | 3 | 4 | 5;
  // Animation constants (optional, with defaults)
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

// eslint-disable-next-line react-refresh/only-export-components
export const multiplierVariants = cva(
  "relative flex items-center justify-center rounded-lg transition-all",
  {
    variants: {
      variant: {
        default: "font-bold",
      },
      size: {
        md: "size-20 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export const Multiplier = ({
  count,
  variant,
  size,
  magnitude,
  className,
  // Constants with defaults
  animationFrames = ANIMATION_FRAMES,
  cornerRadius = CORNER_RADIUS,
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
  // Dynamic calculation of amplitude and border width
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

  // Generates CSS animation with procedural noise
  const clipPathAnimation = useMemo(() => {
    const seed = magnitude * 100; // Different seed per magnitude
    const borderFrames: string[] = [];
    const contentFrames: string[] = [];

    for (let i = 0; i < animationFrames; i++) {
      const percentage = (i / (animationFrames - 1)) * 100;

      // Clip-path for border (ring)
      const ringClipPath = MultiplierMath.generateRingClipPath(
        i,
        seed,
        noiseAmplitude,
        borderWidth,
        noisePoints,
        safetyMargin,
        animationFrames,
        cornerRadius,
      );
      borderFrames.push(
        `${percentage.toFixed(0)}% { clip-path: ${ringClipPath}; }`,
      );

      // Clip-path for content (same noise, inner polygon only)
      const contentClipPath = MultiplierMath.generateContentClipPath(
        i,
        seed,
        noiseAmplitude,
        noisePoints,
        safetyMargin,
        animationFrames,
        cornerRadius,
      );
      contentFrames.push(
        `${percentage.toFixed(0)}% { clip-path: ${contentClipPath}; }`,
      );
    }

    const borderAnimationName = `electric-border-${magnitude}`;
    const contentAnimationName = `electric-content-${magnitude}`;

    return {
      borderName: borderAnimationName,
      contentName: contentAnimationName,
      keyframes: `
				@keyframes ${borderAnimationName} { ${borderFrames.join(" ")} }
				@keyframes ${contentAnimationName} { ${contentFrames.join(" ")} }
			`,
    };
  }, [
    magnitude,
    noiseAmplitude,
    borderWidth,
    noisePoints,
    safetyMargin,
    animationFrames,
    cornerRadius,
  ]);

  return (
    <>
      {/* Inject keyframes dynamically */}
      <style>{clipPathAnimation.keyframes}</style>

      <div
        className="relative inline-flex items-center justify-center rounded-lg"
        style={
          {
            "--electric-color": cssColor,
            "--electric-gradient": cssGradient,
            "--electric-border-gradient": cssBorderGradient,
            // Large CSS border to create safety margin
            padding: `${safetyMargin}%`,
          } as React.CSSProperties
        }
      >
        {/* 1. Glow Layers */}
        <div className="absolute inset-0 opacity-20 blur-xl bg-[var(--electric-color)]" />

        {/* 2. Electric Border with animated clip-path */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "var(--electric-border-gradient)",
            boxShadow: "0 0 8px var(--electric-color)",
            animation: `${clipPathAnimation.borderName} 2s ease-in-out infinite`,
          }}
        />

        {/* 3. Component Content with synchronized clip-path */}
        <div
          className={cn(
            multiplierVariants({ variant, size, className }),
            "relative z-10",
          )}
          style={{
            backgroundImage: "var(--electric-gradient)",
            animation: `${clipPathAnimation.contentName} 2s ease-in-out infinite`,
          }}
          {...props}
        >
          <p
            className="font-secondary tracking-widest select-none"
            style={{ color: "var(--electric-color)" }}
          >{`${count}X`}</p>
        </div>
      </div>
    </>
  );
};
