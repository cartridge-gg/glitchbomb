import { forwardRef, memo } from "react";
import { type IconProps, iconVariants } from "..";

export const MenuIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          d="M5.24902 4.6073V6.53575H18.7502V4.6073H5.24902Z"
          fill="currentColor"
        />
        <path
          d="M5.24902 11.0358V12.9642H18.7502V11.0358H5.24902Z"
          fill="currentColor"
        />
        <path
          d="M5.24902 17.4642V19.3927H18.7502V17.4642H5.24902Z"
          fill="currentColor"
        />
      </svg>
    ),
  ),
);

MenuIcon.displayName = "MenuIcon";
