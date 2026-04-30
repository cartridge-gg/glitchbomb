import { cva, type VariantProps } from "class-variance-authority";
import { ChipIcon, MoonrockIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export interface GameBalanceProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onClick">,
    VariantProps<typeof gameBalanceVariants> {
  value: number;
}

const gameBalanceVariants = cva(
  "h-12 md:h-10 rounded-full w-full p-2 flex justify-center items-center",
  {
    variants: {
      variant: {
        moonrocks: "text-yellow-100 bg-yellow-900",
        chips: "text-orange-100 bg-orange-900",
      },
    },
    defaultVariants: {
      variant: "moonrocks",
    },
  },
);

const getIcon = (variant: NonNullable<GameBalanceProps["variant"]>) => {
  switch (variant) {
    case "chips":
      return ChipIcon;
    default:
      return MoonrockIcon;
  }
};

export const GameBalance = ({
  value,
  variant,
  className,
  ...props
}: GameBalanceProps) => {
  const Icon = getIcon(variant ?? "moonrocks");
  return (
    <div className={cn(gameBalanceVariants({ variant, className }))} {...props}>
      <Icon size="md" />
      <p className="px-0.5 text-[22px] font-secondary">{value}</p>
    </div>
  );
};
