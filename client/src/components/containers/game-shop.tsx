import { cva, type VariantProps } from "class-variance-authority";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { OrbDisplay, RarityPill } from "@/components/elements";
import { ChipIcon } from "@/components/icons";
import type { Orb } from "@/models";
import { Button } from "../ui/button";

export interface GameShopProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gameShopVariants> {
  balance: number;
  orbs: Orb[];
  bag: Orb[];
  onConfirm: (indices: number[]) => void;
}

const gameShopVariants = cva("select-none relative flex flex-col gap-4", {
  variants: {
    variant: {
      default: "h-full max-w-[420px] mx-auto px-4",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

// Get short name for orb type
const getOrbTypeName = (orb: Orb): string => {
  if (orb.isPoint()) return "POINTS ORB";
  if (orb.isMultiplier()) return "MULTIPLIER ORB";
  if (orb.isHealth()) return "HEART ORB";
  if (orb.isChips()) return "CHIPS ORB";
  if (orb.isMoonrock()) return "MOONROCK ORB";
  return "ORB";
};

// Get short description for orb type
const getOrbShortDescription = (orb: Orb): string => {
  if (orb.isPoint()) return "Gain points";
  if (orb.isMultiplier()) return "Increase future points";
  if (orb.isHealth()) return "Gain health";
  if (orb.isChips()) return "Gain chips";
  if (orb.isMoonrock()) return "Gain moonrocks";
  return "";
};

interface ShopItemProps {
  orb: Orb;
  price: number;
  disabled: boolean;
  onAdd: () => void;
}

const ShopItem = ({ orb, price, disabled, onAdd }: ShopItemProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleAdd = () => {
    if (disabled) return;
    setIsAnimating(true);
    onAdd();
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <motion.div
      className="flex items-center gap-4 py-2"
      animate={isAnimating ? { scale: [1, 1.02, 1] } : {}}
      transition={{ duration: 0.2 }}
    >
      {/* Orb icon with value */}
      <OrbDisplay orb={orb} size="md" />

      {/* Title and description */}
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-primary text-sm tracking-wide">
          {getOrbTypeName(orb)}
        </h3>
        <p className="text-green-600 font-secondary text-xs tracking-wide">
          {getOrbShortDescription(orb)}
        </p>
      </div>

      {/* Rarity pill */}
      <RarityPill rarity={orb.rarity()} className="self-start mt-3" />

      {/* Price and add button */}
      <div
        className="flex items-center rounded-lg overflow-hidden"
        style={{
          backgroundColor: "rgba(0, 15, 0, 0.6)",
        }}
      >
        <div className="flex items-center gap-2 px-3">
          <ChipIcon size="sm" className="text-orange-100" />
          <motion.span
            key={price}
            initial={{ scale: 1.3, color: "#4ade80" }}
            animate={{ scale: 1, color: "#ffedd5" }}
            transition={{ duration: 0.3 }}
            className="font-secondary text-sm"
          >
            {price}
          </motion.span>
        </div>
        <button
          type="button"
          className="h-10 w-14 p-0 rounded-r-lg disabled:opacity-50"
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

export const GameShop = ({
  balance,
  orbs,
  bag,
  variant,
  className,
  onConfirm,
  ...props
}: GameShopProps) => {
  // Store quantities per orb index
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  // History of actions for undo (stores the index of each add)
  const [history, setHistory] = useState<number[]>([]);

  // Create a stable key that changes when orbs or balance change
  const resetKey = useMemo(
    () => `${balance}-${orbs.length}-${orbs.map((o) => o.value).join(",")}`,
    [balance, orbs],
  );

  // Reset all states when orbs or balance change
  useEffect(() => {
    if (resetKey) {
      setQuantities({});
      setHistory([]);
    }
  }, [resetKey]);

  // Calculate the price for a specific quantity of an orb (considering 20% escalation)
  const calculatePriceForQuantity = (orb: Orb, quantity: number): number => {
    let total = 0;
    let price = orb.cost();
    for (let i = 0; i < quantity; i++) {
      total += price;
      price = Math.ceil(price * 1.2);
    }
    return total;
  };

  // Get the next purchase price for an orb at a given index
  const getNextPrice = (orb: Orb, index: number): number => {
    const currentQty = quantities[index] || 0;
    let price = orb.cost();
    for (let i = 0; i < currentQty; i++) {
      price = Math.ceil(price * 1.2);
    }
    return price;
  };

  // Calculate total spent
  const totalSpent = useMemo(() => {
    return orbs.reduce((sum, orb, index) => {
      const qty = quantities[index] || 0;
      return sum + calculatePriceForQuantity(orb, qty);
    }, 0);
  }, [orbs, quantities]);

  const virtualBalance = balance - totalSpent;

  // Build basket indices array (with duplicates for quantity)
  const basketIndices = useMemo(() => {
    const indices: number[] = [];
    Object.entries(quantities).forEach(([indexStr, qty]) => {
      const index = parseInt(indexStr, 10);
      for (let i = 0; i < qty; i++) {
        indices.push(index);
      }
    });
    return indices.sort((a, b) => a - b);
  }, [quantities]);

  const handleIncrement = (index: number) => {
    const orb = orbs[index];
    const nextPrice = getNextPrice(orb, index);
    if (nextPrice <= virtualBalance) {
      setQuantities((prev) => ({
        ...prev,
        [index]: (prev[index] || 0) + 1,
      }));
      setHistory((prev) => [...prev, index]);
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const lastIndex = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setQuantities((prev) => {
      const currentQty = prev[lastIndex] || 0;
      if (currentQty <= 1) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [lastIndex]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [lastIndex]: currentQty - 1,
      };
    });
  };

  // Combine existing bag with pending purchases for display
  const displayBag = useMemo(() => {
    const existingOrbs = bag.filter((orb) => !orb.isBomb() && !orb.isNone());
    const pendingOrbs = basketIndices.map((index) => orbs[index]);
    return [...existingOrbs, ...pendingOrbs];
  }, [bag, basketIndices, orbs]);

  return (
    <div className={gameShopVariants({ variant, className })} {...props}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-white uppercase text-3xl font-primary">ORB SHOP</h1>
        <div
          className="flex items-center gap-1 px-4 py-2 rounded"
          style={{
            backgroundColor: "rgba(100, 50, 0, 0.3)",
          }}
        >
          <ChipIcon size="sm" className="text-orange-100" />
          <span className="text-orange-100 font-secondary text-lg">
            {virtualBalance}
          </span>
        </div>
      </div>

      {/* Subtitle */}
      <p className="text-green-600 font-secondary text-sm tracking-wide">
        Spend Chips to add orbs to your bag
      </p>

      {/* Shop items */}
      <div
        className="flex flex-col gap-1 grow overflow-y-auto"
        style={{ scrollbarWidth: "none" }}
      >
        {orbs.map((orb, index) => {
          const nextPrice = getNextPrice(orb, index);
          const canAfford = nextPrice <= virtualBalance;

          return (
            <ShopItem
              key={`${orb.value}-${index}`}
              orb={orb}
              price={nextPrice}
              disabled={!canAfford}
              onAdd={() => handleIncrement(index)}
            />
          );
        })}
      </div>

      {/* Your Orbs section */}
      <div className="flex flex-col gap-3 pt-4">
        <h2 className="text-green-600 font-secondary text-sm tracking-wider uppercase">
          Your Orbs
        </h2>
        <div className="flex flex-wrap gap-2">
          <AnimatePresence mode="popLayout">
            {displayBag.map((orb, index) => (
              <motion.div
                key={`bag-${orb.value}-${index}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 25,
                }}
                style={{
                  willChange: "transform, opacity",
                  backfaceVisibility: "hidden",
                  transform: "translateZ(0)",
                }}
              >
                <OrbDisplay orb={orb} size="sm" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-stretch gap-3 w-full pt-2">
        <Button
          variant="secondary"
          className="min-h-14 flex-1 font-secondary text-sm tracking-widest"
          disabled={history.length === 0}
          onClick={handleUndo}
        >
          ↻ UNDO
        </Button>
        <Button
          variant="default"
          className="min-h-14 flex-1 font-secondary text-sm tracking-widest"
          onClick={() => onConfirm(basketIndices)}
        >
          CONTINUE
        </Button>
      </div>
    </div>
  );
};
