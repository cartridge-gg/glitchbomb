import { forwardRef, memo } from "react";
import { type IconProps, iconVariants } from "..";

export const ChartIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path d="M4 4.5V19.5H20V17.5H6V4.5H4Z" fill="currentColor" />
        <path d="M18 6.5H19V8.5H18V6.5Z" fill="currentColor" />
        <path d="M17 10.5V8.5H18V10.5H17Z" fill="currentColor" />
        <path d="M16 11.5V10.5H17V11.5H16Z" fill="currentColor" />
        <path d="M14 11.5H16V12.5H14V11.5Z" fill="currentColor" />
        <path d="M13 10.5H14V11.5H13V10.5Z" fill="currentColor" />
        <path d="M11 10.5V9.5H13V10.5H11Z" fill="currentColor" />
        <path d="M10 11.5V10.5H11V11.5H10Z" fill="currentColor" />
        <path d="M9 13.5V11.5H10V13.5H9Z" fill="currentColor" />
        <path d="M9 13.5V15.5H8V13.5H9Z" fill="currentColor" />
        <path d="M19 6.5H20V5.5H19V6.5Z" fill="currentColor" />
      </svg>
    ),
  ),
);

ChartIcon.displayName = "ChartIcon";
