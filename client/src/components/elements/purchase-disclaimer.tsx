import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { AsteriskIcon } from "../icons";

export interface PurchaseDisclaimerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof purchaseDisclaimerVariants> {
  content: string;
}

const purchaseDisclaimerVariants = cva("flex gap-2.5 items-center", {
  variants: {
    variant: {
      default: "w-full",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const PurchaseDisclaimer = ({
  content,
  variant,
  className,
  ...props
}: PurchaseDisclaimerProps) => {
  return (
    <div
      className={cn(purchaseDisclaimerVariants({ variant, className }))}
      {...props}
    >
      <AsteriskIcon
        size="xs"
        className="p-0.5 bg-white-800 rounded text-white-400"
      />
      <p className="text-white-400 text-sm/4 font-secondary">{content}</p>
    </div>
  );
};
