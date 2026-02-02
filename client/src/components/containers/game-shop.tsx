import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  LoadingSpinner,
  OrbCategorySummary,
  OrbDisplay,
  RarityPill,
} from "@/components/elements";
import { ChipIcon, WarningIcon } from "@/components/icons";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { Orb } from "@/models";
import { Button } from "../ui/button";
import { GameStash } from "./game-stash";

export interface GameShopProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gameShopVariants> {
  balance: number;
  orbs: Orb[];
  bag: Orb[];
  onConfirm: (indices: number[]) => void;
  isLoading?: boolean;
}

const gameShopVariants = cva(
  "select-none relative flex flex-col gap-[clamp(8px,2svh,16px)]",
  {
    variants: {
      variant: {
        default:
          "h-full min-h-0 max-w-[420px] mx-auto px-4 pt-[clamp(10px,2.4svh,18px)] pb-[clamp(6px,1.1svh,12px)]",
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
      className="flex items-center gap-[clamp(8px,2svh,16px)] py-[clamp(4px,1.2svh,8px)]"
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
  isLoading = false,
  ...props
}: GameShopProps) => {
  // Store quantities per orb index
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  // History of actions for undo (stores the index of each add)
  const [history, setHistory] = useState<number[]>([]);
  // Confirmation dialog for leaving without buying
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  // Show stash modal
  const [showStash, setShowStash] = useState(false);

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

  // Get total quantity purchased for an orb type (across all shop positions)
  const getOrbTypeQuantity = (orbId: number): number => {
    return orbs.reduce((count, orb, index) => {
      if (orb.into() === orbId) {
        return count + (quantities[index] || 0);
      }
      return count;
    }, 0);
  };

  // Get the next purchase price for an orb (based on orb TYPE purchase count, not index)
  // Contract formula: cost = ceil(baseCost * (1 + count * 0.2))
  // NOT compounding! Each 20% is added to base, not to previous price
  const getNextPrice = (orb: Orb): number => {
    const orbId = orb.into();
    const totalQtyForType = getOrbTypeQuantity(orbId);
    const baseCost = orb.cost();
    const multiplier = 1 + totalQtyForType * 0.2;
    return Math.ceil(baseCost * multiplier);
  };

  // Calculate total spent - need to process purchases in order by orb type
  // Contract formula: cost = ceil(baseCost * (1 + count * 0.2))
  const totalSpent = useMemo(() => {
    // Group purchases by orb type and calculate escalating costs
    const purchaseCountByType: Record<number, number> = {};
    let total = 0;

    // Process history in order to get correct escalating prices
    for (const index of history) {
      const orb = orbs[index];
      const orbId = orb.into();
      const currentCount = purchaseCountByType[orbId] || 0;

      // Calculate price at this purchase count (linear, not compounding)
      const baseCost = orb.cost();
      const multiplier = 1 + currentCount * 0.2;
      const price = Math.ceil(baseCost * multiplier);
      total += price;

      // Increment count for this orb type
      purchaseCountByType[orbId] = currentCount + 1;
    }

    return total;
  }, [orbs, history]);

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
    const nextPrice = getNextPrice(orb);
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
    const existingOrbs = bag.filter((orb) => !orb.isNone());
    const pendingOrbs = basketIndices.map((index) => orbs[index]);
    return [...existingOrbs, ...pendingOrbs];
  }, [bag, basketIndices, orbs]);

  const hasSelections = basketIndices.length > 0;

  const handleContinue = () => {
    if (hasSelections) {
      onConfirm(basketIndices);
    } else {
      setShowExitConfirmation(true);
    }
  };

  const handleConfirmExit = () => {
    setShowExitConfirmation(false);
    onConfirm([]);
  };

  // Show exit confirmation screen
  if (showExitConfirmation) {
    return (
      <div className={gameShopVariants({ variant, className })} {...props}>
        <div className="flex-1 flex flex-col items-center justify-center gap-8 text-center">
          <WarningIcon size="xl" className="text-yellow-400" />
          <div className="flex flex-col gap-3">
            <h1 className="text-white uppercase text-2xl font-primary">
              Leave Shop?
            </h1>
            <p className="text-green-600 font-secondary text-[clamp(0.65rem,1.5svh,0.875rem)] tracking-wide max-w-xs">
              You haven't selected any orbs. Are you sure you want to leave
              without buying anything?
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-stretch gap-3 w-full pt-2">
          <Button
            variant="secondary"
            gradient="green"
            className="min-h-[clamp(40px,6svh,56px)] w-full font-secondary text-[clamp(0.65rem,1.5svh,0.875rem)] tracking-widest"
            wrapperClassName="flex-1"
            onClick={() => setShowExitConfirmation(false)}
          >
            ← BACK
          </Button>
          <Button
            variant="default"
            gradient="green"
            className="min-h-[clamp(40px,6svh,56px)] w-full font-secondary text-[clamp(0.65rem,1.5svh,0.875rem)] tracking-widest"
            wrapperClassName="flex-1"
            onClick={handleConfirmExit}
          >
            LEAVE SHOP
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={gameShopVariants({ variant, className })} {...props}>
      <div className="flex-1 min-h-0 flex flex-col justify-center">
        {/* Scrollable content */}
        <div
          className="flex flex-col gap-[clamp(8px,2svh,12px)] max-h-full overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {/* Header */}
          <div className="flex flex-col gap-[clamp(2px,0.8svh,6px)]">
            <div className="flex items-center justify-between">
              <h1 className="text-white uppercase font-primary text-[clamp(1.5rem,4.5svh,2rem)]">
                ORB SHOP
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-green-600 font-secondary text-[clamp(0.65rem,1.5svh,0.875rem)] tracking-wide">
              Spend Chips to add orbs to your bag
            </p>
          </div>

          {/* Shop items */}
          <div className="flex flex-col gap-1">
            {orbs.map((orb, index) => {
              const nextPrice = getNextPrice(orb);
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

          {/* Your Orbs section - clickable category summary */}
          <div className="flex flex-col gap-[clamp(6px,1.6svh,10px)] pt-[clamp(6px,1.6svh,12px)]">
            <h2 className="text-green-600 font-secondary text-[clamp(0.65rem,1.5svh,0.875rem)] tracking-wider uppercase">
              Your Orbs
            </h2>
            <OrbCategorySummary
              orbs={displayBag}
              onClick={() => setShowStash(true)}
            />
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-stretch gap-3 w-full pt-2 shrink-0">
        <Button
          variant="secondary"
          gradient="green"
          className="min-h-[clamp(40px,6svh,56px)] w-full font-secondary text-[clamp(0.65rem,1.5svh,0.875rem)] tracking-widest"
          wrapperClassName="flex-1"
          disabled={history.length === 0 || isLoading}
          onClick={handleUndo}
        >
          <span className="text-md leading-none translate-y-[1px]">↻</span>
          UNDO
        </Button>
        <Button
          variant="default"
          gradient="green"
          className="min-h-[clamp(40px,6svh,56px)] w-full font-secondary text-[clamp(0.65rem,1.5svh,0.875rem)] tracking-widest"
          wrapperClassName="flex-1"
          onClick={handleContinue}
          disabled={isLoading}
        >
          {isLoading ? <LoadingSpinner size="sm" /> : "CONTINUE"}
        </Button>
      </div>

      <Dialog open={showStash} onOpenChange={setShowStash}>
        <DialogContent className="w-[min(92vw,420px)] max-w-none border border-green-900/70 bg-[#0B130D] p-0 h-[min(85vh,600px)] max-h-[85vh] overflow-hidden">
          <GameStash orbs={displayBag} onClose={() => setShowStash(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};
