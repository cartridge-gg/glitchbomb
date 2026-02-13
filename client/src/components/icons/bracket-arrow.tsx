import { forwardRef } from "react";
import { iconVariants } from ".";
import type { IconProps } from "./types";

export interface BracketArrowIconProps extends IconProps {
  direction?: "left" | "right";
}

export const BracketArrowIcon = forwardRef<
  SVGSVGElement,
  BracketArrowIconProps
>(({ className, size, direction = "right", ...props }, forwardedRef) => {
  return (
    <svg
      viewBox="0 0 14 14"
      className={iconVariants({ size, className })}
      ref={forwardedRef}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`Bracket arrow ${direction} icon`}
      aria-hidden="true"
      style={direction === "left" ? { transform: "scaleX(-1)" } : undefined}
      {...props}
    >
      <path
        d="M7.77725 12.4442H9.33257V10.8889H7.77725V12.4442Z"
        fill="currentColor"
      />
      <path
        d="M1.55543 10.8885L1.55543 3.11118H6.22214L6.22214 1.55587L4.75966e-07 1.55587L0 12.4447H6.22214V10.8894L1.55543 10.8885Z"
        fill="currentColor"
      />
      <path
        d="M7.77725 12.4442L6.22147 12.4439V14H7.77757L7.77725 12.4442Z"
        fill="currentColor"
      />
      <path
        d="M13.9993 7.77827V6.22217L12.4432 6.22217V7.77827H13.9993Z"
        fill="currentColor"
      />
      <path
        d="M9.33257 10.8889L10.888 10.8888V9.33347H9.33269L9.33257 10.8889Z"
        fill="currentColor"
      />
      <path
        d="M7.77757 6.80193e-08L6.22147 0V1.5561H7.77757V6.80193e-08Z"
        fill="currentColor"
      />
      <path
        d="M9.33257 3.11162V1.55631L7.77757 1.5561L7.77725 3.11162H9.33257Z"
        fill="currentColor"
      />
      <path
        d="M10.888 4.66661V3.1113L9.33257 3.11162L9.33269 4.66661H10.888Z"
        fill="currentColor"
      />
      <path
        d="M10.888 9.33347L12.443 9.33335L12.4432 7.77827L10.8877 7.77804L10.888 9.33347Z"
        fill="currentColor"
      />
      <path
        d="M12.4432 6.22217L12.4434 4.66674L10.888 4.66661L10.8881 6.22205L12.4432 6.22217Z"
        fill="currentColor"
      />
    </svg>
  );
});

BracketArrowIcon.displayName = "BracketArrowIcon";
