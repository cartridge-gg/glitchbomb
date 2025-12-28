import { forwardRef } from "react";
import { iconVariants } from ".";
import type { IconProps } from "./types";

export type WarningIconProps = IconProps;

export const WarningIcon = forwardRef<SVGSVGElement, WarningIconProps>(
  ({ className, size, ...props }, forwardedRef) => {
    return (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Warning icon"
        aria-hidden="true"
        {...props}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12.7321 8.20883H13.4054V9.26342H14.1647V10.4244H14.8248V11.5757H15.5073V12.7464H16.2261V13.7526H16.8631V14.7782H17.5V16.006H16.7357V16.5H7.08278V16.006H6.5V14.7782H7.13695V13.7526H7.7739V12.7464H8.49272V11.5757H9.17514V10.4244H9.83029V9.26342H10.4581V8.20883H11.1314V7.5H12.7321V8.20883ZM11.349 15.1595H12.651V13.8923H11.349V15.1595ZM11.349 12.9727H12.651V10.4912H12.646V9.86208H11.349V12.9727Z"
          fill="currentColor"
        />
      </svg>
    );
  },
);

WarningIcon.displayName = "WarningIcon";
