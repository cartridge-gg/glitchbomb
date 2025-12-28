import type { VariantProps } from "class-variance-authority";
import type { iconVariants } from ".";

export type IconProps = React.SVGAttributes<SVGElement> &
  VariantProps<typeof iconVariants>;
