import { forwardRef } from "react";
import { iconVariants } from ".";
import type { IconProps } from "./types";

export type BagIconProps = IconProps;

export const BagIcon = forwardRef<SVGSVGElement, BagIconProps>(
  ({ className, size, ...props }, forwardedRef) => {
    return (
      <svg
        viewBox="0 0 16 16"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Bag icon"
        aria-hidden="true"
        {...props}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.89355 2.70508H5.41504V3.41113H4.67773V4.11719H5.41699V4.82227H6.15234V5.52832H5.41699L5.41699 6.23438H5.36328V6.23535H4.67773V6.94141H3.93945V8.35254H3.2002L3.2002 12.5879H3.93945V13.293H4.59668V13.2939H4.67578V14L11.3232 14V13.2939H11.4033V13.293H12.0625V12.5879H12.7998L12.7998 8.35254H12.0625V6.94141H11.3232V6.23535H10.6357V6.23438H10.585V5.52832H9.85059V4.82227H10.585V4.11719H11.3232V3.41113H10.6104V3.41016H10.585V2.70508L9.1084 2.70508V2L6.89355 2V2.70508ZM8.36621 6.32617V8.46387H7.63184V6.32617H8.36621ZM9.91113 6.32617V7.51367H9.17578V6.32617H9.91113ZM6.82324 6.32617V7.51367H6.08887V6.32617H6.82324Z"
          fill="currentColor"
        />
      </svg>
    );
  },
);

BagIcon.displayName = "BagIcon";
