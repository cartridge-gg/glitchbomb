import { forwardRef } from "react";
import { iconVariants } from ".";
import type { IconProps } from "./types";

export type SparklesIconProps = IconProps;

export const SparklesIcon = forwardRef<SVGSVGElement, SparklesIconProps>(
  ({ className, size, ...props }, forwardedRef) => {
    return (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Sparkles icon"
        aria-hidden="true"
        {...props}
      >
        <path
          d="M15.3274 12.8427V13.9198H15.8659V14.4583H16.4044V14.9968H17.2122V15.5354H16.4044V16.0739H15.8659V16.6124H15.3274V17.6894H14.7878V16.6124H14.2493V16.0739H13.7108V15.5354H12.903V14.9968H13.7108V14.4583H14.2493V13.9198H14.7878V12.8427H15.3274Z"
          fill="currentColor"
        />
        <path
          d="M10.5566 7.38946V9.06392H11.3938V9.90112H12.231V10.7383H13.4868V11.5755H12.231V12.4127H11.3938V13.2499H10.5566V14.9243H9.7178V13.2499H8.8806V12.4127H8.0434V11.5755H6.7876V10.7383H8.0434V9.90112H8.8806V9.06392H9.7178V7.38946H10.5566Z"
          fill="currentColor"
        />
        <path
          d="M15.6609 7.27628H16.1777V7.77292H16.9508V8.26956H16.1777V8.7662H15.6609V9.73193H15.1441V8.7662H14.6273V8.26956H13.8542V7.77292H14.6273V7.27628H15.1441V6.31055H15.6609V7.27628Z"
          fill="currentColor"
        />
      </svg>
    );
  },
);

SparklesIcon.displayName = "SparklesIcon";
