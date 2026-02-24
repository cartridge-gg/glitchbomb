import type { DistributionValues } from "@/components/elements/distribution";
import type { IconProps } from "@/components/icons";

export interface SegmentConfig {
  key: keyof DistributionValues;
  bgColor: string;
  iconColor: string;
  Icon: React.ForwardRefExoticComponent<IconProps>;
  order: number;
}

export interface Segment {
  value: number;
  percentage: number;
  offset: number;
  config: SegmentConfig;
  angle: number; // Center angle in percentage
}

export const DistributionMath = {
  /**
   * Calculates segments from distribution values
   * @param values - The distribution values
   * @param configs - The segment configurations
   * @returns Array of calculated segments
   */
  calculateSegments(
    values: DistributionValues,
    configs: SegmentConfig[],
  ): Segment[] {
    // Calculate total
    const total = Object.values(values).reduce(
      (sum, v) => sum + Math.max(0, v),
      0,
    );

    if (total === 0) {
      return [];
    }

    let currentOffset = 0;
    const result: Segment[] = [];

    for (const config of configs.sort((a, b) => a.order - b.order)) {
      const value = Math.max(0, values[config.key]);
      if (value === 0) continue;

      const percentage = (value / total) * 100;
      const angle = currentOffset + percentage / 2; // Center angle of the segment

      result.push({
        value,
        percentage,
        offset: currentOffset,
        config,
        angle,
      });

      currentOffset += percentage;
    }

    return result;
  },

  /**
   * Calculates the radius from size and thickness
   * @param size - The total size
   * @param thickness - The thickness of the ring
   * @returns The radius
   */
  calculateRadius(size: number, thickness: number): number {
    return (size - thickness) / 2;
  },

  /**
   * Calculates the circumference from radius
   * @param radius - The radius
   * @returns The circumference
   */
  calculateCircumference(radius: number): number {
    return 2 * Math.PI * radius;
  },

  /**
   * Converts overlap in degrees to percentage
   * @param overlapDegrees - The overlap in degrees
   * @returns The overlap in percentage
   */
  degreesToPercentage(overlapDegrees: number): number {
    return (overlapDegrees / 360) * 100;
  },

  /**
   * Calculates minimum percentage needed to show an icon
   * @param iconSize - The icon size in pixels
   * @param circumference - The circumference
   * @returns The minimum percentage
   */
  calculateMinPercentageForIcon(
    iconSize: number,
    circumference: number,
  ): number {
    return (iconSize / circumference) * 100;
  },

  /**
   * Calculates adjusted percentage for a segment with overlap
   * @param percentage - The original percentage
   * @param overlapPercentage - The overlap percentage
   * @returns The adjusted percentage
   */
  calculateAdjustedPercentage(
    percentage: number,
    overlapPercentage: number,
  ): number {
    return percentage + overlapPercentage;
  },

  /**
   * Calculates adjusted offset for a segment with overlap
   * @param offset - The original offset
   * @param overlapPercentage - The overlap percentage
   * @param isFirstSegment - Whether this is the first segment
   * @returns The adjusted offset
   */
  calculateAdjustedOffset(
    offset: number,
    overlapPercentage: number,
    isFirstSegment: boolean,
  ): number {
    return isFirstSegment ? offset : offset - overlapPercentage / 2;
  },

  /**
   * Calculates stroke dash array for SVG circle
   * @param percentage - The percentage of the circle
   * @param circumference - The circumference
   * @returns The stroke dash array string
   */
  calculateStrokeDasharray(percentage: number, circumference: number): string {
    return `${(percentage / 100) * circumference} ${circumference}`;
  },

  /**
   * Calculates stroke dash offset for SVG circle
   * @param offset - The offset percentage
   * @param circumference - The circumference
   * @returns The stroke dash offset value
   */
  calculateStrokeDashoffset(offset: number, circumference: number): number {
    return -((offset / 100) * circumference);
  },

  /**
   * Converts angle from percentage to degrees with rotation adjustment
   * @param anglePercentage - The angle in percentage (0-100)
   * @param rotationAdjustment - The rotation adjustment in degrees
   * @returns The angle in degrees
   */
  convertAngleToDegrees(
    anglePercentage: number,
    rotationAdjustment = 270,
  ): number {
    return (anglePercentage * 360) / 100 + rotationAdjustment;
  },
};
