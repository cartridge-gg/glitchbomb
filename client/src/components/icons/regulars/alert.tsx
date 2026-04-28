import { forwardRef, memo } from "react";
import { type IconProps, iconVariants } from "..";

export const AlertIcon = memo(
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
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13.0981 6.31325H14.1081V7.89513H15.2471V9.63663H16.2372V11.3636H17.2609V13.1196H18.3392V14.6289H19.2946V16.1672H20.25V18.009H19.1035V18.75H4.62416V18.009H3.75V16.1672H4.70542V14.6289H5.66084V13.1196H6.73908V11.3636H7.76271V9.63663H8.74543V7.89513H9.6872V6.31325H10.6972V5.25H13.0981V6.31325ZM11.0235 16.7393H12.9765V14.8385H11.0235V16.7393ZM11.0235 13.4591H12.9765V9.73684H12.969V8.79312H11.0235V13.4591Z"
          fill="currentColor"
        />
      </svg>
    ),
  ),
);

AlertIcon.displayName = "AlertIcon";
