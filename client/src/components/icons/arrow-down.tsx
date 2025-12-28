import { forwardRef } from "react";
import { iconVariants } from ".";
import type { IconProps } from "./types";

export type ArrowDownIconProps = IconProps;

export const ArrowDownIcon = forwardRef<SVGSVGElement, ArrowDownIconProps>(
  ({ className, size, ...props }, forwardedRef) => {
    return (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Arrow down icon"
        aria-hidden="true"
        {...props}
      >
        <path
          d="M12.5557 14.7783H13.667V15.8896H12.5557V17H11.4453V15.8896H10.334V14.7783H11.4453V7H12.5557V14.7783Z"
          fill="currentColor"
        />
        <path
          d="M10.334 14.7783H9.22266V13.667H10.334V14.7783Z"
          fill="currentColor"
        />
        <path
          d="M14.7783 14.7783H13.667V13.667H14.7783V14.7783Z"
          fill="currentColor"
        />
        <path
          d="M9.22266 13.667H8.1123V12.5566H9.22266V13.667Z"
          fill="currentColor"
        />
        <path
          d="M15.8887 13.667H14.7783V12.5566H15.8887V13.667Z"
          fill="currentColor"
        />
        <path
          d="M8.1123 12.5566H7V11.4443H8.11133L8.1123 12.5566Z"
          fill="currentColor"
        />
        <path d="M17 12.5566H15.8887V11.4453H17V12.5566Z" fill="currentColor" />
      </svg>
    );
  },
);

ArrowDownIcon.displayName = "ArrowDownIcon";
