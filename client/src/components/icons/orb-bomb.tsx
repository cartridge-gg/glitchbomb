import { forwardRef } from "react";
import { iconVariants } from ".";
import type { IconProps } from "./types";

export type OrbBombIconProps = IconProps;

export const OrbBombIcon = forwardRef<SVGSVGElement, OrbBombIconProps>(
  ({ className, size, ...props }, forwardedRef) => {
    return (
      <svg
        viewBox="0 0 227 238"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Orb Bomb icon"
        aria-hidden="true"
        {...props}
      >
        <path
          d="M88.57 81.4157C100.406 74.5821 114.201 72.9917 127.067 76.8434L124.236 79.8609C118.463 86.0093 124.904 96.9453 131.534 103.185C140.39 111.515 150.613 114.043 155.307 109.057L158.672 105.491C167.865 127.984 159.179 154.09 137.691 166.496C114.224 180.044 84.1127 171.975 70.5649 148.509C57.0264 125.06 65.1046 94.9638 88.57 81.4157Z"
          fill="currentColor"
        />
        <path
          d="M132.038 80.7392C134.982 89.7667 145.195 99.0072 153.929 101.352L150.724 104.742C149.16 106.404 142.42 104.799 135.833 98.5982C133.589 96.491 131.696 94.1455 130.354 91.8219C128.168 88.0363 127.924 85.1075 128.805 84.1657L132.038 80.7392Z"
          fill="currentColor"
        />
        <path
          d="M156.995 64.167C158.64 64.7203 159.522 66.5079 158.964 68.1561L153.638 81.4044C155.51 83.2947 157.158 85.3142 158.328 87.3402C159.562 89.4778 161.631 94.4018 159.376 95.3707C159 95.347 156.519 96.8344 149.917 92.6788C143.802 88.8292 134.717 77.8099 137.995 74.4C139.481 72.8115 144.119 74.2741 148.566 77.1871L153.005 66.1371C153.564 64.4888 155.355 63.6107 156.995 64.167Z"
          fill="currentColor"
        />
      </svg>
    );
  },
);

OrbBombIcon.displayName = "OrbBombIcon";
