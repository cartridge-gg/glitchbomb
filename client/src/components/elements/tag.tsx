import { cva, type VariantProps } from "class-variance-authority";
import { type HTMLMotionProps, motion } from "framer-motion";
import * as icons from "@/components/icons";
import { cn } from "@/lib/utils";

const tagVariants = cva(
  "select-none flex items-center bg-green-950 rounded pl-1.5 pr-2 h-5",
  {
    variants: {
      variant: {
        default: "text-white",
        bomb: "text-red-100",
        point: "text-green-400",
        multiplier: "text-yellow-100",
        chip: "text-orange-100",
        moonrock: "text-blue-100",
        health: "text-salmon-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const iconVariants = (variant: string) => {
  switch (variant) {
    case "bomb":
      return icons.BombOrbIcon;
    case "point":
      return icons.SparklesIcon;
    case "multiplier":
      return icons.CrossIcon;
    case "chip":
      return icons.ChipIcon;
    case "moonrock":
      return icons.MoonrockIcon;
    case "health":
      return icons.HeartIcon;
    default:
      return icons.OrbIcon;
  }
};

export interface TagProps
  extends Omit<HTMLMotionProps<"div">, "ref">,
    VariantProps<typeof tagVariants> {
  count: number;
}

export const Tag = ({ count, variant, className, ...props }: TagProps) => {
  const Icon = iconVariants(variant ?? "default");
  return (
    <motion.div
      className={cn(
        tagVariants({ variant, className }),
        count === 0 ? "text-green-700" : "",
      )}
      {...props}
    >
      <Icon size="xs" className="min-h-4 min-w-4" />
      <div className="flex items-center gap-0.5 -translate-y-px">
        <span className="text-[8px] font-secondary px-px">x</span>
        <strong className="text-sm font-secondary">{count}</strong>
      </div>
    </motion.div>
  );
};
