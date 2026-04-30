import { forwardRef, memo } from "react";
import { type IconProps, iconVariants } from "..";

export const SlotIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.2857 8V9.14286H9.14286V10.2857H8V13.7143H9.14286V14.8571H10.2857V16H13.7143V14.8571H14.8571V13.7143H16V10.2857H14.8571V9.14286H13.7143V8H10.2857ZM13.7143 9.14286V10.2857H14.8571V13.7143H13.7143V14.8571H10.2857V13.7143H9.14286V10.2857H10.2857V9.14286H13.7143Z"
          fill="currentColor"
        />
      </svg>
    ),
  ),
);

SlotIcon.displayName = "SlotIcon";
