import { cva, type VariantProps } from "class-variance-authority";
import { useEffect, useMemo, useState } from "react";
import {
  ChipIcon,
  OrbChipIcon,
  OrbHealthIcon,
  OrbMoonrockIcon,
  OrbMultiplierIcon,
  OrbPointIcon,
} from "@/components/icons";
import type { Orb } from "@/models";
import { Button } from "../ui/button";

export interface GameShopProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gameShopVariants> {
  balance: number;
  orbs: Orb[];
  bag: Orb[];
  onPurchase: (indices: number[]) => void;
  onUndo: () => void;
  onContinue: () => void;
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

// Get the icon component for an orb type
const getOrbIcon = (orb: Orb) => {
  if (orb.isPoint()) return OrbPointIcon;
  if (orb.isMultiplier()) return OrbMultiplierIcon;
  if (orb.isHealth()) return OrbHealthIcon;
  if (orb.isChips()) return OrbChipIcon;
  if (orb.isMoonrock()) return OrbMoonrockIcon;
  return OrbPointIcon;
};

// Get color for orb type
const getOrbColor = (orb: Orb) => {
  if (orb.isPoint()) return "var(--green-400)";
  if (orb.isMultiplier()) return "var(--yellow-100)";
  if (orb.isHealth()) return "var(--salmon-100)";
  if (orb.isChips()) return "var(--orange-100)";
  if (orb.isMoonrock()) return "var(--blue-100)";
  return "var(--green-400)";
};

// Get display value for orb (the number shown in the icon)
const getOrbDisplayValue = (orb: Orb): string => {
  const name = orb.name();
  // Extract number from name like "Point 5", "Multiplier 50%", etc.
  const match = name.match(/(\d+)/);
  if (orb.isMultiplier()) {
    // For multipliers, show as X3, X2, etc.
    const percent = match ? parseInt(match[1], 10) : 0;
    if (percent === 50) return "X2";
    if (percent === 100) return "X3";
    if (percent === 150) return "X4";
  }
  return match ? match[1] : "";
};

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
  const Icon = getOrbIcon(orb);
  const color = getOrbColor(orb);
  const displayValue = getOrbDisplayValue(orb);

  return (
    <div className="flex items-center gap-4 py-2">
      {/* Orb icon with value */}
      <div
        className="relative w-16 h-16 rounded-full flex items-center justify-center shrink-0 overflow-hidden"
        style={{
          borderWidth: "2px",
          borderStyle: "solid",
          borderColor: color,
        }}
      >
        {/* Orb background */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            backgroundImage: "url(/assets/orb.png)",
            backgroundSize: "102%",
            backgroundPosition: "center",
            opacity: 0.4,
          }}
        />
        {/* Color tint */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            backgroundColor: color,
            mixBlendMode: "multiply",
            opacity: 0.5,
          }}
        />
        {/* Icon */}
        <Icon
          className="w-12 h-12 relative z-10"
          style={{
            color,
            filter: `drop-shadow(0 0 8px ${color})`,
          }}
        />
        <span
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-sm font-bold font-secondary px-1 z-10"
          style={{ color }}
        >
          {displayValue}
        </span>
      </div>

      {/* Title and description */}
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-primary text-sm tracking-wide">
          {getOrbTypeName(orb)}
        </h3>
        <p className="text-green-600 font-secondary text-xs tracking-wide">
          {getOrbShortDescription(orb)}
        </p>
      </div>

      {/* Price and add button */}
      <div className="flex items-center gap-1">
        <div
          className="flex items-center gap-1 px-3 py-2 rounded border"
          style={{
            borderColor: "var(--green-900)",
            backgroundColor: "rgba(0, 50, 0, 0.3)",
          }}
        >
          <ChipIcon size="xs" className="text-green-400" />
          <span className="text-green-400 font-secondary text-sm">{price}</span>
        </div>
        <Button
          variant="default"
          className="h-10 w-10 p-0"
          disabled={disabled}
          onClick={onAdd}
        >
          <span className="text-xl font-secondary">+</span>
        </Button>
      </div>
    </div>
  );
};

interface BagOrbProps {
  orb: Orb;
}

const BagOrb = ({ orb }: BagOrbProps) => {
  const Icon = getOrbIcon(orb);
  const color = getOrbColor(orb);
  const displayValue = getOrbDisplayValue(orb);

  return (
    <div
      className="relative w-12 h-12 rounded-full flex items-center justify-center shrink-0 overflow-hidden"
      style={{
        borderWidth: "2px",
        borderStyle: "solid",
        borderColor: color,
      }}
    >
      {/* Orb background */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          backgroundImage: "url(/assets/orb.png)",
          backgroundSize: "102%",
          backgroundPosition: "center",
          opacity: 0.4,
        }}
      />
      {/* Color tint */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          backgroundColor: color,
          mixBlendMode: "multiply",
          opacity: 0.5,
        }}
      />
      {/* Icon */}
      <Icon
        className="w-9 h-9 relative z-10"
        style={{
          color,
          filter: `drop-shadow(0 0 4px ${color})`,
        }}
      />
      <span
        className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-xs font-bold font-secondary z-10"
        style={{ color }}
      >
        {displayValue}
      </span>
    </div>
  );
};

export const GameShop = ({
  balance,
  orbs,
  bag,
  variant,
  className,
  onPurchase,
  onUndo,
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
    }
  };

  const hasSelections = basketIndices.length > 0;

  return (
    <div className={gameShopVariants({ variant, className })} {...props}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-white uppercase text-3xl font-primary">ORB SHOP</h1>
        <div
          className="flex items-center gap-1 px-4 py-2 rounded border"
          style={{
            borderColor: "var(--orange-100)",
            backgroundColor: "rgba(100, 50, 0, 0.3)",
          }}
        >
          <ChipIcon size="sm" className="text-orange-100" />
          <span className="text-orange-100 font-secondary text-lg">
            x{virtualBalance}
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
      <div className="flex flex-col gap-3 pt-4 border-t border-green-900/50">
        <h2 className="text-green-600 font-secondary text-sm tracking-wider uppercase">
          Your Orbs
        </h2>
        <div className="flex flex-wrap gap-2">
          {bag
            .filter((orb) => !orb.isBomb() && !orb.isNone())
            .map((orb, index) => (
              <BagOrb key={`bag-${orb.value}-${index}`} orb={orb} />
            ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-stretch gap-3 w-full pt-2">
        <Button
          variant="secondary"
          className="min-h-14 flex-1 font-secondary text-sm tracking-widest"
          onClick={onUndo}
        >
          ↻ UNDO
        </Button>
        <Button
          variant="default"
          className="min-h-14 flex-1 font-secondary text-sm tracking-widest"
          onClick={() => {
            if (hasSelections) {
              onPurchase(basketIndices);
            } else {
              onContinue();
            }
          }}
        >
          CONTINUE
        </Button>
      </div>
    </div>
  );
};
