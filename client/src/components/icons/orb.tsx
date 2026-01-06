import { forwardRef } from "react";
import { iconVariants } from ".";
import type { IconProps } from "./types";

export type OrbIconProps = IconProps;

export const OrbIcon = forwardRef<SVGSVGElement, OrbIconProps>(
  ({ className, size, ...props }, forwardedRef) => {
    return (
      <svg
        viewBox="0 0 16 16"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Orb icon"
        aria-hidden="true"
        {...props}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9.50039 3.5V4.24222H10.6839V4.78721H11.3141V5.4104H11.8674V6.57741H12.5V9.53929H11.8674V10.7063H11.3141V11.333H10.6839V11.878H9.50039V12.5H6.50079V11.878L5.31726 11.8791V11.333H4.68353V10.7075H4.05334V9.53929H3.5V6.57741H4.05334V5.4104L4.68353 5.40923V4.78721L5.31726 4.78838V4.24222H6.50079V3.5H9.50039ZM5.31726 5.4104V5.95539H4.76393V7.12357H5.31726V7.74909H6.50079V7.12357H7.14753L7.13098 5.95656H6.50079V5.4104H5.31726Z"
          fill="currentColor"
        />
      </svg>
    );
  },
);

OrbIcon.displayName = "OrbIcon";
