import { forwardRef } from "react";
import { iconVariants } from ".";
import type { IconProps } from "./types";

export type SparklesIconProps = IconProps;

export const SparklesIcon = forwardRef<SVGSVGElement, SparklesIconProps>(
  ({ className, size, ...props }, forwardedRef) => {
    return (
      <svg
        viewBox="0 0 16 16"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Sparkles icon"
        aria-hidden="true"
        {...props}
      >
        <path
          d="M11.3274 8.84273V9.91981H11.8659V10.4583H12.4044V10.9968H13.2122V11.5354H12.4044V12.0739H11.8659V12.6124H11.3274V13.6894H10.7878V12.6124H10.2493V12.0739H9.71077V11.5354H8.903V10.9968H9.71077V10.4583H10.2493V9.91981H10.7878V8.84273H11.3274Z"
          fill="currentColor"
        />
        <path
          d="M6.55664 3.38946V5.06392H7.39384V5.90112H8.23104V6.73832H9.48684V7.57552H8.23104V8.41272H7.39384V9.24992H6.55664V10.9243H5.7178V9.24992H4.8806V8.41272H4.0434V7.57552H2.7876V6.73832H4.0434V5.90112H4.8806V5.06392H5.7178V3.38946H6.55664Z"
          fill="currentColor"
        />
        <path
          d="M11.6609 3.27628H12.1777V3.77292H12.9508V4.26956H12.1777V4.7662H11.6609V5.73193H11.1441V4.7662H10.6273V4.26956H9.85417V3.77292H10.6273V3.27628H11.1441V2.31055H11.6609V3.27628Z"
          fill="currentColor"
        />
      </svg>
    );
  },
);

SparklesIcon.displayName = "SparklesIcon";
