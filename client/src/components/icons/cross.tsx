import { forwardRef } from "react";
import { iconVariants } from ".";
import type { IconProps } from "./types";

export type CrossIconProps = IconProps;

export const CrossIcon = forwardRef<SVGSVGElement, CrossIconProps>(
  ({ className, size, ...props }, forwardedRef) => {
    return (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Cross icon"
        aria-hidden="true"
        {...props}
      >
        <path
          d="M9.49881 8.8666H10.4271V9.77801H11.3564V10.8228H12.6436V9.77801H13.5718V8.8666H14.5012V8H16V9.51121H15.0707V10.3778H14.1424V11.2892H13.213V11.6894L13.2141 12.5998H14.1424V13.5774H15.0717V14.4888H16V16H14.5012V15.0886H13.5729V14.111H12.6446V13.1996H11.3554V14.111H10.4271V15.0886H9.49881V16H8V14.4888H8.92829V13.5774H9.85658V12.5998H10.7859V11.6894L10.787 11.2892H9.85763V10.3778H8.92935V9.51121H8V8H9.49881V8.8666Z"
          fill="currentColor"
        />
      </svg>
    );
  },
);

CrossIcon.displayName = "CrossIcon";
