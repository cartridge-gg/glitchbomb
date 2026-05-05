import { cva, type VariantProps } from "class-variance-authority";
import { ShopItem, type ShopItemProps } from "@/components/elements/shop-item";

const shopItemsVariants = cva("flex flex-col gap-6", {
  variants: {
    variant: {
      default: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface ShopItemsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof shopItemsVariants> {
  items: ShopItemProps[];
}

export const ShopItems = ({
  items,
  variant,
  className,
  ...props
}: ShopItemsProps) => {
  return (
    <div className={shopItemsVariants({ variant, className })} {...props}>
      {items.map((item, index) => (
        <ShopItem key={`${item.orb.value}-${index}`} {...item} />
      ))}
    </div>
  );
};
