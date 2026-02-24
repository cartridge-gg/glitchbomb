import { forwardRef } from "react";
import { iconVariants } from ".";
import type { IconProps } from "./types";

export type CrossIconProps = IconProps;

export const CrossIcon = forwardRef<SVGSVGElement, CrossIconProps>(
  ({ className, size, ...props }, forwardedRef) => {
    return (
      <svg
        viewBox="0 0 16 16"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Cross icon"
        aria-hidden="true"
        {...props}
      >
        <path
          d="M5.49881 4.8666H6.4271V5.77801H7.35644V6.82284H8.64356V5.77801H9.57184V4.8666H10.5012V4H12V5.51121H11.0707V6.3778H10.1424V7.28922H9.21302V7.68943L9.21408 8.59979H10.1424V9.57737H11.0717V10.4888H12V12H10.5012V11.0886H9.5729V10.111H8.64461V9.19957H7.35538V10.111H6.4271V11.0886H5.49881V12H4V10.4888H4.92829V9.57737H5.85658V8.59979H6.78592V7.68943L6.78698 7.28922H5.85763V6.3778H4.92935V5.51121H4V4H5.49881V4.8666Z"
          fill="currentColor"
        />
      </svg>
    );
  },
);

CrossIcon.displayName = "CrossIcon";
