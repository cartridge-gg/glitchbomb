import { forwardRef } from "react";
import { iconVariants } from "..";
import type { IconProps } from "../types";

export type ArrowLeftIconProps = IconProps;

export const ArrowLeftIcon = forwardRef<SVGSVGElement, ArrowLeftIconProps>(
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
        aria-label="Arrow left icon"
        aria-hidden="true"
        {...props}
      >
        <path
          d="M7.83252 11.1665L7.83252 9.49951H6.16553V11.1665L4.5 11.1665L4.5 12.832H6.16553L6.16553 14.499H7.83252V12.832H19.5V11.1665L7.83252 11.1665Z"
          fill="currentColor"
        />
        <path
          d="M7.83252 14.499L7.83252 16.166H9.49951V14.499H7.83252Z"
          fill="currentColor"
        />
        <path
          d="M7.83252 7.83252V9.49951H9.49951V7.83252L7.83252 7.83252Z"
          fill="currentColor"
        />
        <path
          d="M9.49951 16.166V17.8315H11.165V16.166H9.49951Z"
          fill="currentColor"
        />
        <path
          d="M9.49951 6.16699L9.49951 7.83252H11.165L11.165 6.16699L9.49951 6.16699Z"
          fill="currentColor"
        />
        <path
          d="M11.165 17.8315L11.165 19.5H12.8335V17.833L11.165 17.8315Z"
          fill="currentColor"
        />
        <path
          d="M11.165 4.5V6.16699L12.832 6.16699V4.5L11.165 4.5Z"
          fill="currentColor"
        />
      </svg>
    );
  },
);

ArrowLeftIcon.displayName = "ArrowLeftIcon";
