import { cva, type VariantProps } from "class-variance-authority";
import {
  CashOut,
  Counter,
  GoalTracker,
  Multiplier,
  Score,
} from "@/components/elements";

export interface GameHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gameHeaderVariants> {
  score: number;
  multiplier: number;
  moonrocks: number;
  chips: number;
  milestone: number;
}

const gameHeaderVariants = cva("flex gap-3 items-stretch justify-between", {
  variants: {
    variant: {
      default: "h-20 max-w-[420px] mx-auto",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const GameHeader = ({
  score,
  multiplier,
  moonrocks,
  chips,
  milestone,
  variant,
  className,
  ...props
}: GameHeaderProps) => {
  return (
    <div className={gameHeaderVariants({ variant, className })} {...props}>
      <CashOut />
      <div className="grow flex flex-col justify-between gap-4">
        <div className="flex justify-around items-center">
          <Counter variant="moonrock" balance={moonrocks} />
          <Score value={score} />
          <Counter variant="chip" balance={chips} />
        </div>
        <GoalTracker value={milestone} />
      </div>
      <Multiplier count={multiplier} />
    </div>
  );
};
