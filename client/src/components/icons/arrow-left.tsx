import { forwardRef } from "react";
import { iconVariants } from ".";
import type { IconProps } from "./types";

export type ArrowLeftIconProps = IconProps;

export const ArrowLeftIcon = forwardRef<SVGSVGElement, ArrowLeftIconProps>(
  ({ className, size, ...props }, forwardedRef) => {
    return (
      <svg
        viewBox="0 0 16 16"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Arrow left icon"
        aria-hidden="true"
        {...props}
      >
        <path
          d="M5.22168 7.44434H6.33301V6.33301H5.22168V7.44434Z"
          fill="currentColor"
        />
        <path
          d="M5.22168 8.55566H6.33301V9.66699H5.22168V8.55566Z"
          fill="currentColor"
        />
        <path
          d="M5.22168 7.44434V8.55566H3V7.44434H5.22168Z"
          fill="currentColor"
        />
        <path
          d="M6.33301 6.33301V5.22168H7.44434V6.33301H6.33301Z"
          fill="currentColor"
        />
        <path
          d="M6.33301 9.66699V10.7783H7.44434V9.66699H6.33301Z"
          fill="currentColor"
        />
        <path
          d="M7.44434 5.22168V4.11035H8.55566V5.22168H7.44434Z"
          fill="currentColor"
        />
        <path
          d="M7.44434 10.7783V11.8896H8.55566V10.7783H7.44434Z"
          fill="currentColor"
        />
        <path
          d="M8.55566 4.11035V3H9.66699V4.11035H8.55566Z"
          fill="currentColor"
        />
        <path
          d="M8.55566 11.8896V13H9.66699V11.8896H8.55566Z"
          fill="currentColor"
        />
        <path d="M13 7.44434V8.55566H5.22168V7.44434H13Z" fill="currentColor" />
      </svg>
    );
  },
);

ArrowLeftIcon.displayName = "ArrowLeftIcon";
