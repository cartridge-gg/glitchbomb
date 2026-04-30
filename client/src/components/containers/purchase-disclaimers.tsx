import { cva, type VariantProps } from "class-variance-authority";
import { PurchaseDisclaimer } from "@/components/elements";
import { cn } from "@/lib/utils";

export interface PurchaseDisclaimersProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof purchaseDisclaimersVariants> {
  tokenPrice: number;
}

const purchaseDisclaimersVariants = cva("flex flex-col gap-2 rounded-lg", {
  variants: {
    variant: {
      default: "bg-white-900 p-3",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const PurchaseDisclaimers = ({
  tokenPrice,
  variant,
  className,
  ...props
}: PurchaseDisclaimersProps) => {
  return (
    <div
      className={cn(purchaseDisclaimersVariants({ variant, className }))}
      {...props}
    >
      <PurchaseDisclaimer content="Games expire 24hrs after purchase." />
      <PurchaseDisclaimer content="Rewards are denominated in GLITCH tokens." />
      <PurchaseDisclaimer
        content={`1 GLITCH is currently $${tokenPrice.toFixed(5)} USD`}
      />
    </div>
  );
};
