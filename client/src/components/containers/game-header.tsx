import { cva, type VariantProps } from "class-variance-authority";
import {
  Action,
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

const gameHeaderVariants = cva("flex gap-6 items-stretch justify-between", {
  variants: {
    variant: {
      default: "h-[76px] max-w-[420px] mx-auto",
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
      <Action>
        <p>
          Cash
          <br />
          Out
        </p>
      </Action>
      <div className="flex flex-col justify-between min-w-[152px]">
        <div className="flex justify-around items-center">
          <Counter variant="moonrock" balance={moonrocks} />
          <Score value={score} />
          <Counter variant="chip" balance={chips} />
        </div>
        <GoalTracker value={score} total={milestone} />
      </div>
      <Multiplier className="flex-1 min-w-0 shrink" count={multiplier} />
    </div>
  );
};
