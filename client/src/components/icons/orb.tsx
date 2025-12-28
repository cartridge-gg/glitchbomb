import { forwardRef } from "react";
import { iconVariants } from ".";
import type { IconProps } from "./types";

export type OrbIconProps = IconProps;

export const OrbIcon = forwardRef<SVGSVGElement, OrbIconProps>(
  ({ className, size, ...props }, forwardedRef) => {
    return (
      <svg
        viewBox="0 0 24 24"
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
          d="M13.5004 7.5V8.24222H14.6839V8.78721H15.3141V9.4104H15.8674V10.5774H16.5V13.5393H15.8674V14.7063H15.3141V15.333H14.6839V15.878H13.5004V16.5H10.5008V15.878L9.31726 15.8791V15.333H8.68353V14.7075H8.05334V13.5393H7.5V10.5774H8.05334V9.4104L8.68353 9.40923V8.78721L9.31726 8.78838V8.24222H10.5008V7.5H13.5004ZM9.31726 9.4104V9.95539H8.76393V11.1236H9.31726V11.7491H10.5008V11.1236H11.1475L11.131 9.95656H10.5008V9.4104H9.31726Z"
          fill="currentColor"
        />
      </svg>
    );
  },
);

OrbIcon.displayName = "OrbIcon";
