import { forwardRef } from "react";
import { iconVariants } from "..";
import type { IconProps } from "../types";

export type ArrowRightIconProps = IconProps;

export const ArrowRightIcon = forwardRef<SVGSVGElement, ArrowRightIconProps>(
  ({ className, size, ...props }, forwardedRef) => {
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Arrow right icon"
        aria-hidden="true"
        {...props}
      >
        <path
          d="M16.1675 11.1665L16.1675 9.49951L17.8345 9.49951L17.8345 11.1665L19.5 11.1665L19.5 12.832L17.8345 12.832L17.8345 14.499L16.1675 14.499L16.1675 12.832L4.5 12.832L4.5 11.1665L16.1675 11.1665Z"
          fill="currentColor"
        />
        <path
          d="M16.1675 14.499L16.1675 16.166L14.5005 16.166L14.5005 14.499L16.1675 14.499Z"
          fill="currentColor"
        />
        <path
          d="M16.1675 7.83252L16.1675 9.49951L14.5005 9.49951L14.5005 7.83252L16.1675 7.83252Z"
          fill="currentColor"
        />
        <path
          d="M14.5005 16.166L14.5005 17.8315L12.835 17.8315L12.835 16.166L14.5005 16.166Z"
          fill="currentColor"
        />
        <path
          d="M14.5005 6.16699L14.5005 7.83252L12.835 7.83252L12.835 6.16699L14.5005 6.16699Z"
          fill="currentColor"
        />
        <path
          d="M12.835 17.8315L12.835 19.5L11.1665 19.5L11.1665 17.833L12.835 17.8315Z"
          fill="currentColor"
        />
        <path
          d="M12.835 4.5L12.835 6.16699L11.168 6.16699L11.168 4.5L12.835 4.5Z"
          fill="currentColor"
        />
      </svg>
    );
  },
);

ArrowRightIcon.displayName = "ArrowRightIcon";
