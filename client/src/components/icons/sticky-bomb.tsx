import { forwardRef } from "react";
import { iconVariants } from ".";
import type { IconProps } from "./types";

export type StickyBombIconProps = IconProps;

export const StickyBombIcon = forwardRef<SVGSVGElement, StickyBombIconProps>(
  ({ className, size, ...props }, forwardedRef) => {
    return (
      <svg
        viewBox="0 0 24 33"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Sticky bomb icon"
        aria-hidden="true"
        {...props}
      >
        <path d="M19 32.3982H17.2V30.5982H19V32.3982Z" fill="currentColor" />
        <path
          d="M10 28.7982H11.8V25.1982H15.4V26.9982H13.6V30.5982H8.2V25.1982H10V28.7982Z"
          fill="currentColor"
        />
        <path d="M19 28.7982H17.2V25.1982H19V28.7982Z" fill="currentColor" />
        <path d="M6.4 26.9982H4.6V25.1982H6.4V26.9982Z" fill="currentColor" />
        <path
          d="M12.4346 6.77285H14.8006V9.1916H17.1684V10.2498H18.427V11.4557H19.5326V13.7197H20.8V17.9982H19V21.5982H15.4V23.3982H13.6V21.5982H11.8V23.3982H10V21.5982H4.6V25.1982H2.8V21.5982H4.6V17.9982H2.8V13.7197H3.90566V11.4557H5.16602V10.2498H6.43516V9.1916H8.80117V6.77285H11.1672V4.66523H12.4346V6.77285Z"
          fill="currentColor"
        />
        <path d="M8.2 25.1982H6.4V23.3982H8.2V25.1982Z" fill="currentColor" />
        <path
          d="M17.2 25.1982H15.4V23.3982H17.2V25.1982Z"
          fill="currentColor"
        />
        <path d="M20.8 25.1982H19V23.3982H20.8V25.1982Z" fill="currentColor" />
        <path
          d="M22.6 23.3982H20.8V17.9982H22.6V23.3982Z"
          fill="currentColor"
        />
        <path d="M2.8 21.5982H1V17.9982H2.8V21.5982Z" fill="currentColor" />
        <path
          d="M8.72734 5.73574H6.35254V4.52988H8.72734V5.73574Z"
          fill="currentColor"
        />
        <path
          d="M17.2475 5.73574H14.8814V4.52988H17.2475V5.73574Z"
          fill="currentColor"
        />
        <path
          d="M8.72734 2.26582H10.1371V3.47168H8.71504V2.26582H7.61992V1.20762H8.72734V2.26582Z"
          fill="currentColor"
        />
        <path
          d="M14.8814 3.47168H13.6211V2.26582H14.8814V3.47168Z"
          fill="currentColor"
        />
        <path
          d="M12.5154 0.00175781V2.26582H11.0934V0L12.5154 0.00175781Z"
          fill="currentColor"
        />
        <path
          d="M15.9906 2.26582H14.8814L14.8832 1.20762H15.9906V2.26582Z"
          fill="currentColor"
        />
      </svg>
    );
  },
);

StickyBombIcon.displayName = "StickyBombIcon";
