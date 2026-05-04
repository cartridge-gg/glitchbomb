import { cva, type VariantProps } from "class-variance-authority";
import { AnimatePresence, motion } from "framer-motion";
import { type Ref, useMemo } from "react";
import {
  type BombDetails,
  BombSlots,
  GameBalances,
  GameChoices,
  GameOver,
  type GameOverProps,
  GamePull,
  GameStats,
  type OrbOutcome,
} from "@/components/containers";
import {
  type DistributionValues,
  Outcome,
  PLChartTabs,
  type PLDataPoint,
} from "@/components/elements";
import {
  BagIcon,
  Bomb2xIcon,
  ChipIcon,
  MoonrockIcon,
  StickyBombIcon,
} from "@/components/icons";
import type { OrbPulled } from "@/models";
import { Button } from "../ui/button";
import { GameShop, type GameShopProps } from "./game-shop";

export interface GameSceneGame {
  id: number;
  /** Unix timestamp at which the game ended; 0 = still in progress. */
  over: number;
  level: number;
  health: number;
  points: number;
  milestone: number;
  multiplier: number;
  moonrocks: number;
  chips: number;
  stake: number;
  /** Unix timestamp at which the game expires; 0 = not yet started. */
  expiration: number;
  pullablesCount: number;
  shop: GameShopProps["orbs"];
  bag: GameShopProps["bag"];
  shopPurchaseCounts?: number[];
}

