/**
 * Simplex noise generator
 * @param x - Input value
 * @param seed - Seed for randomness
 * @returns Noise value between 0 and 1
 */
function noise(x: number, seed: number): number {
  const n = Math.sin(x * 12.9898 + seed * 78.233) * 43758.5453123;
  return n - Math.floor(n);
}

/**
 * Generates periodic noise (repeats after 2π in space AND time)
 * @param angle - Angle in radians
 * @param frameIndex - Current frame index
 * @param seed - Seed for randomness
 * @param animationFrames - Total number of animation frames
 * @returns Noise value between -1 and 1
 */
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

/**
 * Calculates a point on a rounded square for a given parameter
 * @param t - Parameter [0, 1] that traverses the perimeter
 * @param size - Square size (50 = 50%)
 * @param cornerRadius - Corner radius
 * @returns Point coordinates {x, y}
 */
function roundedSquarePoint(
  t: number,
  size: number,
  cornerRadius: number,
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

/**
 * Calculates the normal (perpendicular) vector at a point on the rounded square
 * @param t - Parameter [0, 1] that traverses the perimeter
 * @param size - Square size (50 = 50%)
 * @param cornerRadius - Corner radius
 * @returns Normal vector {nx, ny}
 */
function roundedSquareNormal(
  t: number,
  size: number,
  cornerRadius: number,
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

export const MultiplierMath = {
  /**
   * Generates a ring-shaped clip-path (border)
   * @param frameIndex - Current frame index
   * @param seed - Seed for randomness
   * @param noiseAmplitude - Noise amplitude
   * @param borderWidth - Border width in percentage
   * @param noisePoints - Number of points
   * @param safetyMargin - Safety margin in percentage
   * @param animationFrames - Total number of animation frames
   * @param cornerRadius - Corner radius
   * @returns Clip-path string
   */
  generateRingClipPath(
    frameIndex: number,
    seed: number,
    noiseAmplitude: number,
    borderWidth: number,
    noisePoints: number,
    safetyMargin: number,
    animationFrames: number,
    cornerRadius: number,
    aspectRatio: number = 1,
    noiseFrequency: number = 1,
  ): string {
    const outerPoints: string[] = [];
    const innerPoints: string[] = [];
    const outerSize = 50 - safetyMargin;
    const innerSize = 50 - safetyMargin - borderWidth;

    for (let i = 0; i < noisePoints; i++) {
      const t = i / noisePoints;
      const angle = t * Math.PI * 2 * noiseFrequency;

      const noiseValue = periodicNoise(
        angle,
        frameIndex,
        seed,
        animationFrames,
      );

      const displacement = noiseValue * noiseAmplitude * 10;

      const outerPoint = roundedSquarePoint(t, outerSize, cornerRadius);
      const normal = roundedSquareNormal(t, outerSize, cornerRadius);

      const outerX = outerPoint.x + normal.nx * displacement;
      const outerY = outerPoint.y + normal.ny * displacement;
      outerPoints.push(`${outerX.toFixed(2)}% ${outerY.toFixed(2)}%`);

      if (aspectRatio === 1) {
        const innerPoint = roundedSquarePoint(t, innerSize, cornerRadius);
        const innerX = innerPoint.x + normal.nx * displacement;
        const innerY = innerPoint.y + normal.ny * displacement;
        innerPoints.push(`${innerX.toFixed(2)}% ${innerY.toFixed(2)}%`);
      } else {
        // Correct border width for aspect ratio so it looks visually uniform
        const ar = aspectRatio;
        const normalMag = Math.sqrt(
          (normal.nx * ar) ** 2 + normal.ny ** 2,
        );
        const adjustedBorder =
          normalMag > 0 ? borderWidth / normalMag : borderWidth;
        const innerX =
          outerPoint.x - normal.nx * adjustedBorder + normal.nx * displacement;
        const innerY =
          outerPoint.y - normal.ny * adjustedBorder + normal.ny * displacement;
        innerPoints.push(`${innerX.toFixed(2)}% ${innerY.toFixed(2)}%`);
      }
    }

    // Use evenodd rule to create a hole
    return `polygon(evenodd, ${outerPoints.join(",")}, ${innerPoints.join(",")})`;
  },

  /**
   * Generates a clip-path for content (outer polygon)
   * @param frameIndex - Current frame index
   * @param seed - Seed for randomness
   * @param noiseAmplitude - Noise amplitude
   * @param noisePoints - Number of points
   * @param safetyMargin - Safety margin in percentage
   * @param animationFrames - Total number of animation frames
   * @param cornerRadius - Corner radius
   * @returns Clip-path string
   */
  generateContentClipPath(
    frameIndex: number,
    seed: number,
    noiseAmplitude: number,
    noisePoints: number,
    safetyMargin: number,
    animationFrames: number,
    cornerRadius: number,
    aspectRatio: number = 1,
    noiseFrequency: number = 1,
  ): string {
    const points: string[] = [];
    const outerSize = 50 - safetyMargin;

    for (let i = 0; i < noisePoints; i++) {
      const t = i / noisePoints;
      const angle = t * Math.PI * 2 * noiseFrequency;

      const noiseValue = periodicNoise(
        angle,
        frameIndex,
        seed,
        animationFrames,
      );

      const displacement = noiseValue * noiseAmplitude * 10;

      const point = roundedSquarePoint(t, outerSize, cornerRadius);
      const normal = roundedSquareNormal(t, outerSize, cornerRadius);

      const x = point.x + normal.nx * displacement;
      const y = point.y + normal.ny * displacement;
      points.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
    }

    return `polygon(${points.join(",")})`;
  },

  /**
   * Calculates noise amplitude based on magnitude
   * @param magnitude - Magnitude value (1-5)
   * @param min - Minimum amplitude
   * @param max - Maximum amplitude
   * @returns Interpolated amplitude
   */
  calculateNoiseAmplitude(magnitude: number, min: number, max: number): number {
    const t = (magnitude - 1) / 4; // Normalize magnitude [1,5] to [0,1]
    return min + t * (max - min);
  },

  /**
   * Calculates border width based on magnitude
   * @param magnitude - Magnitude value (1-5)
   * @param min - Minimum border width
   * @param max - Maximum border width
   * @returns Interpolated border width
   */
  calculateBorderWidth(magnitude: number, min: number, max: number): number {
    const t = (magnitude - 1) / 4; // Normalize magnitude [1,5] to [0,1]
    return min + t * (max - min);
  },

  /**
   * Calculates safety margin based on magnitude
   * @param magnitude - Magnitude value (1-5)
   * @param min - Minimum margin
   * @param max - Maximum margin
   * @returns Interpolated margin
   */
  calculateSafetyMargin(magnitude: number, min: number, max: number): number {
    const t = (magnitude - 1) / 4; // Normalize magnitude [1,5] to [0,1]
    return min + t * (max - min);
  },

  /**
   * Calculates number of noise points based on magnitude (inversely proportional)
   * @param magnitude - Magnitude value (1-5)
   * @param min - Minimum number of points
   * @param max - Maximum number of points
   * @returns Calculated number of points
   */
  calculateNoisePoints(magnitude: number, min: number, max: number): number {
    const t = (magnitude - 1) / 4; // Normalize magnitude [1,5] to [0,1]
    // Inverse interpolation: MAX when t=0, MIN when t=1
    const points = max - t * (max - min);
    return Math.round(points);
  },

  /**
   * Gets CSS gradient color for a given magnitude
   * @param magnitude - Magnitude value (1-5)
   * @returns CSS variable name
   */
  getMagnitudeGradient(magnitude: 1 | 2 | 3 | 4 | 5): string {
    const gradients = {
      1: "var(--multiplier-one-200)",
      2: "var(--multiplier-two-200)",
      3: "var(--multiplier-three-200)",
      4: "var(--multiplier-four-200)",
      5: "var(--multiplier-five-200)",
    };
    return gradients[magnitude];
  },

  /**
   * Gets CSS border gradient color for a given magnitude
   * @param magnitude - Magnitude value (1-5)
   * @returns CSS variable name
   */
  getMagnitudeBorderGradient(magnitude: 1 | 2 | 3 | 4 | 5): string {
    const gradients = {
      1: "var(--multiplier-one-100)",
      2: "var(--multiplier-two-100)",
      3: "var(--multiplier-three-100)",
      4: "var(--multiplier-four-100)",
      5: "var(--multiplier-five-100)",
    };
    return gradients[magnitude];
  },

  /**
   * Gets dominant color for a given magnitude
   * @param magnitude - Magnitude value (1-5)
   * @returns Hex color code
   */
  getMagnitudeColor(magnitude: 1 | 2 | 3 | 4 | 5): string {
    const colors = {
      1: "#00FF4D",
      2: "#FFE100",
      3: "#FF7B00",
      4: "#FFAA56",
      5: "#FF5678",
    };
    return colors[magnitude];
  },
};
