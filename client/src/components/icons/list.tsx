import { forwardRef } from "react";
import { iconVariants } from ".";
import type { IconProps } from "./types";

export type ListIconProps = IconProps;

export const ListIcon = forwardRef<SVGSVGElement, ListIconProps>(
  ({ className, size, ...props }, forwardedRef) => {
    return (
      <svg
        viewBox="0 0 16 16"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="List icon"
        aria-hidden="true"
        {...props}
      >
        <path
          d="M3.49951 3.07153V4.35717H12.5003V3.07153H3.49951Z"
          fill="currentColor"
        />
        <path
          d="M3.49951 7.35717V8.6428H12.5003V7.35717H3.49951Z"
          fill="currentColor"
        />
        <path
          d="M3.49951 11.6428V12.9284H12.5003V11.6428H3.49951Z"
          fill="currentColor"
        />
      </svg>
    );
  },
);

ListIcon.displayName = "ListIcon";
