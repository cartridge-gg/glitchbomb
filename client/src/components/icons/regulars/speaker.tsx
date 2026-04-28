import { forwardRef } from "react";
import { iconVariants } from "..";
import type { IconProps } from "../types";

export const SpeakerIcon = forwardRef<SVGSVGElement, IconProps>(
  ({ className, size, ...props }, forwardedRef) => {
    return (
      <svg
        viewBox="0 0 16 16"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Speaker icon"
        aria-hidden="true"
        {...props}
      >
        <path
          d="M8 2H7V3H6V4H5V5H2V6H1V10H2V11H5V12H6V13H7V14H8V2Z"
          fill="currentColor"
        />
        {/* Inner arc */}
        <path d="M11 5H10V6H11V5Z" fill="currentColor" />
        <path d="M12 6H11V10H12V6Z" fill="currentColor" />
        <path d="M11 10H10V11H11V10Z" fill="currentColor" />
        {/* Outer arc */}
        <path d="M14 3H13V4H14V3Z" fill="currentColor" />
        <path d="M15 4H14V12H15V4Z" fill="currentColor" />
        <path d="M14 12H13V13H14V12Z" fill="currentColor" />
      </svg>
    );
  },
);

SpeakerIcon.displayName = "SpeakerIcon";

export const SpeakerMutedIcon = forwardRef<SVGSVGElement, IconProps>(
  ({ className, size, ...props }, forwardedRef) => {
    return (
      <svg
        viewBox="0 0 16 16"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Speaker muted icon"
        aria-hidden="true"
        {...props}
      >
        <path
          d="M8 2H7V3H6V4H5V5H2V6H1V10H2V11H5V12H6V13H7V14H8V2Z"
          fill="currentColor"
        />
        <path d="M11 6H10V7H11V6Z" fill="currentColor" />
        <path d="M13 6H12V7H13V6Z" fill="currentColor" />
        <path d="M12 7H11V9H12V7Z" fill="currentColor" />
        <path d="M11 9H10V10H11V9Z" fill="currentColor" />
        <path d="M13 9H12V10H13V9Z" fill="currentColor" />
      </svg>
    );
  },
);

SpeakerMutedIcon.displayName = "SpeakerMutedIcon";
