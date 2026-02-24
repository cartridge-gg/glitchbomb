import { cva, type VariantProps } from "class-variance-authority";
import { CreditsIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

export interface BalanceProps
  extends React.HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof balanceVariants> {
  balance: number;
  highlight?: boolean;
}

const balanceVariants = cva("flex justify-center items-center gap-2", {
  variants: {
    variant: {
      default: "",
      secondary: "",
    },
    size: {
      md: "h-12 w-full",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

export const Balance = ({
  balance,
  highlight,
  variant,
  size,
  className,
  ...props
}: BalanceProps) => {
  return (
    <Button
      className={balanceVariants({ variant, size, className })}
      variant={highlight ? "default" : "secondary"}
      {...props}
    >
      <CreditsIcon size="sm" />
      <span className="font-secondary uppercase text-sm tracking-widest font-normal">{`${balance.toLocaleString()}`}</span>
    </Button>
  );
};
