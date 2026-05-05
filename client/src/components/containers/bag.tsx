import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { BagItems, type BagItemsProps } from "./bag-items";

const bagVariants = cva("flex flex-col w-full gap-6", {
  variants: {
    variant: {
      default: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface BagProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bagVariants> {
  pendingItems: BagItemsProps;
  bagItems: BagItemsProps;
}

export const Bag = ({
  pendingItems,
  bagItems,
  variant,
  className,
  ...props
}: BagProps) => {
  return (
    <div className={cn(bagVariants({ variant, className }))} {...props}>
      {pendingItems.items.length > 0 && <BagItems {...pendingItems} />}
      <BagItems {...bagItems} />
    </div>
  );
};
