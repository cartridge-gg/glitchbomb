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
  onLeftClick?: () => void;
  onRightClick: () => void;
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
  onLeftClick,
  onRightClick,
  ...props
}: GameFooterProps) => {
  return (
    <div className={gameFooterVariants({ variant, className })} {...props}>
      <Action onClick={onLeftClick}>
        <ListIcon />
      </Action>
      <BombTracker details={details} />
      <Action onClick={onRightClick}>
        <ArrowDownIcon />
      </Action>
    </div>
  );
};
