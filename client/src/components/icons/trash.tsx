import { forwardRef } from "react";
import { iconVariants } from ".";
import type { IconProps } from "./types";

export type TrashIconProps = IconProps;

export const TrashIcon = forwardRef<SVGSVGElement, TrashIconProps>(
  ({ className, size, ...props }, forwardedRef) => {
    return (
      <svg
        viewBox="0 0 16 16"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Trash icon"
        aria-hidden="true"
        {...props}
      >
        <path
          d="M11.0558 13.5H4.94437V12.2776H11.0558V13.5Z"
          fill="currentColor"
        />
        <path
          d="M8.61101 3.71233H13.5006V4.9347H12.2782C12.2787 7.57237 12.2773 9.6414 12.2777 12.2791L11.0558 12.2776C11.0553 9.82907 11.0558 7.38184 11.0558 4.93425H4.94437C4.94437 7.38233 4.9439 9.82956 4.94437 12.2776L3.72103 12.2791C3.7215 10.3992 3.72192 6.81742 3.72192 4.9347H2.49902V3.71233H7.38865V2.5H8.61101V3.71233Z"
          fill="currentColor"
        />
        <path
          d="M7.3891 11.0467H6.16575V6.16717H7.3891V11.0467Z"
          fill="currentColor"
        />
        <path
          d="M9.83337 11.0467H8.61003V6.16717H9.83337V11.0467Z"
          fill="currentColor"
        />
      </svg>
    );
  },
);

TrashIcon.displayName = "TrashIcon";
