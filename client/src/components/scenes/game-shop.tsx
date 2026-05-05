import { cva, type VariantProps } from "class-variance-authority";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LoadingSpinner, type ShopItemProps } from "@/components/elements";
import type { Orb } from "@/models";
import { GameBalances, GameStash, SummaryItems } from "../containers";
import { ConfirmationDialog } from "../containers/confirmation-dialog";
import {
  isShopExitConfirmDismissed,
  setShopExitConfirmDismissed,
} from "../containers/confirmation-prefs";
import { ShopItems } from "../containers/shop-items";
import { RefreshIcon } from "../icons";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";

export interface GameShopGame {
  chips: number;
  moonrocks: number;
  shop: Orb[];
  bag: Orb[];
  shopPurchaseCounts?: number[];
}

export interface GameShopProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gameShopVariants> {
  game: GameShopGame;
  onConfirm: (indices: number[]) => void;
  isLoading?: boolean;
}

const gameShopVariants = cva(
  "select-none relative flex flex-col gap-4 md:gap-6",
  {
    variants: {
      variant: {
        default: "h-full min-h-0 mx-auto p-4",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const GameShop = ({
  game,
  variant,
  className,
  onConfirm,
  isLoading = false,
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

  const items: ShopItemProps[] = sortedShopEntries.map(({ orb, index }) => {
    const price = getNextPrice(orb);
    return {
      orb,
      price,
      disabled: price > virtualBalance,
      onAdd: () => handleIncrement(index),
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
        chips={{ value: virtualBalance }}
      />

      <div className="flex-1 flex flex-col gap-4 md:gap-6 overflow-hidden">
        {/* Subtitle */}
        <p className="text-primary-100 font-secondary uppercase text-[22px]/6">
          Purchase Orbs
        </p>

        {/* Scrollable content */}
        <div
          className="flex-1 flex flex-col overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {/* Shop items */}
          <ShopItems items={items} />
        </div>
      </div>

      {/* Orbs section */}
      <div className="flex flex-col gap-3">
        <h2 className="text-primary-100 font-secondary uppercase text-[22px]/6">
          Your Orbs
        </h2>
        <SummaryItems orbs={displayBag} onClick={() => setShowStash(true)} />
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 md:gap-4 text-primary-600 hover:text-primary-100">
        <Button
          variant="secondary"
          className="flex-1 h-12"
          disabled={history.length === 0 || isLoading}
          onClick={handleUndo}
        >
          <RefreshIcon size="sm" />
          <span className="font-secondary text-2xl uppercase">Undo</span>
        </Button>
        <Button
          variant="secondary"
          className="flex-1 h-12 bg-primary-600 hover:bg-primary-500"
          disabled={isLoading}
          onClick={handleContinue}
        >
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <span className="font-secondary text-2xl uppercase ">Continue</span>
          )}
        </Button>
      </div>

      <Dialog open={showStash} onOpenChange={setShowStash}>
        <DialogContent className="w-[min(92vw,420px)] max-w-none border-4 border-[rgba(29,58,41,0.8)] bg-black p-0 h-[min(85vh,600px)] max-h-[85vh] overflow-hidden">
          <GameStash
            orbs={existingBag}
            pendingOrbs={pendingOrbs}
            onRemovePending={handleRemovePending}
          />
        </DialogContent>
      </Dialog>
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
    </div>
  );
};
