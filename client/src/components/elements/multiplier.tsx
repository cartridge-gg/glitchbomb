import { cva, type VariantProps } from "class-variance-authority";
import { useMemo } from "react";
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

// Simplified simplex noise generator
function noise(x: number, seed: number): number {
  const n = Math.sin(x * 12.9898 + seed * 78.233) * 43758.5453123;
  return n - Math.floor(n);
}

// Generates periodic noise (repeats after 2π in space AND time)
function periodicNoise(
  angle: number,
  frameIndex: number,
  seed: number,
  animationFrames: number,
): number {
  // Use sin and cos to create perfectly looping noise in space
  const x = Math.cos(angle) * 3;
  const y = Math.sin(angle) * 3;

  // Make time periodic as well for a perfect loop
  const t = (frameIndex / animationFrames) * Math.PI * 2; // 0 to 2π
  const timeX = Math.cos(t) * 2;
  const timeY = Math.sin(t) * 2;

  const n1 = noise(x + timeX, seed);
  const n2 = noise(y + timeY, seed + 1000);
  return ((n1 + n2) / 2) * 2 - 1; // Normalize between -1 and 1
}

// Calculates a point on a rounded square for a given angle [0, 2π]
function roundedSquarePoint(
  t: number, // Parameter [0, 1] that traverses the perimeter
  size: number, // Square size (50 = 50%)
  cornerRadius: number, // Corner radius
): { x: number; y: number } {
  const halfSize = size;
  const r = cornerRadius;
  const centerX = 50;
  const centerY = 50;

  // Length of a straight side (without corners)
  const sideLength = (halfSize - r) * 2;
  // Length of a corner arc (quarter circle)
  const cornerLength = (Math.PI / 2) * r;
  // Total perimeter
  const totalLength = 4 * sideLength + 4 * cornerLength;

  // Distance traveled
  const dist = t * totalLength;

  // Top-right corner and right side (from top-right to bottom-right)
  if (dist < cornerLength) {
    // Top-right corner arc (from 0° to 90°)
    const angle = (dist / cornerLength) * (Math.PI / 2);
    return {
      x: centerX + halfSize - r + r * Math.sin(angle),
      y: centerY - halfSize + r - r * Math.cos(angle),
    };
  }

  if (dist < cornerLength + sideLength) {
    // Right side (vertical)
    const d = dist - cornerLength;
    return {
      x: centerX + halfSize,
      y: centerY - halfSize + r + d,
    };
  }

  // Bottom-right corner
  if (dist < 2 * cornerLength + sideLength) {
    const d = dist - cornerLength - sideLength;
    const angle = (d / cornerLength) * (Math.PI / 2);
    return {
      x: centerX + halfSize - r + r * Math.cos(angle),
      y: centerY + halfSize - r + r * Math.sin(angle),
    };
  }

  // Bottom side (horizontal)
  if (dist < 2 * cornerLength + 2 * sideLength) {
    const d = dist - 2 * cornerLength - sideLength;
    return {
      x: centerX + halfSize - r - d,
      y: centerY + halfSize,
    };
  }

  // Bottom-left corner
  if (dist < 3 * cornerLength + 2 * sideLength) {
    const d = dist - 2 * cornerLength - 2 * sideLength;
    const angle = (d / cornerLength) * (Math.PI / 2);
    return {
      x: centerX - halfSize + r - r * Math.sin(angle),
      y: centerY + halfSize - r + r * Math.cos(angle),
    };
  }

  // Left side (vertical)
  if (dist < 3 * cornerLength + 3 * sideLength) {
    const d = dist - 3 * cornerLength - 2 * sideLength;
    return {
      x: centerX - halfSize,
      y: centerY + halfSize - r - d,
    };
  }

  // Top-left corner
  if (dist < 4 * cornerLength + 3 * sideLength) {
    const d = dist - 3 * cornerLength - 3 * sideLength;
    const angle = (d / cornerLength) * (Math.PI / 2);
    return {
      x: centerX - halfSize + r - r * Math.cos(angle),
      y: centerY - halfSize + r - r * Math.sin(angle),
    };
  }

  // Top side (horizontal)
  const d = dist - 4 * cornerLength - 3 * sideLength;
  return {
    x: centerX - halfSize + r + d,
    y: centerY - halfSize,
  };
}

