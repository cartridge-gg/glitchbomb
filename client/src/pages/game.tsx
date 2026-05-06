import { useNetwork } from "@starknet-react/core";
import { AnimatePresence, motion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Bag,
  ConfirmationDialog,
  type OrbOutcome,
} from "@/components/containers";
import {
  isCashoutConfirmDismissed,
  setCashoutConfirmDismissed,
} from "@/components/containers/confirmation-prefs";
import {
  type DistributionKey,
  type GameChartDataPoint,
  LevelUpOverlay,
  RewardOverlay,
} from "@/components/elements";
import { isRewardOverlayDismissed } from "@/components/elements/reward-overlay-prefs";
import {
  GameOver,
  GameScene,
  type GameSceneGame,
  GameShop,
  type GameShopGame,
} from "@/components/scenes";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { getTokenAddress } from "@/config";
import { usePrices } from "@/contexts/prices";
import { useAppData } from "@/contexts/use-app-data";
import { useEntitiesContext } from "@/contexts/use-entities-context";
import { useLoadingSignal } from "@/contexts/use-loading";
import { tokenPayout, toTokens } from "@/helpers/payout";
import { usePLDataPoints, usePulls } from "@/hooks";
import { useActions } from "@/hooks/actions";
import { useAudio } from "@/hooks/use-audio";
import { useDisplaySettings } from "@/hooks/use-display-settings";
import { milestoneCost } from "@/offline/milestone";
import { createOfflineGame, useOfflineStore } from "@/offline/store";
import { TutorialStep, useTutorial } from "@/tutorial";

// Initial game values for optimistic rendering
const INITIAL_GAME_VALUES = {
  health: 5,
  level: 1,
  points: 0,
  milestone: 12,
  multiplier: 1,
  chips: 0,
  // Initial bag: 4 bombs, 7 other orbs
  distribution: {
    points: 7,
    bombs: 4,
    multipliers: 0,
    health: 0,
    special: 0,
  },
  orbsCount: 11,
};

const NEXT_LEVEL_CURSES: Record<number, string> = {
  4: "Double Bomb",
  6: "Bomberang",
  7: "Double Bomb",
};

