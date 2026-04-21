import { forwardRef, memo } from "react";
import { type IconProps, iconVariants } from "..";

export const QuestionmarkIcon = memo(
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
          d="M9.3 9.29999C9.3 7.80936 10.5094 6.59999 12 6.59999C13.4906 6.59999 14.7 7.80936 14.7 9.29999C14.7 10.5009 13.9153 11.5191 12.8297 11.8706C12.0309 12.1294 11.1 12.8634 11.1 14.025V14.7C11.1 15.1978 11.5022 15.6 12 15.6C12.4978 15.6 12.9 15.1978 12.9 14.7V14.025C12.9 13.9772 12.9169 13.9097 12.9984 13.8197C13.0828 13.7269 13.2206 13.6369 13.3837 13.5834C15.1922 13.0012 16.5 11.3053 16.5 9.29999C16.5 6.81374 14.4862 4.79999 12 4.79999C9.51375 4.79999 7.5 6.81374 7.5 9.29999C7.5 9.7978 7.90219 10.2 8.4 10.2C8.89781 10.2 9.3 9.7978 9.3 9.29999ZM12 19.2C12.6216 19.2 13.125 18.6966 13.125 18.075C13.125 17.4534 12.6216 16.95 12 16.95C11.3784 16.95 10.875 17.4534 10.875 18.075C10.875 18.6966 11.3784 19.2 12 19.2Z"
          fill="currentColor"
        />
      </svg>
    ),
  ),
);

QuestionmarkIcon.displayName = "QuestionmarkIcon";
