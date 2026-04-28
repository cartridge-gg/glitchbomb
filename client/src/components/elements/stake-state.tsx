import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const stakeStateVariants = cva("h-3 min-w-3 cursor-pointer transition-colors", {
  variants: {
    variant: {
      default:
        "bg-white-900 hover:bg-white-800 data-[completed=true]:bg-primary-100 data-[completed=true]:hover:bg-yellow-200",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface StakeStateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stakeStateVariants> {
  completed?: boolean;
}

export const StakeState = ({
  completed,
  variant,
  className,
  ...props
}: StakeStateProps) => {
  return (
    <div
      data-completed={!!completed}
      className={cn(stakeStateVariants({ variant, className }))}
      {...props}
    />
  );
};
