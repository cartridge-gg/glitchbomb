import { forwardRef } from "react";
import { iconVariants } from ".";
import type { IconProps } from "./types";

export type BombOrbIconProps = IconProps;

export const BombOrbIcon = forwardRef<SVGSVGElement, BombOrbIconProps>(
  ({ className, size, ...props }, forwardedRef) => {
    return (
      <svg
        viewBox="0 0 24 24"
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
          d="M13.5894 9.71387V10.667H14.6245V11.7607H15.6606V12.2393H16.2124V12.7852H16.6968V13.8086H17.2505V16.4043H16.6968V17.4277H16.2124V17.9766H15.6606V18.4551H14.6245V19H11.9985V18.4551H10.9624V17.9766H10.4077V17.4287H9.85596V16.4043H9.37256V13.8086H9.85596V12.7852L10.4077 12.7842V12.2393H10.9624V11.7607H11.9985V10.667H13.0347V9.71387H13.5894ZM10.9624 12.7852V13.2627H10.479V14.2861H10.9624V14.835H11.9985V14.2861L12.5649 14.2871L12.5503 13.2637H11.9985V12.7852H10.9624Z"
          fill="currentColor"
        />
        <path
          d="M9.36963 9.71387H8.81885V8.68652H9.36963V9.71387Z"
          fill="currentColor"
        />
        <path
          d="M13.0366 9.71094H12.5532V9.16504H13.0366V9.71094Z"
          fill="currentColor"
        />
        <path
          d="M8.33936 8.68945H7.7876V9.16504H7.30322V8.68652H7.7876V8.07422H8.33936V8.68945Z"
          fill="currentColor"
        />
        <path
          d="M12.5503 9.16504H11.9995V8.07422H12.5503V9.16504Z"
          fill="currentColor"
        />
        <path
          d="M10.4067 8.68945H9.85498V8.07422H10.4067V8.68945Z"
          fill="currentColor"
        />
        <path
          d="M11.9995 8.07422H10.4087V7.66309H11.9985L11.9995 8.07422Z"
          fill="currentColor"
        />
        <path
          d="M9.85596 8.07129H9.37256V7.66309H9.85596V8.07129Z"
          fill="currentColor"
        />
        <path
          d="M7.78564 7.66309H6.74951V7.04785H7.78564V7.66309Z"
          fill="currentColor"
        />
        <path
          d="M9.36963 7.66309H8.81885V7.04785H9.36963V7.66309Z"
          fill="currentColor"
        />
        <path
          d="M8.33936 6.56934H7.7876V6.02344H8.33936V6.56934Z"
          fill="currentColor"
        />
        <path
          d="M7.7876 6.02344H7.30322V5.54492H7.7876V6.02344Z"
          fill="currentColor"
        />
        <path
          d="M9.36963 6.02344H8.81885V5H9.36963V6.02344Z"
          fill="currentColor"
        />
      </svg>
    );
  },
);

BombOrbIcon.displayName = "BombOrbIcon";
