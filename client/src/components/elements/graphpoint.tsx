import { cva, type VariantProps } from "class-variance-authority";
import * as Icons from "@/components/icons";
import { cn } from "@/lib/utils";

const graphPointVariants = cva(
  "select-none relative flex items-center justify-center rounded-full text-black w-8 h-8 border-[1px]",
  {
    variants: {
      icon: {
        point: "bg-green-400 border-green-400",
        bomb: "bg-red-100 border-red-100",
        health: "bg-salmon-100 border-salmon-100",
        multiplier: "bg-yellow-100 border-yellow-100",
        chip: "bg-orange-100 border-orange-100",
        moonrock: "bg-blue-100 border-blue-100",
      },
    },
    defaultVariants: {
      icon: "point",
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
  icon,
  className,
  ...props
}: GraphPointProps) => {
  const Icon = iconComponents[icon ?? "point"];

  return (
    <div
      className={cn(graphPointVariants({ icon, className }))}
      {...props}
    >
      <Icon className="h-5 w-5" />
    </div>
  );
};
