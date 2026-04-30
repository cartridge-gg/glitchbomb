import { cva, type VariantProps } from "class-variance-authority";
import { AddIcon, SubIcon } from "@/components/icons";
import type { ButtonProps } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const stakeChangeVariants = cva("", {
  variants: {
    variant: {
      default: "min-w-12 md:min-w-12",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface StakeAddProps
  extends Omit<ButtonProps, "variant">,
    VariantProps<typeof stakeChangeVariants> {}

export const StakeAdd = ({ className, variant, ...props }: StakeAddProps) => {
  return (
    <Button
      variant="secondary"
      size="icon"
      className={cn(stakeChangeVariants({ variant, className }))}
      {...props}
    >
      <AddIcon size="sm" />
    </Button>
  );
};

export interface StakeSubProps
  extends Omit<ButtonProps, "variant">,
    VariantProps<typeof stakeChangeVariants> {}

export const StakeSub = ({ className, variant, ...props }: StakeSubProps) => {
  return (
    <Button
      variant="secondary"
      size="icon"
      className={cn(stakeChangeVariants({ variant, className }))}
      {...props}
    >
      <SubIcon size="sm" />
    </Button>
  );
};
