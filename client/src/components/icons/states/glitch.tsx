import { forwardRef, memo } from "react";
import { iconVariants, type StateIconProps } from "..";

export const GlitchStateIcon = memo(
  forwardRef<SVGSVGElement, StateIconProps>(
    ({ className, size, variant, ...props }, forwardedRef) => (
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
        {(() => {
          switch (variant) {
            case "solid":
              return (
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M17.5 7.47799H9.76315V8.20304H9.08418V15.713H9.76315V16.4788H14.0733V13.6611H11.47V10.4226H17.5V20H8.79507V19.5175H7.82699V18.7705H7.14802V18.057H6.46812V17.3229H5.77446V16.3578H5.5V7.15966H5.77446V6.19458H6.46812V5.46048H7.14802V4.74698H7.82699V4H17.5V7.47799Z"
                  fill="currentColor"
                />
              );
            case "line":
              return (
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M9.08418 15.713L9.76313 15.713L9.76313 16.4788L14.0733 16.4788L14.0733 13.6611L11.47 13.6611L11.47 10.4226L17.5 10.4226L17.5 20L8.79507 20L8.79507 19.5175L7.82697 19.5175L7.82697 18.7705L7.14802 18.7705L7.14802 18.057L6.4681 18.057L6.4681 17.3229L5.77446 17.3229L5.77446 16.3578L5.5 16.3578L5.5 7.15966L5.77446 7.15966L5.77446 6.19459L6.4681 6.19459L6.4681 5.46048L7.14802 5.46048L7.14802 4.74699L7.82697 4.74699L7.82697 4L17.5 4L17.5 7.47799L9.76313 7.47799L9.76313 8.20303L9.08418 8.20303L9.08418 15.713ZM8.79507 8.20303L8.79507 7.23797L9.76313 7.23797L9.76313 6.51292L16.5319 6.51292L16.5319 4.96507L8.11612 4.96507L8.11612 5.71206L7.4362 5.71206L7.4362 6.42555L6.74256 6.42555L6.74256 7.15966L6.4681 7.15966L6.4681 16.3578L6.74256 16.3578L6.74256 17.0919L7.4362 17.0919L7.4362 17.8054L8.11612 17.8054L8.11612 18.5524L8.79507 18.5524L8.79507 19.0349L16.5319 19.0349L16.5319 11.3877L12.4381 11.3877L12.4381 12.696L15.0414 12.696L15.0414 17.4439L9.76313 17.4439L9.76313 16.6781L8.79507 16.6781L8.79507 15.713L8.11612 15.713L8.11612 8.20303L8.79507 8.20303Z"
                  fill="currentColor"
                />
              );
          }
        })()}
      </svg>
    ),
  ),
);

GlitchStateIcon.displayName = "GlitchStateIcon";
