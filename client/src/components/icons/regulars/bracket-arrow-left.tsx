import { forwardRef, memo } from "react";
import { type IconProps, iconVariants } from "..";

export const BracketArrowLeftIcon = memo(
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
          d="M11.222 6.55579H9.66673V8.1111H11.222V6.55579Z"
          fill="currentColor"
        />
        <path
          d="M17.4439 8.11145V15.8888H12.7772V17.4441H18.9993V6.55529L12.7772 6.55529V8.1106L17.4439 8.11145Z"
          fill="currentColor"
        />
        <path
          d="M11.222 6.55579L12.7778 6.5561V5L11.2217 5L11.222 6.55579Z"
          fill="currentColor"
        />
        <path d="M5 11.2217L5 12.7778H6.5561V11.2217H5Z" fill="currentColor" />
        <path
          d="M9.66673 8.1111L8.1113 8.11122V9.66653H9.66661L9.66673 8.1111Z"
          fill="currentColor"
        />
        <path d="M11.2217 19H12.7778V17.4439H11.2217V19Z" fill="currentColor" />
        <path
          d="M9.66673 15.8884V17.4437L11.2217 17.4439L11.222 15.8884H9.66673Z"
          fill="currentColor"
        />
        <path
          d="M8.1113 14.3334V15.8887L9.66673 15.8884L9.66661 14.3334H8.1113Z"
          fill="currentColor"
        />
        <path
          d="M8.1113 9.66653L6.55631 9.66665L6.5561 11.2217L8.11162 11.222L8.1113 9.66653Z"
          fill="currentColor"
        />
        <path
          d="M6.5561 12.7778L6.55587 14.3333L8.1113 14.3334L8.11118 12.778L6.5561 12.7778Z"
          fill="currentColor"
        />
      </svg>
    ),
  ),
);

BracketArrowLeftIcon.displayName = "BracketArrowLeftIcon";
