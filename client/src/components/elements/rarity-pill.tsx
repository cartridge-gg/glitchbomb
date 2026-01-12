import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const rarityPillVariants = cva(
  "inline-flex items-center justify-center rounded-full px-3 py-1 font-secondary text-xs tracking-wider uppercase border-2",
  {
    variants: {
      rarity: {
        common: "border-green-500 text-green-400",
        rare: "border-blue-400 text-blue-300",
        cosmic: "border-purple-400 text-purple-300",
      },
    },
    defaultVariants: {
      rarity: "common",
    },
  },
);

export interface RarityPillProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof rarityPillVariants> {
  rarity: "common" | "rare" | "cosmic";
}

export const RarityPill = ({
  rarity,
  className,
  ...props
}: RarityPillProps) => {
  return (
    <div className={cn(rarityPillVariants({ rarity, className }))} {...props}>
      {rarity}
    </div>
  );
};
