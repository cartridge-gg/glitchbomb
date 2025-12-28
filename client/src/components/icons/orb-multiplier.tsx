import { forwardRef } from "react";
import { iconVariants } from ".";
import type { IconProps } from "./types";

export type OrbMultiplierIconProps = IconProps;

export const OrbMultiplierIcon = forwardRef<
  SVGSVGElement,
  OrbMultiplierIconProps
>(({ className, size, ...props }, forwardedRef) => {
  return (
    <svg
      viewBox="0 0 270 270"
      className={iconVariants({ size, className })}
      ref={forwardedRef}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Orb Multiplier icon"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M158.498 86.52C160.524 84.4933 163.81 84.4933 165.837 86.52L183.48 104.163C185.507 106.19 185.507 109.476 183.48 111.502L159.982 135L183.48 158.498C185.507 160.524 185.507 163.81 183.48 165.837L165.837 183.48C163.81 185.507 160.524 185.507 158.498 183.48L135 159.982L111.502 183.48C109.476 185.507 106.19 185.507 104.163 183.48L86.52 165.837C84.4933 163.81 84.4933 160.524 86.52 158.498L110.017 135L86.52 111.502C84.4933 109.476 84.4934 106.19 86.52 104.163L104.163 86.52C106.19 84.4934 109.476 84.4933 111.502 86.52L135 110.017L158.498 86.52Z"
        fill="currentColor"
      />
    </svg>
  );
});

OrbMultiplierIcon.displayName = "OrbMultiplierIcon";
