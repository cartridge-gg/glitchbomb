import { cva, type VariantProps } from "class-variance-authority";
import { PayoutChart } from "@/components/elements/payout-chart";
import { cn } from "@/lib/utils";

export interface PurchaseChartProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof purchaseChartVariants> {
  /** Stake / multiplier driving the payout curve (1-STARTERPACK_COUNT). */
  stake: number;
  /** Token (GLITCH) price in USD. `0` = price unavailable. */
  tokenPrice: number;
  /** Current token total supply (raw units). */
  supply?: bigint;
  /** Target token supply (raw units). */
  target?: bigint;
}

const purchaseChartVariants = cva(
  "select-none flex flex-col justify-between gap-2 md:gap-4 w-full",
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

/**
 * Mirrors the role of `Purchase` container in `../nums`: wraps the chart and
 * an info box exposing the live token price. Keeps gbomb's richer
 * `PayoutChart` (SVG with hover/flag) intact.
 */
export const PurchaseChart = ({
  stake,
  tokenPrice,
  supply,
  target,
  variant,
  className,
  ...props
}: PurchaseChartProps) => {
  return (
    <div
      className={cn(purchaseChartVariants({ variant, className }))}
      {...props}
    >
      <div className="h-[clamp(180px,30svh,280px)] w-full min-w-0 flex-none">
        <PayoutChart
          stake={stake}
          tokenPrice={tokenPrice > 0 ? tokenPrice : null}
          supply={supply}
          target={target}
        />
      </div>
    </div>
  );
};
