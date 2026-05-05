import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { SummaryItem } from "@/components/elements/summary-item";
import { BagIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Orb, OrbType } from "@/models";
import { Button } from "../ui/button";

const summaryItemsVariants = cva(
  "flex items-stretch gap-0 justify-between w-full h-auto p-0",
  {
    variants: {
      variant: {
        default: "rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type CategoryKey = "bomb" | "point" | "multiplier" | "health" | "special";
const CATEGORIES: Record<CategoryKey, OrbType> = {
  bomb: OrbType.Bomb1,
  point: OrbType.Point5,
  multiplier: OrbType.Multiplier50,
  health: OrbType.Health1,
  special: OrbType.Moonrock15,
};

export interface SummaryItemsProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof summaryItemsVariants> {
  orbs: Orb[];
}

export const SummaryItems = forwardRef<HTMLButtonElement, SummaryItemsProps>(
  ({ orbs, variant, className, ...props }) => {
    const counts = orbs.reduce<Record<CategoryKey, number>>(
      (acc, orb) => {
        const category = orb.getCategory();
        if (category) acc[category] = (acc[category] || 0) + 1;
        return acc;
      },
      {} as Record<CategoryKey, number>,
    );

    return (
      <Button
        variant="ghost"
        className={cn(summaryItemsVariants({ variant, className }))}
        {...props}
      >
        <div className="bg-black-400 p-4 rounded-l-lg">
          <BagIcon size="lg" className="text-green-700" />
        </div>
        <div className="flex-1 flex justify-around items-center gap-3 pb-1.5 px-2 bg-primary-900 rounded-r-lg">
          {Object.keys(CATEGORIES).map((category) => {
            const orb = new Orb(CATEGORIES[category as CategoryKey]);
            const quantity = counts[category as CategoryKey] || 0;
            return <SummaryItem key={category} orb={orb} quantity={quantity} />;
          })}
        </div>
      </Button>
    );
  },
);

SummaryItems.displayName = "SummaryItems";
