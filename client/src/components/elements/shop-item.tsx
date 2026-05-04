import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { useState } from "react";
import { ChipIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { Orb } from "@/models";
import { OrbDisplay } from "./orb-display";
import { RarityPill } from "./rarity-pill";

const shopItemVariants = cva(
  "flex items-center gap-[clamp(8px,2svh,16px)] py-[clamp(4px,1.2svh,8px)]",
  {
    variants: {
      variant: {
        default: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

// Get short name for orb type
const getOrbTypeName = (orb: Orb): string => {
  if (orb.isPoint()) return "POINTS ORB";
  if (orb.isMultiplier()) return "MULTIPLIER ORB";
  if (orb.isHealth()) return "HEART ORB";
  if (orb.isChips()) return "CHIPS ORB";
  if (orb.isMoonrock()) return "MOONROCK ORB";
  return "ORB";
};

export interface ShopItemProps extends VariantProps<typeof shopItemVariants> {
  orb: Orb;
  price: number;
  disabled?: boolean;
  onAdd: () => void;
  buttonRef?: React.Ref<HTMLButtonElement>;
  className?: string;
}

export const ShopItem = ({
  orb,
  price,
  disabled = false,
  onAdd,
  buttonRef,
  variant,
  className,
}: ShopItemProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleAdd = () => {
    if (disabled) return;
    setIsAnimating(true);
    onAdd();
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <motion.div
      className={cn(
        shopItemVariants({ variant }),
        disabled && "opacity-50",
        className,
      )}
      animate={isAnimating ? { scale: [1, 1.02, 1] } : {}}
      transition={{ duration: 0.2 }}
    >
      {/* Orb icon with value */}
      <OrbDisplay orb={orb} size="sm" valuePosition="top-right" />

      {/* Title/rarity and description */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-secondary text-sm tracking-wide flex-1 min-w-0">
            {getOrbTypeName(orb)}
          </h3>
          {!orb.isBomb() && (
            <RarityPill rarity={orb.rarity()} className="ml-auto" />
          )}
        </div>
        <p className="text-white/60 font-secondary text-xs tracking-wide">
          {orb.description()}
        </p>
      </div>

      {/* Price and add button */}
      <div
        className="flex items-center rounded-lg overflow-hidden min-w-[128px] justify-between"
        style={{
          backgroundColor: "rgba(0, 15, 0, 0.6)",
        }}
      >
        <div className="flex items-center gap-2 px-3">
          <ChipIcon size="sm" className="text-orange-100" />
          <motion.span
            key={price}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="font-secondary text-sm text-orange-100"
          >
            {price}
          </motion.span>
        </div>
        <button
          ref={buttonRef}
          type="button"
          className="h-10 w-14 p-0 rounded-r-lg"
          style={{ backgroundColor: "rgba(0, 100, 0, 0.3)" }}
          disabled={disabled}
          onClick={handleAdd}
        >
          <span
            className="text-3xl font-secondary text-green-400"
            style={{ fontWeight: 100 }}
          >
            +
          </span>
        </button>
      </div>
    </motion.div>
  );
};