export const Game = () => {
  const navigate = useNavigate();
  const { id: idParam } = useParams<{ id: string }>();
  const { pathname } = useLocation();
  const offlineState = useOfflineStore();
  const isPracticeRoute = pathname === "/practice" || pathname === "/tutorial";
  const onchainGameId = useMemo(() => {
    if (isPracticeRoute) return null;
    if (!idParam) return null;
    const parsed = Number.parseInt(idParam, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }, [idParam, isPracticeRoute]);
  const practiceGameId = isPracticeRoute ? offlineState.activeGameId : null;
  const resolvedGameId = onchainGameId ?? practiceGameId;
  const { chain } = useNetwork();
  const { cashOut, pull, enter, buyAndExit } = useActions();
  const { game, config, setGameId } = useEntitiesContext();
  const {
    playOrbSound,
    playFatalBombSound,
    playRewardSound,
    playLevelCompleteSound,
    playLevelStartSound,
    startPulling,
    stopPulling,
    resetOrbPitchProgression,
    startMusic,
  } = useAudio();
  const { displaySettings } = useDisplaySettings();
  const tutorial = useTutorial();

  // Payout chart data
  const tokenAddress = getTokenAddress(chain.id);
  const { tokenContracts } = useAppData();
  const { getGlitchPrice } = usePrices();
  const tokenPrice = useMemo(() => {
    const p = getGlitchPrice();
    return p ? parseFloat(p) : null;
  }, [getGlitchPrice]);

  const tokenContract = useMemo(() => {
    if (!tokenAddress) return undefined;
    return tokenContracts.find(
      (contract) => BigInt(contract.contract_address) === BigInt(tokenAddress),
    );
  }, [tokenContracts, tokenAddress]);
  const supply = useMemo(
    () => BigInt(tokenContract?.total_supply ?? "0"),
    [tokenContract],
  );
  const target = config?.target_supply ?? 0n;

  const cashOutValue = useMemo(() => {
    if (!game || !tokenPrice) return undefined;
    // Include points only when milestone is reached (matches contract behavior)
    const milestoneReached =
      game.points >= game.milestone && game.milestone > 0;
    const score = milestoneReached
      ? game.moonrocks + game.points
      : game.moonrocks;
    if (score <= 0) return undefined;
    const glitch = toTokens(tokenPayout(score, game.stake, supply, target));
    return Number((glitch * tokenPrice).toFixed(2));
  }, [game, tokenPrice, supply, target]);

  const [showCashoutConfirm, setShowCashoutConfirm] = useState(false);
  const [showRewardOverlay, setShowRewardOverlay] = useState(false);
  const moonrocksRef = useRef<HTMLDivElement>(null);
  const pullerRef = useRef<HTMLDivElement>(null);
  const [revealedSegments, setRevealedSegments] = useState<Set<string>>(
    new Set(),
  );
  const rewardShownForGameRef = useRef<number | null>(null);
  const [currentOrb, setCurrentOrb] = useState<OrbOutcome | undefined>(
    undefined,
  );
  const lastPullIdRef = useRef<number | null>(null);
  const pointsRef = useRef<HTMLDivElement>(null);
  const healthRef = useRef<HTMLDivElement>(null);
  // Capture game state at time of pull initiation (before any state updates)
  const prePullMultiplierRef = useRef<number>(1);

  // Outcome overlay state (rendered on PL chart)
  const [outcomeShowMultiplied, setOutcomeShowMultiplied] = useState(false);
  const [flyParticle, setFlyParticle] = useState<{
    label: string;
    variant: "point" | "health";
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);
  const outcomeRef = useRef<HTMLDivElement>(null);
  const [outcomeKey, setOutcomeKey] = useState(0);

  // Loading states for actions
  const [isEnteringShop, setIsEnteringShop] = useState(false);
  const [isExitingShop, setIsExitingShop] = useState(false);
  const [isCashingOut, setIsCashingOut] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [showLevelEnter, setShowLevelEnter] = useState(false);
  // Bag dialog opened from the Game Over scene.
  const [showGameOverStash, setShowGameOverStash] = useState(false);
  const prevLevelRef = useRef<number | null>(null);
  const milestoneShownRef = useRef(false);

  // Death sequence state — delays GameOver to show fatal bomb animation
  const [deathPending, setDeathPending] = useState(false);
  const [isFatalBomb, setIsFatalBomb] = useState(false);
  const gameRef = useRef(game);
  gameRef.current = game;
  const tutorialRef = useRef(tutorial.state);
  tutorialRef.current = tutorial.state;

  const { dataPoints, isPractice } = usePLDataPoints({
    gameId: game?.id ?? 0,
  });

  const { pulls, initialFetchComplete } = usePulls({
    gameId: game?.id ?? 0,
  });

  // Convert PLDataPoint events to graph format
  const plData: GameChartDataPoint[] = useMemo(() => {
    if (dataPoints.length === 0) return [];

    const rawSorted = [...dataPoints].sort((a, b) => a.id - b.id);

    // Fix level marker ordering for onchain data only: the contract's ante
    // ID formula (1 + pull_count*2 + level) adds a level offset that pushes
    // markers after the first pulls of the next level. Offline/practice IDs
    // are sequential and don't need adjustment.
    let sorted: typeof rawSorted;
    if (!isPractice) {
      let levelCount = 0;
      const withKeys = rawSorted.map((point) => {
        if (point.orb === 0) {
          levelCount++;
          return {
            point,
            key: point.id > 0 ? point.id - levelCount - 0.5 : -0.5,
          };
        }
        return { point, key: point.id };
      });
      withKeys.sort((a, b) => a.key - b.key);
      sorted = withKeys.map(({ point }) => point);
    } else {
      sorted = rawSorted;
    }

    // Pair each non-marker data point with the next pull in chronological
    // order. PLDataPoint ids and OrbPulled ids live in different id
    // spaces (the contract uses different ID formulas) so we can't match
    // by id; we walk both sequences in chronological order instead.
    const sortedPulls = [...pulls].sort((a, b) => a.id - b.id);
    let pullCursor = 0;

    return sorted.map((point, index) => {
      const orbType = point.orb;

      // Level cost / game start entries (orb=0) → yellow, no associated pull
      if (orbType === 0) {
        return {
          value: point.potentialMoonrocks,
          variant: "yellow" as const,
          id: point.id,
        };
      }

      // Determine color from orb type
      let variant = point.variant();

      // If value decreased from previous point, override to red
      if (index > 0) {
        const prevValue = sorted[index - 1].potentialMoonrocks;
        if (point.potentialMoonrocks < prevValue) {
          variant = "red";
        }
      }

      // Associate with the next pull in chronological order.
      const matchedPull = sortedPulls[pullCursor];
      pullCursor += 1;

      return {
        value: point.potentialMoonrocks,
        variant,
        id: point.id,
        pullId: matchedPull?.id,
      };
    });
  }, [dataPoints, isPractice, pulls]);

  // Compute goal line for chart: baseMoonrocks + milestone
  // potential_moonrocks already excludes moonrock orb earnings (contract emits before applying)
  const chartGoal = useMemo(() => {
    if (!game) return undefined;
    if (game.over) return undefined;
    // Last chart value reflects current moonrocks (pre-orb-earnings) + points
    // Goal = that baseline + remaining points needed
    const lastValue = plData.length > 0 ? plData[plData.length - 1].value : 0;
    return lastValue - game.points + game.milestone;
  }, [game, plData]);

  // Start glitched music on mount (crossfades from home track)
  useEffect(() => {
    startMusic("glitched");
  }, [startMusic]);

  useEffect(() => {
    if (resolvedGameId === null) return;
    setGameId(resolvedGameId);
    resetOrbPitchProgression();
    lastPullIdRef.current = null;
    prevLevelRef.current = null;
    milestoneShownRef.current = false;
    setCurrentOrb(undefined);
    setIsEnteringShop(false);
    setIsExitingShop(false);
    setIsPulling(false);
    setShowLevelComplete(false);
    setShowLevelEnter(false);
    setShowRewardOverlay(false);
    setRevealedSegments(new Set());
  }, [resolvedGameId, resetOrbPitchProgression, setGameId]);

  // Show reward overlay for fresh games (skip expired ones and tutorial games)
  useEffect(() => {
    // Skip reward overlay during tutorial — go straight to game
    if (tutorial.state.active) return;

    const isExpired =
      game &&
      game.expiration > 0 &&
      game.expiration <= Math.floor(Date.now() / 1000);
    if (
      game &&
      game.level === 1 &&
      game.pull_count === 0 &&
      !game.over &&
      !isExpired &&
      !isRewardOverlayDismissed() &&
      rewardShownForGameRef.current !== game.id
    ) {
      rewardShownForGameRef.current = game.id;
      setShowRewardOverlay(true);
    }
  }, [game, tutorial.state.active]);

  // Reset loading states when data changes
  useEffect(() => {
    if (game?.shop && game.shop.length > 0) {
      // Shop loaded - reset entering shop loading state and close milestone
      setIsEnteringShop(false);
    } else if (game?.shop && game.shop.length === 0) {
      // Shop cleared - reset exiting shop loading state
      setIsExitingShop(false);
    }
  }, [game?.shop]);

  // Close cashout dialog when game ends
  useEffect(() => {
    if (game?.over) {
      setShowCashoutConfirm(false);
      setIsCashingOut(false);
    }
  }, [game?.over]);

  // Tutorial: detect game over.
  // The ref guard fires onGameEnd at most once per game.id; without it the
  // tutorial state mutation triggers a re-render of `tutorial` and the effect
  // would re-enter the body and call onGameEnd in a loop.
  const tutorialGameOverFiredForGameRef = useRef<number | null>(null);
  useEffect(() => {
    if (!tutorial.state.active) return;
    if (!game?.over) return;
    if (tutorialGameOverFiredForGameRef.current === game.id) return;
    tutorialGameOverFiredForGameRef.current = game.id;
    const won = (game.health ?? 0) > 0;
    tutorial.onGameEnd(won);
  }, [game, tutorial]);

  // Detect milestone reached — delay overlay so the winning pull animation plays first
  // During tutorial scripted phase, suppress the built-in overlay (tutorial has its own)
  useEffect(() => {
    if (!game || game.over) return;
    const reached = game.points >= game.milestone && game.milestone > 0;
    if (reached && !milestoneShownRef.current) {
      milestoneShownRef.current = true;
      const inTutorialScripted =
        tutorial.state.active && tutorial.state.step < TutorialStep.FREE_PLAY;
      if (!inTutorialScripted) {
        const timer = setTimeout(() => {
          setShowLevelComplete(true);
          playLevelCompleteSound();
        }, 2300);
        return () => clearTimeout(timer);
      }
    }
  }, [game, tutorial, playLevelCompleteSound]);

  // Detect level-up after exiting shop — show "Entering Level X"
  // Suppress during tutorial scripted phase (tutorial shows its own messages)
  useEffect(() => {
    if (!game) return;
    if (prevLevelRef.current !== null && game.level > prevLevelRef.current) {
      milestoneShownRef.current = false;
      const inTutorialScripted =
        tutorial.state.active && tutorial.state.step < TutorialStep.FREE_PLAY;
      if (!inTutorialScripted) {
        setShowLevelEnter(true);
        playLevelStartSound();
      }
    }
    prevLevelRef.current = game.level;
  }, [game, tutorial, playLevelStartSound]);

  useEffect(() => {
    if (!isPulling) return;
    startPulling();
    const timer = setTimeout(() => {
      setIsPulling(false);
    }, 15000);
    return () => {
      clearTimeout(timer);
      stopPulling();
    };
  }, [isPulling, startPulling, stopPulling]);

  // Read pulls via ref so the init effect below does not re-run on new
  // pulls — that would clobber the next-pull detection useLayoutEffect.
  const pullsRef = useRef(pulls);
  pullsRef.current = pulls;

  // Initialize lastPullIdRef when initial fetch completes.
  // Using 0 as sentinel means any real pull (id >= 1) will trigger animation.
  useEffect(() => {
    if (!initialFetchComplete) return;
    const currentPulls = pullsRef.current;
    if (currentPulls.length === 0) {
      lastPullIdRef.current = 0;
    } else {
      lastPullIdRef.current = Math.max(...currentPulls.map((p) => p.id));
    }
  }, [initialFetchComplete]);

  // Detect new pulls and show outcome animation
  // useLayoutEffect prevents a single-frame flash of GameOver/MilestoneChoice
  // before the outcome animation state is set
  useLayoutEffect(() => {
    // Don't process until we've initialized the lastPullIdRef
    if (lastPullIdRef.current === null) return;
    if (pulls.length === 0) return;

    // Get the latest pull (highest id)
    const latestPull = pulls.reduce((latest, pull) =>
      pull.id > latest.id ? pull : latest,
    );

    // Check if this is a new pull we haven't seen
    if (latestPull.id > lastPullIdRef.current) {
      const orb = latestPull.orb;
      const base = orb.basePoints();
      // Use snapshotted multiplier (captured at pull time, before state updates)
      const mult = prePullMultiplierRef.current;
      const multiplied = base !== null ? Math.floor(base * mult) : null;
      const hasMultEffect =
        base !== null && multiplied !== null && multiplied !== base && mult > 1;

      setCurrentOrb({
        variant: orb.outcomeVariant(),
        content: orb.outcome(),
        basePoints: base ?? undefined,
        multipliedPoints: hasMultEffect ? multiplied : undefined,
        activeMultiplier: hasMultEffect ? mult : undefined,
      });
      setOutcomeKey((prev) => prev + 1);
      setFlyParticle(null);
      setOutcomeShowMultiplied(false);

      // Detect fatal bomb (triggers death sequence instead of immediate GameOver)
      const currentGame = gameRef.current;
      const isFatal =
        orb.isBomb() &&
        currentGame != null &&
        currentGame.over &&
        currentGame.health <= 0;

      if (isFatal) {
        setDeathPending(true);
        setIsFatalBomb(true);
        playFatalBombSound(orb);
      } else {
        setIsFatalBomb(false);
        playOrbSound(orb);
      }

      stopPulling();
      setIsPulling(false);

      lastPullIdRef.current = latestPull.id;

      // Extended duration for fatal bomb (dramatic hold), normal for others
      // Also use longer hold for milestone-reaching pulls so animation is visible
      const isMilestoneReaching =
        currentGame != null &&
        !currentGame.over &&
        currentGame.points >= currentGame.milestone &&
        currentGame.milestone > 0;
      // Shorten animation hold during tutorial scripted phase
      const inTutorialScripted =
        tutorialRef.current.active &&
        tutorialRef.current.step < TutorialStep.FREE_PLAY;
      const clearMs = isFatal
        ? 3000
        : inTutorialScripted
          ? 1200
          : isMilestoneReaching
            ? 2500
            : hasMultEffect
              ? 2500
              : 2000;

      const timer = setTimeout(() => {
        const outcomeEl = outcomeRef.current;
        // Launch flying particle for point orbs → points counter
        if (orb.isPoint()) {
          const targetEl = pointsRef.current;
          if (outcomeEl && targetEl) {
            const startRect = outcomeEl.getBoundingClientRect();
            const endRect = targetEl.getBoundingClientRect();
            const pts = hasMultEffect ? (multiplied ?? 0) : (base ?? 0);
            setFlyParticle({
              label: `+${pts}`,
              variant: "point",
              startX: startRect.left + startRect.width / 2,
              startY: startRect.top + startRect.height / 2,
              endX: endRect.left + endRect.width / 2,
              endY: endRect.top + endRect.height / 2,
            });
          }
        }
        // Launch flying particle for health/bomb orbs → health bar
        if (orb.isHealth() || orb.isBomb()) {
          const targetEl = healthRef.current;
          if (outcomeEl && targetEl) {
            const startRect = outcomeEl.getBoundingClientRect();
            const endRect = targetEl.getBoundingClientRect();
            setFlyParticle({
              label: orb.outcome(),
              variant: "health",
              startX: startRect.left + startRect.width / 2,
              startY: startRect.top + startRect.height / 2,
              endX: endRect.left + endRect.width / 2,
              endY: endRect.top + endRect.height / 2,
            });
          }
        }
        setCurrentOrb(undefined);

        // Clear death sequence after animation completes
        if (isFatal) {
          setDeathPending(false);
          setIsFatalBomb(false);
        }
      }, clearMs);

      return () => clearTimeout(timer);
    }
  }, [pulls, playOrbSound, playFatalBombSound, stopPulling]);

  // Memoize callbacks to prevent unnecessary re-renders
  const handlePull = useCallback(async () => {
    if (!game || isPulling || game.over) return;
    // Block pulls when tutorial overlay is showing (except on pull prompt steps)
    if (tutorial.isPullBlocked) return;
    // Snapshot multiplier before pull (used for outcome display)
    prePullMultiplierRef.current = game.multiplier;
    setIsPulling(true);
    // Get forced orb for tutorial scripted pulls
    const forcedOrbId = tutorial.getForcedOrbId();
    tutorial.onPullInitiated();
    const success = await pull(game.id, forcedOrbId);
    if (!success) {
      setIsPulling(false);
    }
  }, [pull, game, isPulling, tutorial]);

  // Tutorial: advance when pull animation finishes (currentOrb clears)
  const prevOrbRef = useRef<OrbOutcome | undefined>(undefined);
  useEffect(() => {
    if (prevOrbRef.current && !currentOrb) {
      tutorial.onPullAnimationComplete();
    }
    prevOrbRef.current = currentOrb;
  }, [currentOrb, tutorial]);

  // Flying particle → cleanup when it arrives at target
  useEffect(() => {
    if (!flyParticle) return;
    const timer = setTimeout(() => {
      setFlyParticle(null);
    }, 350);
    return () => clearTimeout(timer);
  }, [flyParticle]);

  // Multiplier breakdown timing for outcome overlay on PL chart
  useEffect(() => {
    if (!currentOrb) {
      setOutcomeShowMultiplied(false);
      return;
    }
    const hasMultEffect =
      currentOrb.variant === "point" &&
      currentOrb.multipliedPoints !== undefined &&
      currentOrb.activeMultiplier !== undefined &&
      currentOrb.activeMultiplier > 1;
    if (hasMultEffect) {
      const timer = setTimeout(() => setOutcomeShowMultiplied(true), 600);
      return () => clearTimeout(timer);
    }
    setOutcomeShowMultiplied(false);
  }, [currentOrb]);

  const handleCashOut = useCallback(async () => {
    if (!game) return;
    setIsCashingOut(true);
    const success = await cashOut(game.id);
    if (!success) {
      // User cancelled or error - reset loading state
      setShowCashoutConfirm(false);
      setIsCashingOut(false);
    }
    // On success, keep loading until game.over triggers GameOver render
  }, [cashOut, game]);

  const handleEnterShop = useCallback(async () => {
    if (!game) return;
    // Tutorial: advance past the continue explanation
    if (
      tutorial.state.active &&
      tutorial.state.step === TutorialStep.CONTINUE_EXPLAIN
    ) {
      tutorial.setStep(TutorialStep.ENTER_SHOP_EXPLAIN);
    }
    setIsEnteringShop(true);
    const success = await enter(game.id);
    if (!success) {
      setIsEnteringShop(false);
    }
  }, [enter, game, tutorial]);

  const handleBuyAndExit = useCallback(
    async (indices: number[]) => {
      if (game) {
        if (tutorial.state.active) {
          tutorial.onShopExited();
        }
        setIsExitingShop(true);
        const success = await buyAndExit(game.id, indices);
        if (!success) {
          setIsExitingShop(false);
        }
      }
    },
    [buyAndExit, game, tutorial],
  );

  const openCashout = useCallback(() => {
    if (isCashoutConfirmDismissed()) {
      handleCashOut();
    } else {
      setShowCashoutConfirm(true);
    }
  }, [handleCashOut]);
  const dismissLevelComplete = useCallback(
    () => setShowLevelComplete(false),
    [],
  );
  const dismissLevelEnter = useCallback(() => setShowLevelEnter(false), []);

  // Memoize computed values to prevent recalculation
  const distribution = useMemo(
    () => (game ? game.distribution() : INITIAL_GAME_VALUES.distribution),
    [game],
  );
  const progressiveDistribution = useMemo(() => {
    if (!showRewardOverlay || revealedSegments.size === 0) {
      return {
        points: 0,
        bombs: 0,
        multipliers: 0,
        health: 0,
        special: 0,
      };
    }
    return {
      points: revealedSegments.has("points") ? distribution.points : 0,
      bombs: revealedSegments.has("bombs") ? distribution.bombs : 0,
      multipliers: revealedSegments.has("multipliers")
        ? distribution.multipliers
        : 0,
      health: revealedSegments.has("health") ? distribution.health : 0,
      special: revealedSegments.has("special") ? distribution.special : 0,
    };
  }, [showRewardOverlay, revealedSegments, distribution]);
  const bombDetails = useMemo(
    () =>
      game
        ? game.bombs()
        : {
            simple: {
              total: INITIAL_GAME_VALUES.distribution.bombs,
              count: INITIAL_GAME_VALUES.distribution.bombs,
            },
            double: { total: 0, count: 0 },
            triple: { total: 0, count: 0 },
          },
    [game],
  );
  const nextCurseLabel = useMemo(() => {
    const nextLevel = (game?.level ?? 0) + 1;
    return NEXT_LEVEL_CURSES[nextLevel];
  }, [game?.level]);

  const isGameReady = !!game && tokenContracts.length > 0;
  useLoadingSignal("game", isGameReady);

  const handlePlayAgain = useCallback(() => {
    if (isPractice) {
      createOfflineGame();
      return;
    }
    navigate("/");
  }, [isPractice, navigate]);

  if (resolvedGameId === null) return null;
  if (!isGameReady) return null;

  // Expired: expiration timestamp reached without completion
  const isExpired =
    game.expiration > 0 && game.expiration <= Math.floor(Date.now() / 1000);

  const sceneGame: GameSceneGame = {
    id: game.id,
    level: game.level,
    health: game.health,
    points: game.points,
    milestone: game.milestone,
    multiplier: game.multiplier,
    moonrocks: game.moonrocks,
    chips: game.chips,
    stake: game.stake,
    pullablesCount: game.pullables.length,
    bag: game.bag,
    discards: game.discards,
  };

  // Render GameOver at page level once the game has truly ended (or expired)
  // and the death-sequence animation has finished. During `deathPending` we
  // keep the active game scene so the fatal-bomb animation plays first.
  const showGameOver = !deathPending && (!!game.over || isExpired);
  // When died (health = 0) the contract still credits earned moonrocks.
  // When voluntarily cashed out, game.moonrocks holds the full score.
  const gameOverCashedOut = game.health > 0;

  const shopGame: GameShopGame = {
    chips: game.chips,
    moonrocks: game.moonrocks,
    shop: game.shop,
    bag: game.pullables,
    shopPurchaseCounts: game.shopPurchaseCounts,
  };

  // Show shop scene when shop has orbs, the death sequence isn't running and
  // the game is still active (game over takes precedence over the shop).
  const showShop = !deathPending && !showGameOver && game.shop.length > 0;

  return (
    <motion.div
      className="absolute inset-0 flex flex-col min-h-0"
      animate={
        deathPending
          ? {
              x: [0, -10, 10, -8, 8, -5, 5, -2, 2, 0],
              y: [0, 5, -5, 4, -4, 2, -2, 1, -1, 0],
            }
          : undefined
      }
      transition={deathPending ? { duration: 0.6, ease: "easeOut" } : undefined}
    >
      <div className="flex-1 min-h-0 overflow-hidden pt-0 pb-0">
        {showGameOver ? (
          <div className="h-full md:max-w-[420px] md:mx-auto p-4">
            <GameOver
              moonrocksEarned={game.moonrocks}
              plData={plData}
              pulls={pulls}
              cashedOut={gameOverCashedOut}
              expired={isExpired}
              stake={game.stake}
              tokenPrice={tokenPrice}
              supply={supply}
              target={target}
              onPlayAgain={handlePlayAgain}
              onOpenStash={() => setShowGameOverStash(true)}
            />
          </div>
        ) : showShop ? (
          <GameShop
            game={shopGame}
            onConfirm={handleBuyAndExit}
            isLoading={isExitingShop}
            className="h-full md:max-w-[420px] md:mx-auto p-4 md:p-8"
          />
        ) : (
          <GameScene
            game={sceneGame}
            plData={plData}
            pulls={pulls}
            chartGoal={chartGoal}
            distribution={distribution}
            progressiveDistribution={progressiveDistribution}
            bombDetails={bombDetails}
            currentOrb={currentOrb}
            outcomeKey={outcomeKey}
            outcomeShowMultiplied={outcomeShowMultiplied}
            isFatalBomb={isFatalBomb}
            isPulling={isPulling}
            showRewardOverlay={showRewardOverlay}
            showDistributionPercent={displaySettings.showDistributionPercent}
            cashOutValue={cashOutValue}
            ante={milestoneCost(game.level + 1)}
            nextCurseLabel={nextCurseLabel}
            isEnteringShop={isEnteringShop}
            isCashingOut={isCashingOut}
            pullerRef={pullerRef}
            outcomeRef={outcomeRef}
            onPull={handlePull}
            onOpenCashout={openCashout}
            onEnterShop={handleEnterShop}
          />
        )}
      </div>
      <Dialog open={showGameOverStash} onOpenChange={setShowGameOverStash}>
        <DialogContent className="w-[calc(100%-2rem)] md:w-full rounded-lg border-4 border-primary-600 bg-black-100 md:max-w-[420px] p-6 md:p-6">
          <DialogTitle className="sr-only">Your bag</DialogTitle>
          <Bag
            pendingItems={{ title: "Purchasing (0)", items: [] }}
            bagItems={{
              title: `Your orbs (${game.bag.filter((orb) => !orb.isNone()).length})`,
              items: game.bag
                .filter((orb) => !orb.isNone())
                .map((orb, i) => ({
                  orb,
                  discarded: game.discards?.[i] ?? false,
                })),
            }}
          />
        </DialogContent>
      </Dialog>
      <ConfirmationDialog
        open={showCashoutConfirm}
        onOpenChange={setShowCashoutConfirm}
        title="YOU STILL HAVE CHIPS"
        description="Are you sure you want to Cash Out?"
        confirmLabel="CASH OUT"
        onConfirm={() => {
          handleCashOut();
        }}
        onDismiss={setCashoutConfirmDismissed}
        isConfirming={isCashingOut}
      />
      <RewardOverlay
        open={showRewardOverlay}
        onDismiss={() => setShowRewardOverlay(false)}
        onOrbArrive={(key: DistributionKey) =>
          setRevealedSegments((prev) => new Set([...prev, key]))
        }
        onTakeAll={playRewardSound}
        targetRef={moonrocksRef}
        orbTargetRef={pullerRef}
        reward={{
          variant: "moonrock",
          count: game?.moonrocks ?? 0,
          label: "Moonrocks",
        }}
        orbs={game?.bag ?? []}
      />
      <LevelUpOverlay
        open={showLevelComplete}
        level={game?.level ?? 1}
        variant="complete"
        onDismiss={dismissLevelComplete}
      />
      <LevelUpOverlay
        open={showLevelEnter}
        level={game?.level ?? 1}
        variant="enter"
        onDismiss={dismissLevelEnter}
      />
      {/* Flying particle (points → counter, health/bomb → health bar) */}
      <AnimatePresence>
        {flyParticle && (
          <motion.div
            key={`fly-${flyParticle.variant}-${flyParticle.startX}`}
            className="fixed z-[60] pointer-events-none"
            style={{ left: 0, top: 0 }}
            initial={{
              x: flyParticle.startX,
              y: flyParticle.startY,
              scale: 1,
              opacity: 1,
            }}
            animate={{
              x: flyParticle.endX,
              y: flyParticle.endY,
              scale: 0.5,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <span
              className={`font-rubik text-2xl font-bold ${
                flyParticle.variant === "health"
                  ? "text-pink-400"
                  : "text-green-400"
              }`}
              style={{
                textShadow:
                  flyParticle.variant === "health"
                    ? "0 0 16px rgba(255, 0, 128, 0.8), 0 0 32px rgba(255, 0, 128, 0.4)"
                    : "0 0 16px rgba(74, 222, 128, 0.8), 0 0 32px rgba(74, 222, 128, 0.4)",
                transform: "translate(-50%, -50%)",
                display: "inline-block",
              }}
            >
              {flyParticle.label}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Death sequence — red flash overlay */}
      <AnimatePresence>
        {deathPending && (
          <motion.div
            key="death-flash"
            className="fixed inset-0 z-[100] pointer-events-none"
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.5, ease: "easeOut" }}
            style={{
              background:
                "radial-gradient(circle, rgba(255,50,50,0.8) 0%, rgba(200,0,0,0.6) 40%, rgba(100,0,0,0.2) 100%)",
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
