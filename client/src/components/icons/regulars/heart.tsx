import { forwardRef, memo } from "react";
import { type IconProps, iconVariants } from "..";

export const HeartIcon = memo(
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
        aria-label="Heart icon"
        aria-hidden="true"
        {...props}
      >
        <path
          d="M6.66556 6.33325H10.6706V7.66592H13.3294V6.33325H17.3344V7.66592H18.6672V8.99859H20V13.0033H18.6672V14.3359H17.3344V15.6686H16.0017V17.0013H14.6689V18.3339H13.3361V19.6666H10.6639V18.3339H9.33111V17.0013H7.99833V15.6686H6.66556V14.3359H5.33278V13.0033H4V8.99859H5.33278V7.66592H6.66556V6.33325Z"
          fill="currentColor"
        />
      </svg>
    ),
  ),
);

HeartIcon.displayName = "HeartIcon";
