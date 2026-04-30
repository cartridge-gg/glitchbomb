import { forwardRef, memo } from "react";
import { type IconProps, iconVariants } from "..";

export const BracketArrowRightIcon = memo(
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
          d="M12.7773 17.4442H14.3326V15.8889H12.7773V17.4442Z"
          fill="currentColor"
        />
        <path
          d="M6.55543 15.8885L6.55543 8.11118H11.2221L11.2221 6.55587L5 6.55587L5 17.4447H11.2221V15.8894L6.55543 15.8885Z"
          fill="currentColor"
        />
        <path
          d="M12.7773 17.4442L11.2215 17.4439V19H12.7776L12.7773 17.4442Z"
          fill="currentColor"
        />
        <path
          d="M18.9993 12.7783V11.2222L17.4432 11.2222V12.7783H18.9993Z"
          fill="currentColor"
        />
        <path
          d="M14.3326 15.8889L15.888 15.8888V14.3335H14.3327L14.3326 15.8889Z"
          fill="currentColor"
        />
        <path d="M12.7776 5L11.2215 5V6.5561H12.7776V5Z" fill="currentColor" />
        <path
          d="M14.3326 8.11162V6.55631L12.7776 6.5561L12.7773 8.11162H14.3326Z"
          fill="currentColor"
        />
        <path
          d="M15.888 9.66661V8.1113L14.3326 8.11162L14.3327 9.66661H15.888Z"
          fill="currentColor"
        />
        <path
          d="M15.888 14.3335L17.443 14.3333L17.4432 12.7783L15.8877 12.778L15.888 14.3335Z"
          fill="currentColor"
        />
        <path
          d="M17.4432 11.2222L17.4434 9.66674L15.888 9.66661L15.8881 11.222L17.4432 11.2222Z"
          fill="currentColor"
        />
      </svg>
    ),
  ),
);

BracketArrowRightIcon.displayName = "BracketArrowRightIcon";
