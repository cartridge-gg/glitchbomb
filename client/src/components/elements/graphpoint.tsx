import { cva, type VariantProps } from "class-variance-authority";
import * as Icons from "@/components/icons";
import { cn } from "@/lib/utils";

const graphPointVariants = cva(
  "select-none relative flex items-center justify-center rounded-full text-black w-8 h-8",
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
  icon = "point",
  className,
  ...props
}: GraphPointProps) => {
  const Icon = iconComponents[icon];

  return (
    <div
      className={cn(graphPointVariants({ icon, className }))}
      {...props}
    >
      <Icon className="h-5 w-5" />
    </div>
  );
};
