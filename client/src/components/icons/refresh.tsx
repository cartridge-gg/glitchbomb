import { forwardRef } from "react";
import { iconVariants } from ".";
import type { IconProps } from "./types";

export type RefreshIconProps = IconProps;

export const RefreshIcon = forwardRef<SVGSVGElement, RefreshIconProps>(
  ({ className, size, ...props }, forwardedRef) => {
    return (
      <svg
        viewBox="0 0 16 16"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Refresh icon"
        aria-hidden="true"
        {...props}
      >
        <path
          d="M6.21386 12.6419V12.2848H4.78514V11.5704H4.07079V10.1417H3.35645V5.8565H4.07079V4.42778H4.78514L4.78561 4.07107V3.71437H6.21433L6.21386 3.3572V3.00002H9.78463L9.78511 3.3572V3.71437H10.4995V4.42872H11.2138V3H12.6425V7.28519H8.35733V5.85647H9.78605V5.14212H9.0717V4.42778H6.92868V5.14212H5.49996V6.57084H4.78561V9.42828H5.49996V10.857H6.92868V11.5714H9.78612V10.857H11.2148V9.42828H12.6436V11.5713H11.9292V12.2857H10.5005V13H6.2153L6.21386 12.6419Z"
          fill="currentColor"
        />
      </svg>
    );
  },
);

RefreshIcon.displayName = "RefreshIcon";
