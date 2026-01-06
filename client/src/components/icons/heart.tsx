import { forwardRef } from "react";
import { iconVariants } from ".";
import type { IconProps } from "./types";

export type HeartIconProps = IconProps;

export const HeartIcon = forwardRef<SVGSVGElement, HeartIconProps>(
  ({ className, size, ...props }, forwardedRef) => {
    return (
      <svg
        viewBox="0 0 16 16"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Heart icon"
        aria-hidden="true"
        {...props}
      >
        <path
          d="M3.49914 5.13637V8.40842H4.31799V9.22727H5.1355V10.0448H5.95435V10.8636H6.7732V11.6812H7.59006V12.5H8.40957V11.6812H9.22642V10.8636H10.0453V10.0448H10.8628V9.22727H11.6816V8.40842H12.5005V5.13637H11.6816V4.31752H10.8628V3.5H9.22642V4.31752H8.40957V5.13637H7.59006V4.31752H6.7732V3.5H5.13552V4.31752H4.318V5.13637H3.49914Z"
          fill="currentColor"
        />
      </svg>
    );
  },
);

HeartIcon.displayName = "HeartIcon";
