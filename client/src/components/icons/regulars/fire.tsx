import { forwardRef, memo } from "react";
import { type IconProps, iconVariants } from "..";

export const FireIcon = memo(
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
          d="M13.4107 4.5H12.4639V5.43691H11.5264V7.31074H10.5889V9.18457H9.65137V11.9953H8.72324V9.18457H7.77637V10.1215H6.83887V11.9953H5.90137V15.7523H6.83887V17.6262H7.77637V18.5631H8.71387V19.5H11.5357V18.5537H10.5982V17.6168H9.66074V16.6799H8.72324V13.8785H10.5889V14.8154H11.5357V12.9416H12.4732V11.0678H13.4014V12.0047H14.3389V12.9416H15.2764V16.6799H14.3389V19.5H15.2857V18.5631H16.2232V17.6262H17.1607V15.7523H18.0982V12.9322H17.1607V11.9953H16.2232V10.1215H15.2857V9.18457H14.3482V7.31074H13.4107V4.5Z"
          fill="currentColor"
        />
        <path
          d="M8.71387 7.31074H9.66074V8.25703H8.71387V7.31074Z"
          fill="currentColor"
        />
      </svg>
    ),
  ),
);

FireIcon.displayName = "FireIcon";
