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
  // Store indices and prices of selected items
  const [basketItems, setBasketItems] = useState<
    { index: number; price: number }[]
  >([]);

  // Create a stable key that changes when orbs or balance change
  const resetKey = useMemo(
    () => `${balance}-${orbs.length}-${orbs.map((o) => o.value).join(",")}`,
    [balance, orbs],
  );

  // Reset all states when orbs or balance change
  useEffect(() => {
    if (resetKey) {
      setBasketItems([]);
    }
  }, [resetKey]);

  // Get the actual orbs in the basket
  const basket = basketItems.map((item) => orbs[item.index]);
  const basketIndices = basketItems.map((item) => item.index);

  // Calculate total spent using the stored prices
  const totalSpent = basketItems.reduce((sum, item) => sum + item.price, 0);
  const virtualBalance = balance - totalSpent;

  // Count items by type in basket
  const basketCounts = {
    point: basket.filter((orb) => orb.isPoint()).length,
    multiplier: basket.filter((orb) => orb.isMultiplier()).length,
    health: basket.filter((orb) => orb.isHealth()).length,
    moonrock: basket.filter((orb) => orb.isMoonrock()).length,
    chip: basket.filter((orb) => orb.isChips()).length,
  };

  const isInBasket = (index: number) => {
    return basketItems.some((item) => item.index === index);
  };

  // Get the stored price for an item in the basket, or calculate the adjusted price for a new purchase
  const getDisplayPrice = (orb: Orb, index: number) => {
    // If item is in basket, return the price it was purchased at
    const basketItem = basketItems.find((item) => item.index === index);
    if (basketItem) {
      return basketItem.price;
    }

    // Calculate the adjusted price based on how many of the same type are already in basket
    // Each +20% is calculated on the previous rounded price, not the base price
    const countInBasket = basket.filter(
      (item) => item.value === orb.value,
    ).length;

    let price = orb.cost();
    for (let i = 0; i < countInBasket; i++) {
      price = Math.ceil(price * 1.2);
    }
    return price;
  };

  const handleAddToBasket = (index: number) => {
    // Don't add if already in basket
    if (isInBasket(index)) {
      return;
    }

    const orb = orbs[index];
    const adjustedPrice = getDisplayPrice(orb, index);
    if (adjustedPrice <= virtualBalance) {
      setBasketItems([...basketItems, { index, price: adjustedPrice }]);
    }
  };

  const handleRemoveFromBasket = (index: number) => {
    const removedOrb = orbs[index];
    const newBasketItems = basketItems.filter((item) => item.index !== index);

    // Recalculate prices for items of the same type
    const recalculatedItems = newBasketItems.map((item) => {
      const orb = orbs[item.index];
      // Only recalculate if it's the same type as the removed orb
      if (orb.value !== removedOrb.value) {
        return item;
      }

      // Count how many of the same type come before this item in the basket
      const countBefore = newBasketItems
        .filter((i) => i.index < item.index)
        .filter((i) => orbs[i.index].value === orb.value).length;

      // Recalculate price based on position
      let price = orb.cost();
      for (let i = 0; i < countBefore; i++) {
        price = Math.ceil(price * 1.2);
      }

      return { ...item, price };
    });

    setBasketItems(recalculatedItems);
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
          const inBasket = isInBasket(index);
          const displayPrice = getDisplayPrice(orb, index);
          const canAfford = inBasket || displayPrice <= virtualBalance;

          return (
            <Item
              key={key}
              title={orb.name()}
              description={orb.description()}
              cost={displayPrice}
              variant={orbVariant}
              disabled={!canAfford}
              selected={inBasket}
              onClick={
                inBasket ? () => handleRemoveFromBasket(index) : undefined
              }
              onAdd={() => handleAddToBasket(index)}
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
