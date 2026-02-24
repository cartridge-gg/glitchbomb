import { forwardRef } from "react";
import { iconVariants } from ".";
import type { IconProps } from "./types";

export type OrbPointIconProps = IconProps;

export const OrbPointIcon = forwardRef<SVGSVGElement, OrbPointIconProps>(
  ({ className, size, ...props }, forwardedRef) => {
    return (
      <svg
        viewBox="0 0 222 222"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Orb Point icon"
        aria-hidden="true"
        {...props}
      >
        <path
          d="M163.74 104.74C135.863 104.74 113.26 82.137 113.26 54.2603C113.26 53.0536 112.207 52 111 52C109.793 52 108.74 53.0536 108.74 54.2603C108.74 82.137 86.137 104.74 58.2603 104.74C57.0536 104.74 56 105.793 56 107C56 108.207 57.0536 109.26 58.2603 109.26C86.137 109.26 108.74 131.863 108.74 159.74C108.74 160.946 109.793 162 111 162C112.207 162 113.26 160.946 113.26 159.74C113.26 131.863 135.863 109.26 163.74 109.26C164.946 109.26 166 108.207 166 107C166 105.793 164.946 104.74 163.74 104.74Z"
          fill="currentColor"
        />
      </svg>
    );
  },
);

OrbPointIcon.displayName = "OrbPointIcon";
