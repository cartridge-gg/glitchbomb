import { forwardRef } from "react";
import { iconVariants } from ".";
import type { IconProps } from "./types";

export type Bomb1xIconProps = IconProps;

export const Bomb1xIcon = forwardRef<SVGSVGElement, Bomb1xIconProps>(
  ({ className, size, ...props }, forwardedRef) => {
    return (
      <svg
        viewBox="0 0 36 36"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Bomb 1x icon"
        aria-hidden="true"
        {...props}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M18.6746 11.7566H21.1882V14.3483H23.703V15.481H25.0411V16.774H26.2167V19.1998H27.5625V25.35H26.2167V27.7758H25.0411V29.0754H23.703V30.2092H21.1882V31.5012H14.8129V30.2092L12.2992 30.2103V29.0765H10.9512V27.7769H9.61304V25.3511H8.4375V19.1998H9.61304V16.774L10.9512 16.7729V15.481L12.2992 15.4821V14.3483H14.8129V11.7566H17.3276V9.4978H18.6746V11.7566ZM15.5281 18.0001V18.5439H14.9843V19.0878H14.4404V20.1754H15.5281V24.526H14.4404V25.6136H17.7034V24.526H16.6157V18.0001H15.5281ZM18.679 19.8744V21.2686H18.9261V21.5157H19.1733V21.7629H19.4205V21.8519H19.1733V22.0991H18.9261V22.3463H18.679V23.7405H19.5787V22.9989H19.8259V22.7517H20.0731V22.5045H20.1621V22.7517H20.4093V22.9989H20.6565V23.7405H21.5563V22.3463H21.3091V22.0991H21.0619V21.8519H20.8147V21.7629H21.0619V21.5157H21.3091V21.2686H21.5563V19.8744H20.6565V20.616H20.4093V20.8632H20.1621V21.1104H20.0731V20.8632H19.8259V20.616H19.5787V19.8744H18.679Z"
          fill="#FF1E00"
        />
        <path
          d="M14.7349 10.6437H12.2124V9.35168H14.7349V10.6437Z"
          fill="#FF1E00"
        />
        <path
          d="M23.7876 10.6437H21.2739V9.35168H23.7876V10.6437Z"
          fill="#FF1E00"
        />
        <path
          d="M14.7349 6.9259H16.2334V8.2179H14.7228V6.9259H13.5593V5.79211H14.7349V6.9259Z"
          fill="#FF1E00"
        />
        <path
          d="M21.2739 8.2179H19.9347V6.9259H21.2739V8.2179Z"
          fill="#FF1E00"
        />
        <path
          d="M18.7603 4.50122V6.9259H17.2496V4.49902L18.7603 4.50122Z"
          fill="#FF1E00"
        />
        <path
          d="M22.4517 6.9259H21.2761V5.79211H22.4517V6.9259Z"
          fill="#FF1E00"
        />
      </svg>
    );
  },
);

Bomb1xIcon.displayName = "Bomb1xIcon";
