import { cva, type VariantProps } from "class-variance-authority";
import { AnimatePresence, motion } from "framer-motion";
import { type Ref, useMemo, useState } from "react";
import {
  Bag,
  type BombDetails,
  BombSlots,
  GameBalances,
  GamePull,
  GameStats,
  type OrbOutcome,
} from "@/components/containers";
import {
  type DistributionValues,
  GameChart,
  type GameChartDataPoint,
  Outcome,
} from "@/components/elements";
import { BagIcon } from "@/components/icons";
import type { Orb, OrbPulled } from "@/models";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";

export interface GameSceneGame {
  id: number;
  level: number;
  health: number;
  points: number;
  milestone: number;
  multiplier: number;
  moonrocks: number;
  chips: number;
  stake: number;
  pullablesCount: number;
  bag: Orb[];
  discards?: boolean[];
}

const gameSceneVariants = cva("flex flex-col gap-3", {
  variants: {
    variant: {
      default: "h-full min-h-0 mx-auto p-4",
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

  plData: GameChartDataPoint[];
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

  showRewardOverlay?: boolean;
  showDistributionPercent?: boolean;

  pullerRef?: Ref<HTMLDivElement>;
  outcomeRef?: Ref<HTMLDivElement>;

  onPull: () => void;
  onOpenCashout: () => void;
}

export const GameScene = ({
  game,
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
  showRewardOverlay = false,
  showDistributionPercent = false,
  pullerRef,
  outcomeRef,
  onPull,
  onOpenCashout,
  variant,
  className,
  ...props
}: GameSceneProps) => {
  const [showStash, setShowStash] = useState(false);
  const openStash = () => setShowStash(true);

  const bagOrbs = useMemo(
    () => game.bag.filter((orb) => !orb.isNone()),
    [game.bag],
  );

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

  return (
    <div className={gameSceneVariants({ variant, className })} {...props}>
      <GameBalances
        moonrocks={{ value: game.moonrocks }}
        chips={{ value: game.chips }}
      />
      <div className="flex flex-1 min-h-0 flex-col gap-4">
        <div className="flex flex-col gap-3 h-full">
          <GameStats
            points={game.points}
            milestone={game.milestone}
            health={game.health}
            level={game.level}
          />
          {/* PL Chart with outcome overlay */}
          <div className="relative">
            <GameChart
              className="min-h-[140px] max-h-[140px]"
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
            values={showRewardOverlay ? progressiveDistribution : distribution}
            pullLoading={isPulling}
            showPercentages={showDistributionPercent}
            onPull={onPull}
          />
          <div className="flex flex-col gap-3 md:gap-4">
            <BombSlots details={bombDetails} data-tutorial-id="bomb-tracker" />
            <Actions onOpenStash={openStash} onOpenCashout={onOpenCashout} />
          </div>
        </div>
      </div>
      <BagDialog
        open={showStash}
        onOpenChange={setShowStash}
        orbs={bagOrbs}
        discards={game.discards}
      />
    </div>
  );
};

interface BagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orbs: Orb[];
  discards?: boolean[];
}

const BagDialog = ({ open, onOpenChange, orbs, discards }: BagDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="w-[calc(100%-2rem)] md:w-full rounded-lg border-4 border-primary-600 bg-black-100 md:max-w-[420px] p-6 md:p-6">
      <DialogTitle className="sr-only">Your bag</DialogTitle>
      <Bag
        pendingItems={{
          title: "Purchasing (0)",
          items: [],
        }}
        bagItems={{
          title: `Your orbs (${orbs.length})`,
          items: orbs.map((orb, i) => ({
            orb,
            discarded: discards?.[i] ?? false,
          })),
        }}
      />
    </DialogContent>
  </Dialog>
);

export interface ActionsProps {
  onOpenStash: () => void;
  onOpenCashout: () => void;
}

export const Actions = ({ onOpenStash, onOpenCashout }: ActionsProps) => {
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
