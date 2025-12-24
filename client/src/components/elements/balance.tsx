import { cva, type VariantProps } from "class-variance-authority";
import { TokenIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

export interface BalanceProps
  extends React.HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof balanceVariants> {
  balance: number;
}

// eslint-disable-next-line react-refresh/only-export-components
export const balanceVariants = cva("", {
  variants: {
    variant: {
      default: "px-3 md:px-4 py-2 text-2xl tracking-wide gap-2",
    },
    size: {
      md: "h-10",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

export const Balance = ({
  balance,
  variant,
  size,
  className,
  ...props
}: BalanceProps) => {
  return (
    <Button
      className={balanceVariants({ variant, size, className })}
      variant="secondary"
      {...props}
    >
      <TokenIcon size="md" />
      {`${balance.toLocaleString()}`}
    </Button>
  );
};
