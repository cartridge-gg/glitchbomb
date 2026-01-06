import { forwardRef } from "react";
import { iconVariants } from ".";
import type { IconProps } from "./types";

export type GearIconProps = IconProps;

export const GearIcon = forwardRef<SVGSVGElement, GearIconProps>(
  ({ className, size, ...props }, forwardedRef) => {
    return (
      <svg
        viewBox="0 0 16 16"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Gear icon"
        aria-hidden="true"
        {...props}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M7.21477 12.7143H6.42829V11.9278H5.64258V12.7143H4.07192V11.9286H3.2862V10.3579H4.07192V9.57143H3.2862V8.78571L2.49972 8.78571V7.21505L3.2862 7.21505V6.42857H4.07192L4.07192 5.64286H3.2862V4.0722H4.07192V3.28571H5.64258V4.0722L6.42906 4.0722V3.28571H7.21477L7.21477 2.5H8.78544L8.78544 3.28802H9.57115V4.0745H10.3576V3.28802H11.9283V4.0745H12.714V5.64516H11.9283V6.43087H12.714V7.21736H13.5005V8.78802H12.714V9.57373H11.9283V10.3602H12.714L12.7132 11.9293H11.9275V12.7143H10.3561V11.9286H9.57038L9.57115 12.3222V12.7143H8.78467L8.78544 13.1071V13.5H7.21477V12.7143ZM8.78544 10.3594V9.57373H9.57115V8.78725H10.3569V7.21659L9.57115 7.21659V6.43087H8.78544V5.64439H7.21477V6.43087H6.42829V7.21659H5.64258V8.78725H6.42829V9.57373H7.21477L7.21477 10.3594H8.78544Z"
          fill="currentColor"
        />
      </svg>
    );
  },
);

GearIcon.displayName = "GearIcon";