// Calculates the normal (perpendicular) vector at a point on the rounded square
function roundedSquareNormal(
  t: number, // Parameter [0, 1] that traverses the perimeter
  size: number, // Square size (50 = 50%)
  cornerRadius: number, // Corner radius
): { nx: number; ny: number } {
  const halfSize = size;
  const r = cornerRadius;

  // Length of a straight side (without corners)
  const sideLength = (halfSize - r) * 2;
  // Length of a corner arc (quarter circle)
  const cornerLength = (Math.PI / 2) * r;
  // Total perimeter
  const totalLength = 4 * sideLength + 4 * cornerLength;

  // Distance traveled
  const dist = t * totalLength;

  // Top-right corner
  if (dist < cornerLength) {
    const angle = (dist / cornerLength) * (Math.PI / 2);
    // Normal points outward from corner center
    return {
      nx: Math.sin(angle),
      ny: -Math.cos(angle),
    };
  }

  // Right side (normal points right)
  if (dist < cornerLength + sideLength) {
    return { nx: 1, ny: 0 };
  }

  // Bottom-right corner
  if (dist < 2 * cornerLength + sideLength) {
    const d = dist - cornerLength - sideLength;
    const angle = (d / cornerLength) * (Math.PI / 2);
    return {
      nx: Math.cos(angle),
      ny: Math.sin(angle),
    };
  }

  // Bottom side (normal points down)
  if (dist < 2 * cornerLength + 2 * sideLength) {
    return { nx: 0, ny: 1 };
  }

  // Bottom-left corner
  if (dist < 3 * cornerLength + 2 * sideLength) {
    const d = dist - 2 * cornerLength - 2 * sideLength;
    const angle = (d / cornerLength) * (Math.PI / 2);
    return {
      nx: -Math.sin(angle),
      ny: Math.cos(angle),
    };
  }

  // Left side (normal points left)
  if (dist < 3 * cornerLength + 3 * sideLength) {
    return { nx: -1, ny: 0 };
  }

  // Top-left corner
  if (dist < 4 * cornerLength + 3 * sideLength) {
    const d = dist - 3 * cornerLength - 3 * sideLength;
    const angle = (d / cornerLength) * (Math.PI / 2);
    return {
      nx: -Math.cos(angle),
      ny: -Math.sin(angle),
    };
  }

  // Top side (normal points up)
  return { nx: 0, ny: -1 };
}

// Generates a ring-shaped clip-path (border)
function generateRingClipPath(
  frameIndex: number,
  seed: number,
  noiseAmplitude: number,
  borderWidth: number,
  noisePoints: number,
  safetyMargin: number,
  animationFrames: number,
  cornerRadius: number,
): string {
  const outerPoints: string[] = [];
  const innerPoints: string[] = [];
  // Outer polygon starts further inside to create a margin
  const outerSize = 50 - safetyMargin;
  const innerSize = 50 - safetyMargin - borderWidth;

  for (let i = 0; i < noisePoints; i++) {
    const t = i / noisePoints; // Parameter [0, 1] that traverses the perimeter
    const angle = t * Math.PI * 2; // For periodic noise

    // Generate periodic noise ONCE for this point
    const noiseValue = periodicNoise(angle, frameIndex, seed, animationFrames);

    // Calculate displacement: use a fixed reference size (e.g., 10) to keep displacement consistent
    const displacement = noiseValue * noiseAmplitude * 10;

    // Get base points and normal vector
    const outerPoint = roundedSquarePoint(t, outerSize, cornerRadius);
    const innerPoint = roundedSquarePoint(t, innerSize, cornerRadius);
    const normal = roundedSquareNormal(t, outerSize, cornerRadius);

    // Apply SAME displacement to both polygons to maintain constant border width
    const outerX = outerPoint.x + normal.nx * displacement;
    const outerY = outerPoint.y + normal.ny * displacement;
    outerPoints.push(`${outerX.toFixed(2)}% ${outerY.toFixed(2)}%`);

    const innerX = innerPoint.x + normal.nx * displacement;
    const innerY = innerPoint.y + normal.ny * displacement;
    innerPoints.push(`${innerX.toFixed(2)}% ${innerY.toFixed(2)}%`);
  }

  // Use evenodd rule to create a hole
  return `polygon(evenodd, ${outerPoints.join(",")}, ${innerPoints.join(",")})`;
}

