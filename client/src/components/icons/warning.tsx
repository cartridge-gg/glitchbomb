import { forwardRef } from "react";
import { iconVariants } from ".";
import type { IconProps } from "./types";

export type WarningIconProps = IconProps;

export const WarningIcon = forwardRef<SVGSVGElement, WarningIconProps>(
  ({ className, size, ...props }, forwardedRef) => {
    return (
      <svg
        viewBox="0 0 16 16"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Warning icon"
        aria-hidden="true"
        {...props}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.73206 4.20883H9.40537V5.26342H10.1647V6.42442H10.8248V7.57574H11.5073V8.74642H12.2261V9.75261H12.8631V10.7782H13.5V12.006H12.7357V12.5H3.08278V12.006H2.5V10.7782H3.13695V9.75261H3.7739V8.74642H4.49272V7.57574H5.17514V6.42442H5.83029V5.26342H6.45814V4.20883H7.13145V3.5H8.73206V4.20883ZM7.34898 11.1595H8.65102V9.89234H7.34898V11.1595ZM7.34898 8.97274H8.65102V6.49123H8.64603V5.86208H7.34898V8.97274Z"
          fill="currentColor"
        />
      </svg>
    );
  },
);

WarningIcon.displayName = "WarningIcon";
