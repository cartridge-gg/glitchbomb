import { cva, type VariantProps } from "class-variance-authority";
import { BagItem, type BagItemProps } from "@/components/elements/bag-item";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const bagItemsVariants = cva("flex flex-col w-full gap-6", {
  variants: {
    variant: {
      default: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export type BagItemEntry = Pick<BagItemProps, "orb" | "discarded">;

export interface BagItemsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bagItemsVariants> {
  title: string;
  items: BagItemEntry[];
}

export const BagItems = ({
  title,
  items,
  variant,
  className,
  ...props
}: BagItemsProps) => {
  return (
    <div className={cn(bagItemsVariants({ variant, className }))} {...props}>
      <h1 className="text-primary-100 font-secondary text-2xl uppercase">
        {title}
      </h1>
      <div className="flex justify-center w-full">
        <TooltipProvider delayDuration={0}>
          <div className="flex flex-wrap w-full gap-4">
            {items.map((item, i) => (
              <BagItem
                key={`${item.orb.value}-${i}`}
                orb={item.orb}
                discarded={item.discarded}
              />
            ))}
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
};
