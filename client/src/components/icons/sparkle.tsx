import { forwardRef } from "react";
import { iconVariants } from ".";
import type { IconProps } from "./types";

export type SparkleIconProps = IconProps;

export const SparkleIcon = forwardRef<SVGSVGElement, SparkleIconProps>(
  ({ className, size, ...props }, forwardedRef) => {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        aria-label="Sparkle icon"
        aria-hidden="true"
        {...props}
      >
        <path
          d="M21.589 11.589C16.5205 11.589 12.411 7.47945 12.411 2.41096C12.411 2.19157 12.2194 2 12 2C11.7806 2 11.589 2.19157 11.589 2.41096C11.589 7.47945 7.47945 11.589 2.41096 11.589C2.19157 11.589 2 11.7806 2 12C2 12.2194 2.19157 12.411 2.41096 12.411C7.47945 12.411 11.589 16.5205 11.589 21.589C11.589 21.8084 11.7806 22 12 22C12.2194 22 12.411 21.8084 12.411 21.589C12.411 16.5205 16.5205 12.411 21.589 12.411C21.8084 12.411 22 12.2194 22 12C22 11.7806 21.8084 11.589 21.589 11.589Z"
          fill="currentColor"
        />
      </svg>
    );
  },
);

SparkleIcon.displayName = "SparkleIcon";
