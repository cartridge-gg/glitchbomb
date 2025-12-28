import { forwardRef } from "react";
import { iconVariants } from ".";
import type { IconProps } from "./types";

export type DotIconProps = IconProps;

export const DotIcon = forwardRef<SVGSVGElement, DotIconProps>(
  ({ className, size, ...props }, forwardedRef) => {
    return (
      <svg
        viewBox="0 0 35 35"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Dot icon"
        aria-hidden="true"
        {...props}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M20.0007 10V11.237H21.9732V12.1454H23.0235V13.184H23.9457V15.129H25V20.0655H23.9457V22.0105H23.0235V23.055H21.9732V23.9633H20.0007V25H15.0013V23.9633L13.0288 23.9652V23.055H11.9725V22.0124H10.9222V20.0655H10V15.129H10.9222V13.184L11.9725 13.1821V12.1454L13.0288 12.1473V11.237H15.0013V10H20.0007Z"
          fill="currentColor"
        />
      </svg>
    );
  },
);

DotIcon.displayName = "DotIcon";
