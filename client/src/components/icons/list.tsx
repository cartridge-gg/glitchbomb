import { forwardRef } from "react";
import { iconVariants } from ".";
import type { IconProps } from "./types";

export type ListIconProps = IconProps;

export const ListIcon = forwardRef<SVGSVGElement, ListIconProps>(
  ({ className, size, ...props }, forwardedRef) => {
    return (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="List icon"
        aria-hidden="true"
        {...props}
      >
        <path
          d="M7.49951 7.07153V8.35717H16.5003V7.07153H7.49951Z"
          fill="currentColor"
        />
        <path
          d="M7.49951 11.3572V12.6428H16.5003V11.3572H7.49951Z"
          fill="currentColor"
        />
        <path
          d="M7.49951 15.6428V16.9284H16.5003V15.6428H7.49951Z"
          fill="currentColor"
        />
      </svg>
    );
  },
);

ListIcon.displayName = "ListIcon";
