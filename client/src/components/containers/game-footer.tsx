import { cva, type VariantProps } from "class-variance-authority";
import {
  Action,
  BombTracker,
  type BombTrackerProps,
} from "@/components/elements";
import { ArrowDownIcon, ListIcon } from "@/components/icons";

export interface GameFooterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gameFooterVariants> {
  details: BombTrackerProps["details"];
}

const gameFooterVariants = cva("flex gap-6 items-center justify-between", {
  variants: {
    variant: {
      default: "h-[70px] max-w-[420px] mx-auto",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const GameFooter = ({
  details,
  variant,
  className,
  ...props
}: GameFooterProps) => {
  return (
    <div className={gameFooterVariants({ variant, className })} {...props}>
      <Action>
        <ListIcon />
      </Action>
      <BombTracker details={details} />
      <Action>
        <ArrowDownIcon />
      </Action>
    </div>
  );
};
