export * from "./types";

import { cva } from "class-variance-authority";

const base = "";

export const size = {
  "4xs": "h-1 w-1",
  "3xs": "h-2 w-2",
  "2xs": "h-3 w-3",
  xs: "h-4 w-4",
  sm: "h-5 w-5",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
  "2xl": "h-14 w-14",
  "3xl": "h-[72px] w-[72px]",
};

export const iconVariants = cva(base, {
  variants: {
    size,
  },
  defaultVariants: {
    size: "md",
  },
});

export * from "./arrow-down";
export * from "./arrow-left";
export * from "./arrow-right";
export * from "./bag";
export * from "./bomb";
export * from "./bomb-orb";
export * from "./chip";
export * from "./controller";
export * from "./credits";
export * from "./cross";
export * from "./dot";
export * from "./gear";
export * from "./glitch-bomb";
export * from "./heart";
export * from "./list";
export * from "./moonrock";
export * from "./orb";
export * from "./orb-bomb";
export * from "./orb-chip";
export * from "./orb-health";
export * from "./orb-moonrock";
export * from "./orb-multiplier";
export * from "./orb-point";
export * from "./refresh";
export * from "./sparkles";
export * from "./tick";
export * from "./token";
export * from "./trash";
export * from "./warning";
