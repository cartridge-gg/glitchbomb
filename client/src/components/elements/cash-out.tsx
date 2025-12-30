import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";

export interface CashOutProps
  extends React.HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof cashOutVariants> {}

const cashOutVariants = cva("border-none", {
  variants: {
    variant: {
      default: "bg-green-500 hover:bg-green-300 rounded-xl",
    },
    size: {
      md: "size-20",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

export const CashOut = ({
  variant,
  size,
  className,
  ...props
}: CashOutProps) => {
  return (
    <Button
      variant="secondary"
      className={cashOutVariants({ variant, size, className })}
      {...props}
    >
      <p className="uppercase font-secondary text-sm tracking-widest text-center">
        Cash
        <br />
        Out
      </p>
    </Button>
  );
};
