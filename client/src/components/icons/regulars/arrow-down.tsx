import { forwardRef } from "react";
import { iconVariants } from "..";
import type { IconProps } from "../types";

export type ArrowDownIconProps = IconProps;

export const ArrowDownIcon = forwardRef<SVGSVGElement, ArrowDownIconProps>(
  ({ className, size, ...props }, forwardedRef) => {
    return (
      <svg
        viewBox="0 0 16 16"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Arrow down icon"
        aria-hidden="true"
        {...props}
      >
        <path
          d="M8.55566 10.7783H9.66699V11.8896H8.55566V13H7.44531V11.8896H6.33398V10.7783H7.44531V3H8.55566V10.7783Z"
          fill="currentColor"
        />
        <path
          d="M6.33398 10.7783H5.22266V9.66699H6.33398V10.7783Z"
          fill="currentColor"
        />
        <path
          d="M10.7783 10.7783H9.66699V9.66699H10.7783V10.7783Z"
          fill="currentColor"
        />
        <path
          d="M5.22266 9.66699H4.1123V8.55664H5.22266V9.66699Z"
          fill="currentColor"
        />
        <path
          d="M11.8887 9.66699H10.7783V8.55664H11.8887V9.66699Z"
          fill="currentColor"
        />
        <path
          d="M4.1123 8.55664H3V7.44434H4.11133L4.1123 8.55664Z"
          fill="currentColor"
        />
        <path d="M13 8.55664H11.8887V7.44531H13V8.55664Z" fill="currentColor" />
      </svg>
    );
  },
);

ArrowDownIcon.displayName = "ArrowDownIcon";
