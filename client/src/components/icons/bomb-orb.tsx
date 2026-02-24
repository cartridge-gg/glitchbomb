import { forwardRef } from "react";
import { iconVariants } from ".";
import type { IconProps } from "./types";

export type BombOrbIconProps = IconProps;

export const BombOrbIcon = forwardRef<SVGSVGElement, BombOrbIconProps>(
  ({ className, size, ...props }, forwardedRef) => {
    return (
      <svg
        viewBox="0 0 16 16"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Bomb Orb icon"
        aria-hidden="true"
        {...props}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9.58936 5.71387V6.66699H10.6245V7.76074H11.6606V8.23926H12.2124V8.78516H12.6968V9.80859H13.2505V12.4043H12.6968V13.4277H12.2124V13.9766H11.6606V14.4551H10.6245V15H7.99854V14.4551H6.9624V13.9766H6.40771V13.4287H5.85596V12.4043H5.37256V9.80859H5.85596V8.78516L6.40771 8.78418V8.23926H6.9624V7.76074H7.99854V6.66699H9.03467V5.71387H9.58936ZM6.9624 8.78516V9.2627H6.479V10.2861H6.9624V10.835H7.99854V10.2861L8.56494 10.2871L8.55029 9.26367H7.99854V8.78516H6.9624Z"
          fill="currentColor"
        />
        <path
          d="M5.36963 5.71387H4.81885V4.68652H5.36963V5.71387Z"
          fill="currentColor"
        />
        <path
          d="M9.03662 5.71094H8.55322V5.16504H9.03662V5.71094Z"
          fill="currentColor"
        />
        <path
          d="M4.33936 4.68945H3.7876V5.16504H3.30322V4.68652H3.7876V4.07422H4.33936V4.68945Z"
          fill="currentColor"
        />
        <path
          d="M8.55029 5.16504H7.99951V4.07422H8.55029V5.16504Z"
          fill="currentColor"
        />
        <path
          d="M6.40674 4.68945H5.85498V4.07422H6.40674V4.68945Z"
          fill="currentColor"
        />
        <path
          d="M7.99951 4.07422H6.40869V3.66309H7.99854L7.99951 4.07422Z"
          fill="currentColor"
        />
        <path
          d="M5.85596 4.07129H5.37256V3.66309H5.85596V4.07129Z"
          fill="currentColor"
        />
        <path
          d="M3.78564 3.66309H2.74951V3.04785H3.78564V3.66309Z"
          fill="currentColor"
        />
        <path
          d="M5.36963 3.66309H4.81885V3.04785H5.36963V3.66309Z"
          fill="currentColor"
        />
        <path
          d="M4.33936 2.56934H3.7876V2.02344H4.33936V2.56934Z"
          fill="currentColor"
        />
        <path
          d="M3.7876 2.02344H3.30322V1.54492H3.7876V2.02344Z"
          fill="currentColor"
        />
        <path
          d="M5.36963 2.02344H4.81885V1H5.36963V2.02344Z"
          fill="currentColor"
        />
      </svg>
    );
  },
);

BombOrbIcon.displayName = "BombOrbIcon";
