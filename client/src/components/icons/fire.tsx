import { forwardRef, useId } from "react";
import { iconVariants } from ".";
import type { IconProps } from "./types";

export type FireIconProps = IconProps;

export const FireIcon = forwardRef<SVGSVGElement, FireIconProps>(
  ({ className, size, ...props }, forwardedRef) => {
    const gradientId = useId();
    const paint0Id = `${gradientId}-paint0`;
    const paint1Id = `${gradientId}-paint1`;

    return (
      <svg
        viewBox="0 0 17 20"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Fire icon"
        aria-hidden="true"
        {...props}
      >
        <path
          d="M10.0125 0H8.75V1.24922H7.5V3.74766H6.25V6.24609H5V9.99375H3.76249V6.24609H2.5V7.49531H1.25V9.99375H0V15.0031H1.25V17.5016H2.5V18.7508H3.75V20H7.51249V18.7383H6.26249V17.4891H5.01249V16.2398H3.76249V12.5047H6.25V13.7539H7.51249V11.2555H8.76249V8.75703H10V10.0063H11.25V11.2555H12.5V16.2398H11.25V20H12.5125V18.7508H13.7625V17.5016H15.0125V15.0031H16.2625V11.243H15.0125V9.99375H13.7625V7.49531H12.5125V6.24609H11.2625V3.74766H10.0125V0Z"
          fill={`url(#${paint0Id})`}
        />
        <path
          d="M3.75 3.74766H5.01249V5.00938H3.75V3.74766Z"
          fill={`url(#${paint1Id})`}
        />
        <defs>
          <linearGradient
            id={paint0Id}
            x1="8.13125"
            y1="20"
            x2="8.13125"
            y2="0.895566"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#D10D07" />
            <stop offset="1" stopColor="#F89149" />
          </linearGradient>
          <linearGradient
            id={paint1Id}
            x1="8.13125"
            y1="20"
            x2="8.13125"
            y2="0.895566"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#D10D07" />
            <stop offset="1" stopColor="#F89149" />
          </linearGradient>
        </defs>
      </svg>
    );
  },
);

FireIcon.displayName = "FireIcon";
