import { cva, type VariantProps } from "class-variance-authority";
import { BagItem, type BagItemProps } from "@/components/elements/bag-item";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const bagItemsVariants = cva("flex flex-col w-full text-left", {
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
      <h1 className="text-green-400 font-secondary text-[clamp(1.05rem,3svh,1.25rem)] tracking-wide mb-[clamp(8px,2svh,16px)]">
        {title}
      </h1>
      <div className="flex justify-center w-full">
        <TooltipProvider delayDuration={0}>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 w-full gap-4">
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
