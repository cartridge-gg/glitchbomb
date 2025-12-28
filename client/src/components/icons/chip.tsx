import { forwardRef } from "react";
import { iconVariants } from ".";
import type { IconProps } from "./types";

export type ChipIconProps = IconProps;

export const ChipIcon = forwardRef<SVGSVGElement, ChipIconProps>(
  ({ className, size, ...props }, forwardedRef) => {
    return (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Chip icon"
        aria-hidden="true"
        {...props}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13.801 11.6022L13.8041 11.9614C13.8101 12.647 13.8089 13.1466 13.801 13.4431V13.8381H10.1189C10.1189 12.5555 10.1189 11.2731 10.1189 9.9907H13.801V11.6022ZM11.1047 12.8572H12.7983V10.9877H11.1047V12.8572Z"
          fill="currentColor"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14.2757 8.13651H15.8434V8.14999H15.8569V10.1405H17.0266V11.3238H15.8569V12.4793H17.0266V13.6626H16.8588L16.8586 13.6747L15.8569 13.7007L15.8569 15.8365H15.8434V15.85H14.2757V17H13.2897V15.85H12.4515V17H11.4655V15.85H10.6273V17H9.64127V15.85H8.1569V15.8365H8.14341V13.6993H7.02269V13.6626L6.97363 13.6626V12.4794L8.132 12.4793L8.14337 11.8406V11.3238L6.97363 11.3238V10.1406L8.14337 10.1405V8.15004L8.1569 8.14999V8.13651H9.64127V7.00005L10.6273 7V8.13651H11.4655V7.00005L12.4515 7V8.13651H13.2897V7.00005L14.2757 7V8.13651ZM12.0022 9.21279C10.442 9.21279 9.15246 9.22759 9.13611 9.24568C9.13377 9.24832 9.1316 9.27752 9.12942 9.33017V14.771L11.9406 14.795C13.499 14.8083 14.7888 14.8099 14.8067 14.7987C14.8246 14.7867 14.8393 13.5256 14.8393 11.9955V9.21279H12.0022Z"
          fill="currentColor"
        />
      </svg>
    );
  },
);

ChipIcon.displayName = "ChipIcon";
