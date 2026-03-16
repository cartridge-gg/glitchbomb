import { forwardRef } from "react";
import { iconVariants } from ".";
import type { IconProps } from "./types";

export type BoltIconProps = IconProps;

export const BoltIcon = forwardRef<SVGSVGElement, BoltIconProps>(
  ({ className, size, ...props }, forwardedRef) => {
    return (
      <svg
        viewBox="0 0 60 86"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Bolt icon"
        aria-hidden="true"
        {...props}
      >
        <path
          d="M55.4667 12.8H51.2V21.3333H46.9333V29.8667H42.6667V34.1333H59.7333V38.4H55.4667V42.6667H51.2V46.9333H46.9333V51.2H42.6667V55.4667H38.4V59.7333H34.1333V64H29.8667V68.2667H25.6V72.5333H21.3333V76.8H17.0667V81.0667H12.8V85.3333H8.53333V76.8H12.8V68.2667H17.0667V59.7333H21.3333V55.4667H0V51.2H4.26667V38.4H8.53333V25.6H12.8V12.8H17.0667V0H55.4667V12.8Z"
          fill="currentColor"
        />
      </svg>
    );
  },
);

BoltIcon.displayName = "BoltIcon";
