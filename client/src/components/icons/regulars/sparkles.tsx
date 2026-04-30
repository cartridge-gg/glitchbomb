import { forwardRef } from "react";
import { iconVariants } from "..";
import type { IconProps } from "../types";

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
          d="M16.9913 13.2641V14.8797H17.7991V15.6875H18.6069V16.4953H19.8185V17.3031H18.6069V18.1108H17.7991V18.9186H16.9913V20.5342H16.182V18.9186H15.3742V18.1108H14.5664V17.3031H13.3547V16.4953H14.5664V15.6875H15.3742V14.8797H16.182V13.2641H16.9913Z"
          fill="currentColor"
        />
        <path
          d="M9.8352 5.08418V7.59587H11.091V8.85167H12.3468V10.1075H14.2305V11.3633H12.3468V12.6191H11.091V13.8749H9.8352V16.3865H8.57694V13.8749H7.32114V12.6191H6.06534V11.3633H4.18164V10.1075H6.06534V8.85167H7.32114V7.59587H8.57694V5.08418H9.8352Z"
          fill="currentColor"
        />
        <path
          d="M17.4916 4.91442H18.2668V5.65938H19.4265V6.40434H18.2668V7.1493H17.4916V8.5979H16.7164V7.1493H15.9412V6.40434H14.7815V5.65938H15.9412V4.91442H16.7164V3.46582H17.4916V4.91442Z"
          fill="currentColor"
        />
      </svg>
    );
  },
);

SparklesIcon.displayName = "SparklesIcon";
