import { cva, type VariantProps } from "class-variance-authority";
import { GameBalances, GameChoices, GameStats } from "@/components/containers";
import { GameChart, type GameChartDataPoint } from "@/components/elements";
import {
  Bomb2xIcon,
  ChipIcon,
  MoonrockIcon,
  StickyBombIcon,
} from "@/components/icons";
import type { OrbPulled } from "@/models";

export interface GameMilestoneSceneGame {
  level: number;
  health: number;
  points: number;
  milestone: number;
  moonrocks: number;
  chips: number;
}

const gameMilestoneSceneVariants = cva("flex flex-col gap-3", {
  variants: {
    variant: {
      default: "h-full min-h-0 mx-auto p-4",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface GameMilestoneSceneProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gameMilestoneSceneVariants> {
  game: GameMilestoneSceneGame;

  plData: GameChartDataPoint[];
  pulls: OrbPulled[];
  chartGoal?: number;

  cashOutValue?: number;
  ante?: number;
  nextCurseLabel?: string;
  isEnteringShop?: boolean;
  isCashingOut?: boolean;

  onOpenCashout: () => void;
  onEnterShop: () => void;
}

export const GameMilestoneScene = ({
  game,
  plData,
  pulls,
  chartGoal,
  cashOutValue,
  ante,
  nextCurseLabel,
  isEnteringShop = false,
  isCashingOut = false,
  onOpenCashout,
  onEnterShop,
  variant,
  className,
  ...props
}: GameMilestoneSceneProps) => {
  return (
    <div
      className={gameMilestoneSceneVariants({ variant, className })}
      {...props}
    >
      <GameBalances
        moonrocks={{ value: game.moonrocks }}
        chips={{ value: game.chips }}
      />
      <div className="flex flex-1 min-h-0 flex-col justify-start gap-4 md:gap-6">
        <GameStats
          points={game.points}
          milestone={game.milestone}
          health={game.health}
          level={game.level}
        />
        <GameChart
          className="min-h-[140px] max-h-[140px]"
          data={plData}
          pulls={pulls}
          mode="absolute"
          title="POTENTIAL"
          goal={chartGoal}
        />
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <GameChoices
            className="h-full"
            continue={{
              value: ante ?? 0,
              details: [
                {
                  category: "chips",
                  icon: <ChipIcon size="md" />,
                  value: `+${game.points}`,
                  label: "Chips",
                },
                ...(nextCurseLabel
                  ? [
                      {
                        category: "curse" as const,
                        icon:
                          nextCurseLabel === "Bomberang" ? (
                            <StickyBombIcon className="w-6 h-6 glitch-icon" />
                          ) : (
                            <Bomb2xIcon className="w-6 h-6 glitch-icon" />
                          ),
                        value: "",
                        label:
                          nextCurseLabel === "Bomberang"
                            ? "Bomberang"
                            : "2x Bomb",
                      },
                    ]
                  : []),
              ],
              onClick: onEnterShop,
              disabled: isEnteringShop || isCashingOut,
              loading: isEnteringShop,
              "data-tutorial-id": "continue-button",
            }}
            cashOut={{
              value: cashOutValue ?? 0,
              details: [
                {
                  category: "moonrocks",
                  icon: <MoonrockIcon size="md" />,
                  value: String(game.moonrocks + game.points),
                  label: "Moon Rocks",
                },
              ],
              onClick: onOpenCashout,
              disabled: isEnteringShop || isCashingOut,
              loading: isCashingOut,
            }}
          />
        </div>
      </div>
    </div>
  );
};
