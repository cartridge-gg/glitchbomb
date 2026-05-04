import { cva, type VariantProps } from "class-variance-authority";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  LoadingSpinner,
  OrbCategorySummary,
  OrbDisplay,
  type ShopItemProps,
} from "@/components/elements";
import type { Orb } from "@/models";
import { GameBalances } from "../containers";
import { ConfirmationDialog } from "../containers/confirmation-dialog";
import {
  isShopExitConfirmDismissed,
  setShopExitConfirmDismissed,
} from "../containers/confirmation-prefs";
import { ShopItems } from "../containers/shop-items";
import { StashModal } from "../containers/stash-modal";
import { GradientBorder } from "../ui/gradient-border";
import type { GameSceneGame } from "./game";

export interface GameShopProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gameShopVariants> {
  game: GameSceneGame;
  onConfirm: (indices: number[]) => void;
  isLoading?: boolean;
  onBalanceChange?: (balance: number) => void;
}

const gameShopVariants = cva(
  "select-none relative flex flex-col gap-[clamp(8px,2svh,16px)]",
  {
    variants: {
      variant: {
        default:
          "h-full min-h-0 max-w-[420px] mx-auto px-4 pt-[clamp(10px,2.4svh,18px)] pb-[clamp(10px,2.4svh,18px)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const getParticleCategory = (orb: Orb) => {
  if (orb.isBomb()) return "bomb";
  if (orb.isPoint()) return "point";
  if (orb.isMultiplier()) return "multiplier";
  if (orb.isHealth()) return "health";
  if (orb.isChips()) return "special";
  if (orb.isMoonrock()) return "special";
  return "point";
};

export const GameShop = ({
  game,
  variant,
  className,
  onConfirm,
  isLoading = false,
  onBalanceChange,
  ...props
}: GameShopProps) => {
  const {
    chips: balance,
    shop: orbs,
    bag,
    shopPurchaseCounts: initialPurchaseCounts = [],
  } = game;

  // Store quantities per orb index
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  // History of actions for undo (stores the index of each add)
  const [history, setHistory] = useState<number[]>([]);
  // Confirmation dialog for leaving without buying
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  // Show stash modal
  const [showStash, setShowStash] = useState(false);
  const [stashPulse, setStashPulse] = useState(0);

  // Refs for particle animation
  const stashRef = useRef<HTMLButtonElement>(null);
  const buttonRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const particleIdRef = useRef(0);

  // Flying orb particles
  const [particles, setParticles] = useState<
    {
      id: number;
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      orb: Orb;
    }[]
  >([]);

  const setButtonRef = useCallback(
    (index: number) => (el: HTMLButtonElement | null) => {
      buttonRefs.current[index] = el;
    },
    [],
  );

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
  // Includes initial purchase counts from prior shop visits
  const getNextPrice = (orb: Orb): number => {
    const orbId = orb.into();
    const totalQtyForType =
      getOrbTypeQuantity(orbId) + (initialPurchaseCounts[orbId] ?? 0);
    const baseCost = orb.cost();
    const multiplier = 1 + totalQtyForType * 0.2;
    return Math.ceil(baseCost * multiplier);
  };

  // Calculate total spent - need to process purchases in order by orb type
  // Contract formula: cost = ceil(baseCost * (1 + count * 0.2))
  // Includes initial purchase counts from prior shop visits
  const totalSpent = useMemo(() => {
    // Group purchases by orb type and calculate escalating costs
    // Start from initial counts (prior shop visits)
    const purchaseCountByType: Record<number, number> = {};
    let total = 0;

    // Process history in order to get correct escalating prices
    for (const index of history) {
      const orb = orbs[index];
      const orbId = orb.into();
      const currentCount =
        (purchaseCountByType[orbId] ?? initialPurchaseCounts[orbId]) || 0;

      // Calculate price at this purchase count (linear, not compounding)
      const baseCost = orb.cost();
      const multiplier = 1 + currentCount * 0.2;
      const price = Math.ceil(baseCost * multiplier);
      total += price;

      // Increment count for this orb type
      purchaseCountByType[orbId] = currentCount + 1;
    }

    return total;
  }, [orbs, history, initialPurchaseCounts]);

  const virtualBalance = balance - totalSpent;
  useEffect(() => {
    onBalanceChange?.(virtualBalance);
  }, [virtualBalance, onBalanceChange]);

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
      setStashPulse((prev) => prev + 1);

      // Spawn flying orb particle toward the matching category slot
      const btnEl = buttonRefs.current[index];
      const stashEl = stashRef.current;
      if (btnEl && stashEl) {
        const category = getParticleCategory(orb);
        const targetEl =
          stashEl.querySelector<HTMLElement>(
            `[data-orb-category="${category}"]`,
          ) ?? stashEl;
        const btnRect = btnEl.getBoundingClientRect();
        const targetRect = targetEl.getBoundingClientRect();
        const id = ++particleIdRef.current;
        setParticles((prev) => [
          ...prev,
          {
            id,
            startX: btnRect.left + btnRect.width / 2,
            startY: btnRect.top + btnRect.height / 2,
            endX: targetRect.left + targetRect.width / 2,
            endY: targetRect.top + targetRect.height / 2,
            orb,
          },
        ]);
        setTimeout(() => {
          setParticles((prev) => prev.filter((p) => p.id !== id));
        }, 600);
      }
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const lastIndex = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setQuantities((prev) => {
      const currentQty = prev[lastIndex] || 0;
      if (currentQty <= 1) {
        const { [lastIndex]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [lastIndex]: currentQty - 1,
      };
    });
  };

  const handleRemovePending = useCallback(
    (pendingIndex: number) => {
      const shopIndex = basketIndices[pendingIndex];
      if (shopIndex === undefined) return;
      // Remove the last occurrence of this shop index from history
      const lastHistoryIndex = history.lastIndexOf(shopIndex);
      if (lastHistoryIndex === -1) return;

      setHistory((prev) => prev.filter((_, i) => i !== lastHistoryIndex));
      setQuantities((prev) => {
        const currentQty = prev[shopIndex] || 0;
        if (currentQty <= 1) {
          const { [shopIndex]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [shopIndex]: currentQty - 1 };
      });
    },
    [basketIndices, history],
  );

  // Existing bag orbs (excluding None)
  const existingBag = useMemo(() => bag.filter((orb) => !orb.isNone()), [bag]);

  // Pending purchase orbs
  const pendingOrbs = useMemo(
    () => basketIndices.map((index) => orbs[index]),
    [basketIndices, orbs],
  );

  // Combine existing bag with pending purchases for category summary display
  const displayBag = useMemo(
    () => [...existingBag, ...pendingOrbs],
    [existingBag, pendingOrbs],
  );

  // Sort shop entries by rarity (common → rare → cosmic), then by base cost
  const sortedShopEntries = useMemo(() => {
    const rarityOrder = { common: 0, rare: 1, cosmic: 2 } as const;
    return orbs
      .map((orb, index) => ({ orb, index }))
      .sort((a, b) => {
        const ra = rarityOrder[a.orb.rarity()];
        const rb = rarityOrder[b.orb.rarity()];
        if (ra !== rb) return ra - rb;
        return a.orb.cost() - b.orb.cost();
      });
  }, [orbs]);

  const shopItems: ShopItemProps[] = sortedShopEntries.map(({ orb, index }) => {
    const price = getNextPrice(orb);
    return {
      orb,
      price,
      disabled: price > virtualBalance,
      onAdd: () => handleIncrement(index),
      buttonRef: setButtonRef(index),
    };
  });

  const hasSelections = basketIndices.length > 0;

  const handleContinue = () => {
    if (hasSelections) {
      onConfirm(basketIndices);
    } else if (isShopExitConfirmDismissed()) {
      onConfirm([]);
    } else {
      setShowExitConfirmation(true);
    }
  };

  const handleConfirmExit = () => {
    onConfirm([]);
  };

  return (
    <div className={gameShopVariants({ variant, className })} {...props}>
      <GameBalances
        moonrocks={{ value: game.moonrocks }}
        chips={{ value: game.chips }}
      />

      <div className="flex-1 min-h-0 flex flex-col justify-center">
        {/* Scrollable content */}
        <div
          className="flex flex-col gap-[clamp(8px,2svh,12px)] max-h-full overflow-y-auto px-1 -mx-1"
          style={{ scrollbarWidth: "none" }}
        >
          {/* Subtitle */}
          <p className="text-green-600 font-secondary text-[clamp(0.65rem,1.5svh,0.875rem)] tracking-wide">
            Spend Chips to add orbs to your bag
          </p>

          {/* Shop items */}
          <ShopItems items={shopItems} />
        </div>
      </div>

      {/* Your Orbs section - clickable category summary */}
      <div className="flex flex-col gap-[clamp(6px,1.6svh,10px)] pt-[clamp(6px,1.6svh,12px)] shrink-0">
        <h2 className="text-green-600 font-secondary text-[clamp(0.65rem,1.5svh,0.875rem)] tracking-wider uppercase">
          Your Orbs
        </h2>
        <motion.div
          key={stashPulse}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 0.25 }}
        >
          <OrbCategorySummary
            ref={stashRef}
            orbs={displayBag}
            onClick={() => setShowStash(true)}
          />
        </motion.div>
      </div>

      {/* Action buttons */}
      <div className="flex items-stretch gap-3 w-full pt-2 shrink-0">
        <GradientBorder color="orange" className="flex-1">
          <button
            type="button"
            className="flex items-center justify-center gap-2 min-h-[clamp(40px,6svh,56px)] w-full font-secondary text-[clamp(0.65rem,1.5svh,0.875rem)] tracking-widest rounded-lg transition-all disabled:pointer-events-none disabled:opacity-30 hover:brightness-125"
            style={{
              color: "#F1721C",
              background: "linear-gradient(180deg, #602A06 0%, #281202 100%)",
            }}
            disabled={history.length === 0 || isLoading}
            onClick={handleUndo}
          >
            <span className="text-md leading-none translate-y-[1px]">↻</span>
            UNDO
          </button>
        </GradientBorder>
        <GradientBorder color="green" className="flex-1">
          <button
            type="button"
            className="flex items-center justify-center gap-2 min-h-[clamp(40px,6svh,56px)] w-full font-bold font-secondary text-[clamp(0.65rem,1.5svh,0.875rem)] tracking-widest rounded-lg transition-all disabled:pointer-events-none disabled:opacity-50 hover:brightness-125"
            style={{
              color: "#36F818",
              background: "linear-gradient(180deg, #0D2518 0%, #061208 100%)",
            }}
            onClick={handleContinue}
            disabled={isLoading}
          >
            {isLoading ? <LoadingSpinner size="sm" /> : "CONTINUE"}
          </button>
        </GradientBorder>
      </div>

      <StashModal
        open={showStash}
        onOpenChange={setShowStash}
        orbs={existingBag}
        pendingOrbs={pendingOrbs}
        onRemovePending={handleRemovePending}
      />
      <ConfirmationDialog
        open={showExitConfirmation}
        onOpenChange={setShowExitConfirmation}
        title="LEAVE SHOP?"
        description="You haven't selected any orbs. Are you sure you want to leave without buying anything?"
        confirmLabel="LEAVE SHOP"
        onConfirm={handleConfirmExit}
        onDismiss={setShopExitConfirmDismissed}
        isConfirming={isLoading}
      />

      {/* Flying orb particles */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="fixed z-[60] pointer-events-none"
            style={{ left: 0, top: 0 }}
            initial={{
              x: p.startX - 24,
              y: p.startY - 24,
              scale: 1.2,
              opacity: 1,
            }}
            animate={{
              x: p.endX - 24,
              y: p.endY - 24,
              scale: 0.6,
              opacity: [1, 1, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 24,
              opacity: { duration: 0.5, times: [0, 0.7, 1] },
            }}
          >
            <OrbDisplay orb={p.orb} size="sm" showValue={false} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
