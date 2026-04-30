import {
  GameBalance,
  type GameBalanceProps,
} from "@/components/elements/game-balance";
import { cn } from "@/lib/utils";

export interface GameBalancesProps
  extends React.HTMLAttributes<HTMLDivElement> {
  moonrocks: GameBalanceProps;
  chips: GameBalanceProps;
}

export const GameBalances = ({
  moonrocks,
  chips,
  className,
  ...props
}: GameBalancesProps) => {
  return (
    <div className={cn("flex gap-4", className)} {...props}>
      <GameBalance variant="moonrocks" {...moonrocks} />
      <GameBalance variant="chips" {...chips} />
    </div>
  );
};
