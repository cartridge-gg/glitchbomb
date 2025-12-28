import { forwardRef } from "react";
import { iconVariants } from ".";
import type { IconProps } from "./types";

export type OrbHealthIconProps = IconProps;

export const OrbHealthIcon = forwardRef<SVGSVGElement, OrbHealthIconProps>(
  ({ className, size, ...props }, forwardedRef) => {
    return (
      <svg
        viewBox="0 0 236 223"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Orb Health icon"
        aria-hidden="true"
        {...props}
      >
        <path
          d="M168.061 76.9914C164.59 70.6812 142.826 49.5508 117.597 80.1435C91.103 49.5508 70.5993 70.6812 67.1338 76.9914C60.8235 88.6596 64.6085 106.325 73.444 114.841L117.604 159L161.763 114.841C170.587 106.325 174.371 88.6656 168.061 76.9914Z"
          fill="currentColor"
        />
      </svg>
    );
  },
);

OrbHealthIcon.displayName = "OrbHealthIcon";
