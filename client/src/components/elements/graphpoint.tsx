import { cva, type VariantProps } from "class-variance-authority";
import * as Icons from "@/components/icons";
import { cn } from "@/lib/utils";

const graphPointVariants = cva(
  "select-none relative flex items-center justify-center rounded-full text-black",
  {
    variants: {
      icon: {
        point: "bg-green-400",
        bomb: "bg-red-100",
        health: "bg-salmon-100",
        multiplier: "bg-yellow-100",
        chip: "bg-orange-100",
        moonrock: "bg-blue-100",
      },
      size: {
        default: "w-8 h-8",
        sm: "w-3 h-3",
      },
    },
    defaultVariants: {
      icon: "point",
      size: "default",
    },
  },
);

const iconComponents = {
  point: Icons.OrbPointIcon,
  bomb: Icons.OrbBombIcon,
  health: Icons.OrbHealthIcon,
  multiplier: Icons.OrbMultiplierIcon,
  chip: Icons.OrbChipIcon,
  moonrock: Icons.OrbMoonrockIcon,
} as const;

export interface GraphPointProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof graphPointVariants> {}

export const GraphPoint = ({
  icon = "point",
  size = "default",
  className,
  ...props
}: GraphPointProps) => {
  const Icon = iconComponents[icon];

  return (
    <div
      className={cn(graphPointVariants({ icon, size, className }))}
      {...props}
    >
      <Icon className={size === "sm" ? "h-2 w-2" : "h-5 w-5"} />
    </div>
  );
};
