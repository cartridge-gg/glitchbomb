import { cva, type VariantProps } from "class-variance-authority";
import { ChipIcon, MoonrockIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export interface GameBalanceProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onClick">,
    VariantProps<typeof gameBalanceVariants> {
  value: number;
}

const gameBalanceVariants = cva(
  "rounded-full w-full flex justify-center items-center",
  {
    variants: {
      variant: {
        moonrocks: "text-yellow-100 bg-yellow-900",
        chips: "text-orange-100 bg-orange-900",
      },
      size: {
        md: "h-12 md:h-10 p-2",
        lg: "h-16 px-6 py-3",
      },
    },
    defaultVariants: {
      variant: "moonrocks",
      size: "md",
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
  size,
  className,
  ...props
}: GameBalanceProps) => {
  const Icon = getIcon(variant ?? "moonrocks");
  return (
    <div
      className={cn(gameBalanceVariants({ variant, size, className }))}
      {...props}
    >
      <Icon className={size === "lg" ? "min-w-10 min-h-10" : undefined} />
      <p
        className={cn(
          "px-0.5 text-[22px] font-secondary",
          size === "lg" && "text-[2.5rem]",
        )}
      >
        {value}
      </p>
    </div>
  );
};
