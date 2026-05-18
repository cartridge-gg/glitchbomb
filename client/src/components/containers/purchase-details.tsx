import { cva, type VariantProps } from "class-variance-authority";
import { PurchaseDetail } from "@/components/elements/purchase-detail";
import { cn } from "@/lib/utils";

export interface PurchaseDetailsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof purchaseDetailsVariants> {
  /** Entry fee in USD. */
  price: number;
  /** Unboosted maximum reward in USD (struck through when boosted). */
  baseMaxPayout: number;
  /** Boosted maximum reward in USD (the actual reward the player gets). */
  realMaxPayout: number;
  loading?: boolean;
}

const purchaseDetailsVariants = cva(
  "flex flex-col gap-px rounded-lg overflow-hidden",
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

export const PurchaseDetails = ({
  price,
  baseMaxPayout,
  realMaxPayout,
  loading,
  variant,
  className,
  ...props
}: PurchaseDetailsProps) => {
  const boost =
    baseMaxPayout > 0 && realMaxPayout !== baseMaxPayout
      ? `+${(((realMaxPayout - baseMaxPayout) / baseMaxPayout) * 100).toFixed(0)}%`
      : undefined;

  return (
    <div
      className={cn(purchaseDetailsVariants({ variant, className }))}
      {...props}
    >
      <PurchaseDetail
        title="Maximum reward"
        previous={boost ? `$${baseMaxPayout.toFixed(2)}` : undefined}
        content={`$${realMaxPayout.toFixed(2)}`}
        discount={boost}
        loading={loading}
      />
      <PurchaseDetail title="Entry Fee" content={`$${price.toFixed(2)}`} />
    </div>
  );
};