const gameSceneVariants = cva("flex flex-col mx-auto h-full p-4 gap-3", {
  variants: {
    variant: {
      default: "max-w-[420px]",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface GameSceneProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onPull">,
    VariantProps<typeof gameSceneVariants> {
  game: GameSceneGame;
  expired?: boolean;

  plData: PLDataPoint[];
  pulls: OrbPulled[];
  chartGoal?: number;

  distribution: DistributionValues;
  progressiveDistribution: DistributionValues;
  bombDetails: BombDetails;

  currentOrb?: OrbOutcome;
  outcomeKey: number;
  outcomeShowMultiplied: boolean;
  isFatalBomb: boolean;
  isPulling: boolean;
  pointsBurst?: number;

  showRewardOverlay?: boolean;
  showDistributionPercent?: boolean;

  cashOutValue?: number;
  ante?: number;
  nextCurseLabel?: string;
  isEnteringShop?: boolean;
  isCashingOut?: boolean;

  isExitingShop?: boolean;

  tokenPrice?: GameOverProps["tokenPrice"];
  supply?: GameOverProps["supply"];
  target?: GameOverProps["target"];

  pullerRef?: Ref<HTMLDivElement>;
  pointsRef?: Ref<HTMLDivElement>;
  healthRef?: Ref<HTMLDivElement>;
  outcomeRef?: Ref<HTMLDivElement>;

  onPull: () => void;
  onOpenStash: () => void;
  onOpenCashout: () => void;
  onEnterShop: () => void;
  onBuyAndExit: (indices: number[]) => void;
  onShopBalanceChange?: GameShopProps["onBalanceChange"];
  onPlayAgain?: () => void;
}

type Screen = "expired" | "over" | "shop" | "milestone" | "play";

export const GameScene = ({
  game,
  expired = false,
  plData,
  pulls,
  chartGoal,
  distribution,
  progressiveDistribution,
  bombDetails,
  currentOrb,
  outcomeKey,
  outcomeShowMultiplied,
  isFatalBomb,
  isPulling,
  pointsBurst,
  showRewardOverlay = false,
  showDistributionPercent = false,
  cashOutValue,
  ante,
  nextCurseLabel,
  isEnteringShop = false,
  isCashingOut = false,
  isExitingShop = false,
  tokenPrice,
  supply,
  target,
  pullerRef,
  pointsRef,
  healthRef,
  outcomeRef,
  onPull,
  onOpenStash,
  onOpenCashout,
  onEnterShop,
  onBuyAndExit,
  onShopBalanceChange,
  onPlayAgain,
  variant,
  className,
  ...props
}: GameSceneProps) => {
  const screen = useMemo<Screen>(() => {
    if (!game.over && expired) return "expired";
    if (game.over) return "over";
    if (game.shop.length > 0) return "shop";
    const milestoneReached =
      game.points >= game.milestone && game.milestone > 0;
    if (milestoneReached && !currentOrb) return "milestone";
    return "play";
  }, [game, expired, currentOrb]);

  const outcomeHasMultEffect =
    currentOrb?.variant === "point" &&
    currentOrb?.multipliedPoints !== undefined &&
    currentOrb?.activeMultiplier !== undefined &&
    (currentOrb?.activeMultiplier ?? 0) > 1;

  const outcomeContent = useMemo(() => {
    if (!currentOrb) return "";
    if (outcomeHasMultEffect && outcomeShowMultiplied) {
      return `+${currentOrb.multipliedPoints} pts`;
    }
    return currentOrb.content;
  }, [currentOrb, outcomeHasMultEffect, outcomeShowMultiplied]);

  if (screen === "expired") {
    return (
      <GameOver
        level={game.level}
        moonrocksEarned={0}
        plData={plData}
        pulls={pulls}
        cashedOut={false}
        expired
        onPlayAgain={onPlayAgain}
        onOpenStash={onOpenStash}
        health={game.health}
        points={game.points}
        milestone={game.milestone}
      />
    );
  }

  if (screen === "over") {
    // When died (health = 0), moonrocks earned on death (PR #148).
    // When cashed out, game.moonrocks has the full score.
    const cashedOut = game.health > 0;
    return (
      <GameOver
        level={game.level}
        moonrocksEarned={game.moonrocks}
        plData={plData}
        pulls={pulls}
        cashedOut={cashedOut}
        onPlayAgain={onPlayAgain}
        onOpenStash={onOpenStash}
        health={game.health}
        points={game.points}
        milestone={game.milestone}
        stake={game.stake}
        tokenPrice={tokenPrice}
        supply={supply}
        target={target}
      />
    );
  }

  if (screen === "shop") {
    return (
      <GameShop
        balance={game.chips}
        orbs={game.shop}
        bag={game.bag}
        initialPurchaseCounts={game.shopPurchaseCounts}
        onConfirm={onBuyAndExit}
        isLoading={isExitingShop}
        onBalanceChange={onShopBalanceChange}
      />
    );
  }

  return (
    <div className={gameSceneVariants({ variant, className })} {...props}>
      <GameBalances
        moonrocks={{ value: game.moonrocks }}
        chips={{ value: game.chips }}
      />
      {screen === "milestone" ? (
        <div className="flex flex-1 min-h-0 flex-col justify-start gap-[clamp(6px,2svh,18px)] overflow-y-auto overflow-x-hidden pb-[clamp(6px,1.1svh,12px)]">
          <GameStats
            points={game.points}
            milestone={game.milestone}
            health={game.health}
            level={game.level}
          />
          <PLChartTabs
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
      ) : (
        <div className="flex flex-1 min-h-0 flex-col gap-4">
          <div className="flex flex-col gap-3 h-full">
            <GameStats
              points={game.points}
              milestone={game.milestone}
              health={game.health}
              level={game.level}
            />
            {/* PL Chart with outcome overlay */}
            <div className="relative max-h-[100px]">
              <PLChartTabs
                className="h-full overflow-hidden max-h-[100px]"
                data={plData}
                pulls={pulls}
                mode="absolute"
                title="POTENTIAL"
                goal={chartGoal}
              />
              {/* Outcome overlay — shown on chart so puller stays clickable */}
              <AnimatePresence>
                {currentOrb && (
                  <motion.div
                    key={outcomeKey}
                    className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5, y: 20 }}
                      animate={{
                        opacity: 1,
                        scale: isFatalBomb ? 1.4 : 1,
                        y: 0,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: isFatalBomb ? 180 : 400,
                        damping: isFatalBomb ? 10 : 15,
                        mass: isFatalBomb ? 1.5 : 0.8,
                      }}
                    >
                      <div
                        ref={outcomeRef}
                        className="flex flex-col items-center gap-0"
                      >
                        <motion.div
                          animate={
                            outcomeShowMultiplied
                              ? { scale: [1.2, 1], opacity: [0.7, 1] }
                              : { scale: 1 }
                          }
                          transition={{ duration: 0.25, ease: "easeOut" }}
                        >
                          <Outcome
                            content={outcomeContent}
                            variant={currentOrb.variant ?? "default"}
                            size="md"
                          />
                        </motion.div>
                        {/* Multiplier breakdown */}
                        <AnimatePresence>
                          {outcomeHasMultEffect && outcomeShowMultiplied && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.3, y: -4 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 15,
                              }}
                              className="mt-1"
                            >
                              <Outcome
                                content={`${currentOrb.basePoints} × ${currentOrb.activeMultiplier}x`}
                                variant="multiplier"
                                size="sm"
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <GamePull
              pullerRef={pullerRef}
              lives={game.health}
              bombs={distribution.bombs}
              orbs={game.pullablesCount}
              multiplier={game.multiplier}
              values={
                showRewardOverlay ? progressiveDistribution : distribution
              }
              pullLoading={isPulling}
              showPercentages={showDistributionPercent}
              onPull={onPull}
            />
            <div className="flex flex-col gap-3 md:gap-4">
              <BombSlots
                details={bombDetails}
                data-tutorial-id="bomb-tracker"
              />
              <Actions
                onOpenStash={onOpenStash}
                onOpenCashout={onOpenCashout}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const Actions = ({
  onOpenStash,
  onOpenCashout,
}: Pick<GameSceneProps, "onOpenStash" | "onOpenCashout">) => {
  return (
    <div className="flex gap-3 md:gap-4">
      <div className="flex-1" data-tutorial-id="bag-button">
        <Button
          variant="secondary"
          className="w-full h-12"
          onClick={onOpenStash}
        >
          <BagIcon size="sm" />
          <span className="font-secondary text-2xl uppercase">Orbs</span>
        </Button>
      </div>
      <div className="flex-1" data-tutorial-id="cash-out-button">
        <Button
          variant="constructive"
          className="w-full h-12"
          onClick={onOpenCashout}
        >
          <span className="font-secondary text-2xl uppercase">Cash Out</span>
        </Button>
      </div>
    </div>
  );
};
