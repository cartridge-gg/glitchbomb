import { cva, type VariantProps } from "class-variance-authority";
import { GamePoints } from "@/components/elements/game-points";
import { GameStat } from "@/components/elements/game-stat";
import { cn } from "@/lib/utils";

const gameStatsVariants = cva("flex items-center gap-2", {
  variants: {
    variant: {
      default: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface GameStatsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gameStatsVariants> {
  points: number;
  milestone: number;
  health: number;
  maxHealth?: number;
  level: number;
}

export const GameStats = ({
  points,
  milestone,
  health,
  maxHealth = 5,
  level,
  variant,
  className,
  ...props
}: GameStatsProps) => {
  return (
    <div className={cn(gameStatsVariants({ variant, className }))} {...props}>
      <div data-tutorial-id="health-bar" className="flex-1">
        <GameStat variant="health" value={health} max={maxHealth} />
      </div>
      <div data-tutorial-id="points-display" className="flex-1">
        <GamePoints points={points} level={level} />
      </div>
      <div data-tutorial-id="goal-bar" className="flex-1">
        <GameStat
          variant="goal"
          value={milestone}
          count={points}
          max={milestone}
        />
      </div>
    </div>
  );
};
