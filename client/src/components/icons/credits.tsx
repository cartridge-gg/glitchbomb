import { forwardRef } from "react";
import { iconVariants } from ".";
import type { IconProps } from "./types";

export type CreditsIconProps = IconProps;

export const CreditsIcon = forwardRef<SVGSVGElement, CreditsIconProps>(
  ({ className, size, ...props }, forwardedRef) => {
    return (
      <svg
        viewBox="0 0 14 15"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Credits icon"
        aria-hidden="true"
        {...props}
      >
        <path
          d="M10.6747 8.16523V9.51158H11.3479V10.1847H12.021V10.8579H13.0308V11.531H12.021V12.2042H11.3479V12.8773H10.6747V14.2236H10.0003V12.8773H9.32712V12.2042H8.65397V11.531H7.64425V10.8579H8.65397V10.1847H9.32712V9.51158H10.0003V8.16523H10.6747Z"
          fill="currentColor"
        />
        <path
          d="M4.7113 1.34864V3.44171H5.7578V4.48821H6.8043V5.53471H8.37405V6.58121H6.8043V7.62771H5.7578V8.67421H4.7113V10.7672H3.66275V8.67421H2.61625V7.62771H1.56975V6.58121H0V5.53471H1.56975V4.48821H2.61625V3.44171H3.66275V1.34864H4.7113Z"
          fill="currentColor"
        />
        <path
          d="M11.0916 1.20717H11.7376V1.82797H12.7041V2.44877H11.7376V3.06956H11.0916V4.27673H10.4457V3.06956H9.79966V2.44877H8.83321V1.82797H9.79966V1.20717H10.4457V0H11.0916V1.20717Z"
          fill="currentColor"
        />
      </svg>
    );
  },
);

CreditsIcon.displayName = "CreditsIcon";
