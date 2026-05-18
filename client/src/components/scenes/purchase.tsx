import { cva, type VariantProps } from "class-variance-authority";
import { useMemo, useRef } from "react";
import {
  PurchaseDisclaimers,
  Stakes,
  type StakesProps,
} from "@/components/containers";
import { PurchaseChart } from "@/components/containers/purchase-chart";
import { PurchaseDetails } from "@/components/containers/purchase-details";
import { Close } from "@/components/elements/close";
import { Button } from "@/components/ui/button";
import { GlitchText } from "@/components/ui/glitch-text";
import { ChartHelper } from "@/helpers/chart";
import { cn } from "@/lib/utils";

const purchaseSceneVariants = cva(
  "relative flex flex-col gap-6 overflow-hidden rounded-lg bg-[#040603] p-6 outline outline-4 -outline-offset-4 outline-green-600 md:p-8",
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

export interface PurchaseSceneProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof purchaseSceneVariants> {
  slotCount: number;
  /** Entry fee in USD. */
  price: number;
  tokenPrice: number;
  /** Unboosted reward multiplier (tier 1-STARTERPACK_COUNT). */
  baseMultiplier: number;
  /** Boosted reward multiplier — the one actually applied on-chain. */
  realMultiplier: number;
  loading?: boolean;
  expiration?: number;
  targetSupply: bigint;
  currentSupply: bigint;
  stakesProps?: StakesProps;
  onClose?: () => void;
  onConnect?: () => void;
  onPurchase?: () => void;
}

export const PurchaseScene = ({
  slotCount,
  price,
  tokenPrice,
  baseMultiplier,
  realMultiplier,
  loading,
  expiration,
  targetSupply,
  currentSupply,
  stakesProps,
  onClose,
  onConnect,
  onPurchase,
  variant,
  className,
  ...props
}: PurchaseSceneProps) => {
  const lastStableChartRef = useRef<{
    realMaxPayout: number;
    baseMaxPayout: number;
  } | null>(null);

  const { realMaxPayout, baseMaxPayout } = useMemo(() => {
    if (loading && lastStableChartRef.current) {
      return lastStableChartRef.current;
    }
    const real = ChartHelper.calculate({
      slotCount,
      currentSupply,
      targetSupply,
      tokenPrice,
      price,
      multiplier: realMultiplier,
    });
    const base = ChartHelper.calculate({
      slotCount,
      currentSupply,
      targetSupply,
      tokenPrice,
      price,
      multiplier: baseMultiplier,
    });
    const result = {
      realMaxPayout: real.maxPayout,
      baseMaxPayout: base.maxPayout,
    };
    if (!loading) lastStableChartRef.current = result;
    return result;
  }, [
    slotCount,
    currentSupply,
    targetSupply,
    tokenPrice,
    price,
    baseMultiplier,
    realMultiplier,
    loading,
  ]);

  const detailsProps = useMemo(
    () => ({
      price,
      baseMaxPayout,
      realMaxPayout,
      loading,
    }),
    [price, baseMaxPayout, realMaxPayout, loading],
  );

  const chartProps = useMemo(
    () => ({
      stake: realMultiplier,
      tokenPrice,
      supply: currentSupply,
      target: targetSupply,
    }),
    [realMultiplier, tokenPrice, currentSupply, targetSupply],
  );

  return (
    <div
      className={cn(purchaseSceneVariants({ variant, className }))}
      {...props}
    >
      {onClose ? (
        <Close size="md" onClick={onClose} className="absolute top-4 right-4" />
      ) : null}

      <h2 className="text-2xl/8 md:text-[2.5rem] text-green-100 uppercase tracking-tight">
        <GlitchText
          text="Play Game"
          style={{
            textShadow:
              "2px 2px 0px rgba(255, 0, 0, 0.25), -2px -2px 0px rgba(0, 0, 255, 0.25)",
          }}
        />
      </h2>
      <div
        className="flex flex-col gap-6 w-full h-full"
        style={{ scrollbarWidth: "none" }}
      >
        <div
          className="grow overflow-y-auto flex flex-col gap-4 md:gap-6"
          style={{ scrollbarWidth: "none" }}
        >
          <PurchaseChart {...chartProps} />
          {stakesProps && onPurchase && <Stakes {...stakesProps} />}
          <div className="flex flex-col gap-4">
            <PurchaseDetails {...detailsProps} />
            <PurchaseDisclaimers tokenPrice={tokenPrice} />
          </div>
        </div>
        {onConnect ? (
          <Button
            variant="constructive"
            className="w-full min-h-12"
            onClick={onConnect}
          >
            <span className="px-1 font-secondary font-[22px]/3 uppercase">
              Log In
            </span>
          </Button>
        ) : onPurchase ? (
          <Button
            variant="secondary"
            className="w-full min-h-12"
            onClick={onPurchase}
          >
            <span className="px-1 font-secondary font-[22px]/3 uppercase">
              {`Purchase - $${price.toFixed(2)}`}
            </span>
          </Button>
        ) : null}
      </div>
    </div>
  );
};
