import { forwardRef } from "react";
import { iconVariants } from ".";
import type { IconProps } from "./types";

export type EyeIconProps = IconProps;

export const EyeIcon = forwardRef<SVGSVGElement, EyeIconProps>(
  ({ className, size, ...props }, forwardedRef) => {
    return (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Eye icon"
        aria-hidden="true"
        {...props}
      >
        <path
          d="M12 5C7 5 2.73 8.11 1 12.5 2.73 16.89 7 20 12 20s9.27-3.11 11-7.5C21.27 8.11 17 5 12 5Zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5Zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3Z"
          fill="currentColor"
        />
      </svg>
    );
  },
);

EyeIcon.displayName = "EyeIcon";
