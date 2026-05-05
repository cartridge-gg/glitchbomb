import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { ChipIcon, PlusIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { Orb } from "@/models";
import { Button } from "../ui/button";
import { OrbDisplay } from "./orb-display";
import { RarityPill } from "./rarity-pill";

const shopItemVariants = cva("flex items-center gap-3", {
  variants: {
    variant: {
      default: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface ShopItemProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof shopItemVariants> {
  orb: Orb;
  price: number;
  disabled?: boolean;
  onAdd: () => void;
  buttonRef?: React.Ref<HTMLButtonElement>;
}

export const ShopItem = ({
  orb,
  price,
  disabled = false,
  onAdd,
  buttonRef,
  variant,
  className,
  ...props
}: ShopItemProps) => {
  const handleAdd = () => {
    if (disabled) return;
    onAdd();
  };

  return (
    <div
      className={cn(
        shopItemVariants({ variant, className }),
        disabled && "opacity-50",
      )}
      {...props}
    >
      {/* Orb icon with value */}
      <OrbDisplay orb={orb} size="sm" valuePosition="top-right" />

      {/* Title/rarity and description */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-white-100 font-secondary text-xl">
            {orb.category()}
          </h3>
          <RarityPill variant={orb.rarity()} />
        </div>
        <p className="text-white/60 font-secondary text-xs tracking-wide">
          {orb.description()}
        </p>
      </div>

      {/* Price and add button */}
      <div className="flex items-center rounded-lg overflow-hidden min-w-[112px] justify-between bg-black-100">
        <div className="flex justify-center items-center px-2 flex-1">
          <ChipIcon size="xs" className="text-orange-100" />
          <motion.span
            key={price}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="font-secondary px-0.5 text-lg text-orange-100"
          >
            {price}
          </motion.span>
        </div>
        <Button
          ref={buttonRef}
          variant="secondary"
          className="h-10 w-12 p-0 rounded-none rounded-r-lg shadow-none"
          disabled={disabled}
          onClick={handleAdd}
        >
          <PlusIcon size="md" />
        </Button>
      </div>
    </div>
  );
};
