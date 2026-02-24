import { forwardRef } from "react";
import { iconVariants } from ".";
import type { IconProps } from "./types";

export type HomeIconProps = IconProps;

export const HomeIcon = forwardRef<SVGSVGElement, HomeIconProps>(
  ({ className, size, ...props }, forwardedRef) => {
    return (
      <svg
        viewBox="0 0 16 16"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Home icon"
        aria-hidden="true"
        {...props}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8 1L1 7V8H2V14H7V10H9V14H14V8H15V7L8 1ZM4 8V12H5V9H11V12H12V8L8 4L4 8Z"
          fill="currentColor"
        />
      </svg>
    );
  },
);

HomeIcon.displayName = "HomeIcon";