// Generates a clip-path for content (outer polygon)
function generateContentClipPath(
  frameIndex: number,
  seed: number,
  noiseAmplitude: number,
  noisePoints: number,
  safetyMargin: number,
  animationFrames: number,
  cornerRadius: number,
): string {
  const points: string[] = [];
  // Content uses the same radius as the OUTER polygon of the border
  const outerSize = 50 - safetyMargin;

  for (let i = 0; i < noisePoints; i++) {
    const t = i / noisePoints; // Parameter [0, 1] that traverses the perimeter
    const angle = t * Math.PI * 2; // For periodic noise

    // Use the SAME periodic noise as the ring
    const noiseValue = periodicNoise(angle, frameIndex, seed, animationFrames);

    // Calculate displacement: use a fixed reference size (e.g., 10) to keep displacement consistent
    const displacement = noiseValue * noiseAmplitude * 10;

    // Get base point and normal vector
    const point = roundedSquarePoint(t, outerSize, cornerRadius);
    const normal = roundedSquareNormal(t, outerSize, cornerRadius);

    // Apply noise displacement along the normal (perpendicular to border)
    const x = point.x + normal.nx * displacement;
    const y = point.y + normal.ny * displacement;
    points.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
  }

  return `polygon(${points.join(",")})`;
}

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
  // Linear interpolation between min/max bounds based on magnitude (1-5)
  const noiseAmplitude = useMemo(() => {
    const t = (magnitude - 1) / 4; // Normalize magnitude [1,5] to [0,1]
    return noiseAmplitudeMin + t * (noiseAmplitudeMax - noiseAmplitudeMin);
  }, [magnitude, noiseAmplitudeMin, noiseAmplitudeMax]);

  const borderWidth = useMemo(() => {
    const t = (magnitude - 1) / 4; // Normalize magnitude [1,5] to [0,1]
    return borderWidthMin + t * (borderWidthMax - borderWidthMin);
  }, [magnitude, borderWidthMin, borderWidthMax]);

  // Safety margin interpolated between min/max
  // magnitude = 1 → min% margin
  // magnitude = 5 → max% margin
  const safetyMargin = useMemo(() => {
    const t = (magnitude - 1) / 4; // Normalize magnitude [1,5] to [0,1]
    return safetyMarginMin + t * (safetyMarginMax - safetyMarginMin);
  }, [magnitude, safetyMarginMin, safetyMarginMax]);

  // Number of points INVERSELY proportional to magnitude
  // magnitude = 1 → more points (max) = smoother shape
  // magnitude = 5 → fewer points (min) = more chaotic shape
  const noisePoints = useMemo(() => {
    const t = (magnitude - 1) / 4; // Normalize magnitude [1,5] to [0,1]
    // Inverse interpolation: MAX when t=0, MIN when t=1
    const points = noisePointsMax - t * (noisePointsMax - noisePointsMin);
    return Math.round(points);
  }, [magnitude, noisePointsMin, noisePointsMax]);

  const cssGradient = useMemo(() => {
    switch (magnitude) {
      case 1:
        return "var(--multiplier-one-200)";
      case 2:
        return "var(--multiplier-two-200)";
      case 3:
        return "var(--multiplier-three-200)";
      case 4:
        return "var(--multiplier-four-200)";
      case 5:
        return "var(--multiplier-five-200)";
    }
  }, [magnitude]);

  const cssBorderGradient = useMemo(() => {
    switch (magnitude) {
      case 1:
        return "var(--multiplier-one-100)";
      case 2:
        return "var(--multiplier-two-100)";
      case 3:
        return "var(--multiplier-three-100)";
      case 4:
        return "var(--multiplier-four-100)";
      case 5:
        return "var(--multiplier-five-100)";
    }
  }, [magnitude]);

  const cssColor = useMemo(() => {
    switch (magnitude) {
      case 1:
        return "#00FF4D"; // Dominant gradient color
      case 2:
        return "#FFE100";
      case 3:
        return "#FF7B00";
      case 4:
        return "#FFAA56";
      case 5:
        return "#FF5678";
    }
  }, [magnitude]);

  // Generates CSS animation with procedural noise
  const clipPathAnimation = useMemo(() => {
    const seed = magnitude * 100; // Different seed per magnitude
    const borderFrames: string[] = [];
    const contentFrames: string[] = [];

    for (let i = 0; i < animationFrames; i++) {
      const percentage = (i / (animationFrames - 1)) * 100;

      // Clip-path for border (ring)
      const ringClipPath = generateRingClipPath(
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
      const contentClipPath = generateContentClipPath(
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
