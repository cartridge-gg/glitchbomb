import { cva, type VariantProps } from "class-variance-authority";
import { Action } from "@/components/elements";
import { ArrowDownIcon, ListIcon } from "@/components/icons";
import { type BombDetails, BombSlots } from "./bomb-slots";

export interface GameFooterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gameFooterVariants> {
  details: BombDetails;
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
      <BombSlots details={details} />
      <Action onClick={onRightClick}>
        <ArrowDownIcon />
      </Action>
    </div>
  );
};
