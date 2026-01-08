import { cva, type VariantProps } from "class-variance-authority";
import { useEffect, useMemo, useState } from "react";
import { Counter, Item, Tag } from "@/components/elements";
import type { Orb } from "@/models";
import { BagIcon } from "../icons";
import { Button } from "../ui/button";

export interface GameShopProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gameShopVariants> {
  balance: number;
  orbs: Orb[];
  onPurchase: (indices: number[]) => void;
  onInventory: () => void;
  onContinue: () => void;
}

const gameShopVariants = cva("select-none relative flex flex-col gap-5", {
  variants: {
    variant: {
      default: "h-full max-w-[420px] mx-auto",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const GameShop = ({
  balance,
  orbs,
  variant,
  className,
  onPurchase,
  onInventory,
  onContinue,
  ...props
}: GameShopProps) => {
  // Store quantities per orb index
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  // Create a stable key that changes when orbs or balance change
  const resetKey = useMemo(
    () => `${balance}-${orbs.length}-${orbs.map((o) => o.value).join(",")}`,
    [balance, orbs],
  );

  // Reset all states when orbs or balance change
  useEffect(() => {
    if (resetKey) {
      setQuantities({});
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

  // Count items by type in basket
  const basketCounts = useMemo(() => {
    const counts = {
      point: 0,
      multiplier: 0,
      health: 0,
      moonrock: 0,
      chip: 0,
    };
    orbs.forEach((orb, index) => {
      const qty = quantities[index] || 0;
      if (qty > 0) {
        if (orb.isPoint()) counts.point += qty;
        else if (orb.isMultiplier()) counts.multiplier += qty;
        else if (orb.isHealth()) counts.health += qty;
        else if (orb.isMoonrock()) counts.moonrock += qty;
        else if (orb.isChips()) counts.chip += qty;
      }
    });
    return counts;
  }, [orbs, quantities]);

  // Build basket indices array (with duplicates for quantity)
  const basketIndices = useMemo(() => {
    const indices: number[] = [];
    Object.entries(quantities).forEach(([indexStr, qty]) => {
      const index = parseInt(indexStr);
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
    }
  };

  const handleDecrement = (index: number) => {
    setQuantities((prev) => {
      const currentQty = prev[index] || 0;
      if (currentQty <= 0) return prev;
      const newQty = currentQty - 1;
      if (newQty === 0) {
        const { [index]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [index]: newQty };
    });
  };

  return (
    <div className={gameShopVariants({ variant, className })} {...props}>
      <div className="flex items-center justify-between">
        <h1 className="text-white uppercase text-3xl/[22px]">Orb Shop</h1>
        <Counter balance={virtualBalance} variant="chip" />
      </div>
      <div className="flex gap-4 justify-center items-center">
        <Tag count={basketCounts.point} variant="point" />
        <Tag count={basketCounts.multiplier} variant="multiplier" />
        <Tag count={basketCounts.health} variant="health" />
        <Tag count={basketCounts.moonrock} variant="moonrock" />
        <Tag count={basketCounts.chip} variant="chip" />
      </div>
      <div
        className="flex flex-col gap-2 grow overflow-y-scroll"
        style={{ scrollbarWidth: "none" }}
      >
        {orbs.map((orb, index) => {
          const key = `${orb.value}-${index}`;
          const orbVariant = orb.isBomb()
            ? "bomb"
            : orb.isHealth()
              ? "health"
              : orb.isMultiplier()
                ? "multiplier"
                : orb.isPoint()
                  ? "point"
                  : orb.isMoonrock()
                    ? "moonrock"
                    : orb.isChips()
                      ? "chip"
                      : "default";
          const quantity = quantities[index] || 0;
          const nextPrice = getNextPrice(orb, index);
          const canAfford = nextPrice <= virtualBalance;

          return (
            <Item
              key={key}
              title={orb.name()}
              description={orb.description()}
              cost={nextPrice}
              quantity={quantity}
              canIncrement={canAfford}
              variant={orbVariant}
              disabled={!canAfford && quantity === 0}
              onAdd={() => handleIncrement(index)}
              onRemove={() => handleDecrement(index)}
            />
          );
        })}
      </div>
      <div className="flex items-stretch gap-3 w-full">
        <Button
          variant="secondary"
          className="min-h-12 flex-1 font-secondary text-sm tracking-widest"
          onClick={() => onPurchase(basketIndices.sort((a, b) => a - b))}
        >
          Submit
        </Button>
        <Button
          variant="secondary"
          className="min-h-12 font-secondary text-sm tracking-widest"
          onClick={onInventory}
        >
          <BagIcon size="lg" />
        </Button>
        <Button
          variant="secondary"
          className="min-h-12 flex-1 font-secondary text-sm tracking-widest"
          onClick={onContinue}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};
