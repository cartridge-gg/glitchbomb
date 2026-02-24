import { forwardRef } from "react";
import { iconVariants } from ".";
import type { IconProps } from "./types";

export type TickIconProps = IconProps;

export const TickIcon = forwardRef<SVGSVGElement, TickIconProps>(
  ({ className, size, ...props }, forwardedRef) => {
    return (
      <svg
        viewBox="0 0 16 16"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Tick icon"
        aria-hidden="true"
        {...props}
      >
        <path
          d="M3.3584 8.92853H5.21555V10.7856H3.3584V8.92853Z"
          fill="currentColor"
        />
        <path
          d="M1.50049 7.07147H3.35764V8.92851H1.50049V7.07147Z"
          fill="currentColor"
        />
        <path
          d="M10.7866 5.21445H12.6438V7.07149H10.7866V5.21445Z"
          fill="currentColor"
        />
        <path
          d="M8.92871 7.07147H10.7859V8.92851H8.92871V7.07147Z"
          fill="currentColor"
        />
        <path
          d="M7.07227 8.92853H8.92942V10.7856H7.07227V8.92853Z"
          fill="currentColor"
        />
        <path
          d="M5.21436 10.7856H7.07151V12.6426H5.21436V10.7856Z"
          fill="currentColor"
        />
        <path
          d="M12.6426 3.35739H14.4997V5.21443H12.6426V3.35739Z"
          fill="currentColor"
        />
      </svg>
    );
  },
);

TickIcon.displayName = "TickIcon";
