import { cva, type VariantProps } from "class-variance-authority";
import { PurchaseDetail } from "@/components/elements/purchase-detail";
import { cn } from "@/lib/utils";

export interface PurchaseDetailsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof purchaseDetailsVariants> {
  basePrice: number;
  entryPrice: number;
  maxPayout: string;
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
  basePrice,
  entryPrice,
  maxPayout,
  loading,
  variant,
  className,
  ...props
}: PurchaseDetailsProps) => {
  const discount =
    basePrice !== entryPrice
      ? `-${(((basePrice - entryPrice) / basePrice) * 100).toFixed(0)}%`
      : undefined;

  return (
    <div
      className={cn(purchaseDetailsVariants({ variant, className }))}
      {...props}
    >
      <PurchaseDetail
        title="Entry Fee"
        previous={discount ? `$${basePrice.toFixed(2)}` : undefined}
        content={`$${entryPrice.toFixed(2)}`}
        discount={discount}
      />
      <PurchaseDetail
        title="Maximum reward"
        content={maxPayout}
        loading={loading}
      />
    </div>
  );
};
