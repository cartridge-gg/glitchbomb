import { forwardRef } from "react";
import { iconVariants } from ".";
import type { IconProps } from "./types";

export type HeartIconProps = IconProps;

export const HeartIcon = forwardRef<SVGSVGElement, HeartIconProps>(
  ({ className, size, ...props }, forwardedRef) => {
    return (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Heart icon"
        aria-hidden="true"
        {...props}
      >
        <path
          d="M7.49914 9.13637V12.4084H8.31799V13.2273H9.1355V14.0448H9.95435V14.8636H10.7732V15.6812H11.5901V16.5H12.4096V15.6812H13.2264V14.8636H14.0453V14.0448H14.8628V13.2273H15.6816V12.4084H16.5005V9.13637H15.6816V8.31752H14.8628V7.5H13.2264V8.31752H12.4096V9.13637H11.5901V8.31752H10.7732V7.5H9.13552V8.31752H8.318V9.13637H7.49914Z"
          fill="currentColor"
        />
      </svg>
    );
  },
);

HeartIcon.displayName = "HeartIcon";
