import { forwardRef } from "react";
import { iconVariants } from ".";
import type { IconProps } from "./types";

export type ArrowRightIconProps = IconProps;

export const ArrowRightIcon = forwardRef<SVGSVGElement, ArrowRightIconProps>(
  ({ className, size, ...props }, forwardedRef) => {
    return (
      <svg
        viewBox="0 0 16 16"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Arrow right icon"
        aria-hidden="true"
        {...props}
      >
        <path
          d="M10.7783 7.44434L10.7783 6.33301L11.8896 6.33301L11.8896 7.44434L13 7.44434L13 8.55469L11.8896 8.55469L11.8896 9.66602L10.7783 9.66602L10.7783 8.55469L3 8.55469L3 7.44434L10.7783 7.44434Z"
          fill="currentColor"
        />
        <path
          d="M10.7783 9.66602L10.7783 10.7773L9.66699 10.7773L9.66699 9.66602L10.7783 9.66602Z"
          fill="currentColor"
        />
        <path
          d="M10.7783 5.22168L10.7783 6.33301L9.66699 6.33301L9.66699 5.22168L10.7783 5.22168Z"
          fill="currentColor"
        />
        <path
          d="M9.66699 10.7773L9.66699 11.8877L8.55664 11.8877L8.55664 10.7773L9.66699 10.7773Z"
          fill="currentColor"
        />
        <path
          d="M9.66699 4.11133L9.66699 5.22168L8.55664 5.22168L8.55664 4.11133L9.66699 4.11133Z"
          fill="currentColor"
        />
        <path
          d="M8.55664 11.8877L8.55664 13L7.44434 13L7.44434 11.8887L8.55664 11.8877Z"
          fill="currentColor"
        />
        <path
          d="M8.55664 3L8.55664 4.11133L7.44531 4.11133L7.44531 3L8.55664 3Z"
          fill="currentColor"
        />
      </svg>
    );
  },
);

ArrowRightIcon.displayName = "ArrowRightIcon";
