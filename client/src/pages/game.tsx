import type ControllerConnector from "@cartridge/connector/controller";
import { useAccount, useNetwork } from "@starknet-react/core";
import { AnimatePresence, motion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ConfirmationDialog,
  GameHeader,
  GameOver,
  GameScene,
  GameShop,
  StashModal,
} from "@/components/containers";
import { LeaderboardScene } from "@/components/scenes";
import {
  isCashoutConfirmDismissed,
  setCashoutConfirmDismissed,
} from "@/components/containers/confirmation-prefs";
import type { OrbOutcome } from "@/components/containers/game-scene";
import {
  BombTracker,
  type DistributionKey,
  GameStats,
  LevelUpOverlay,
  MilestoneChoice,
  Outcome,
  PLChartTabs,
  type PLDataPoint as PLDataPointComponent,
  RewardOverlay,
} from "@/components/elements";
import { isRewardOverlayDismissed } from "@/components/elements/reward-overlay-prefs";
import { BagIcon } from "@/components/icons";
import { GradientBorder } from "@/components/ui/gradient-border";
import { getTokenAddress } from "@/config";
import { useAppData } from "@/contexts/use-app-data";
import { useEntitiesContext } from "@/contexts/use-entities-context";
import { useLoadingSignal } from "@/contexts/use-loading";
import { tokenPayout, toTokens } from "@/helpers/payout";
import { usePLDataPoints, usePulls } from "@/hooks";
import { useActions } from "@/hooks/actions";
import { useAudio } from "@/hooks/use-audio";
import { useControllerUsername } from "@/hooks/use-controller-username";
import { useDisplaySettings } from "@/hooks/use-display-settings";
import { milestoneCost } from "@/offline/milestone";
import { createOfflineGame } from "@/offline/store";
import { TutorialOverlay, TutorialStep, useTutorial } from "@/tutorial";
import { isMobile, mobilePath } from "@/utils/mobile";

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

type OverlayView = "none" | "stash";

export const Game = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { connector } = useAccount();
  const { chain } = useNetwork();
  const { cashOut, pull, enter, buyAndExit } = useActions();
  const { game, config, setGameId } = useEntitiesContext();
  const {
    settings: audioSettings,
    setMusicMuted,
    setSfxMuted,
    setMusicVolume,
    setSfxVolume,
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
  const { displaySettings, setShowDistributionPercent, setStashViewMode } =
    useDisplaySettings();
  const tutorial = useTutorial();
  const { username } = useControllerUsername();

  // Payout chart data
  const tokenAddress = config?.token || getTokenAddress(chain.id);
  const { tokenContracts, tokenPrice } = useAppData();
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

  const formatCashOutValue = useMemo(() => {
    if (!game || !tokenPrice) return undefined;
    // Include points only when milestone is reached (matches contract behavior)
    const milestoneReached =
      game.points >= game.milestone && game.milestone > 0;
    const score = milestoneReached
      ? game.moonrocks + game.points
      : game.moonrocks;
    if (score <= 0) return undefined;
    const glitch = toTokens(tokenPayout(score, game.stake, supply, target));
    return `$${(glitch * tokenPrice).toFixed(2)}`;
  }, [game, tokenPrice, supply, target]);

  const [overlay, setOverlay] = useState<OverlayView>("none");
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showCashoutConfirm, setShowCashoutConfirm] = useState(false);
  const [showRewardOverlay, setShowRewardOverlay] = useState(false);
  const [animateHeaderCount, setAnimateHeaderCount] = useState(false);
  const moonrocksRef = useRef<HTMLDivElement>(null);
  const gameSceneRef = useRef<HTMLDivElement>(null);
  const [revealedSegments, setRevealedSegments] = useState<Set<string>>(
    new Set(),
  );
  const rewardShownForGameRef = useRef<number | null>(null);
  const [shopBalanceOverride, setShopBalanceOverride] = useState<number | null>(
    null,
  );
  const [currentOrb, setCurrentOrb] = useState<OrbOutcome | undefined>(
    undefined,
  );
  const lastPullIdRef = useRef<number | null>(null);
  const pointsRef = useRef<HTMLDivElement>(null);
  const healthRef = useRef<HTMLDivElement>(null);
  const [pointsBurst, setPointsBurst] = useState(0);
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
  const plData: PLDataPointComponent[] = useMemo(() => {
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

    return sorted.map((point, index) => {
      const orbType = point.orb;

      // Level cost / game start entries (orb=0) → yellow
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

      return { value: point.potentialMoonrocks, variant, id: point.id };
    });
  }, [dataPoints, isPractice]);

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

  const onProfileClick = useCallback(() => {
    const controller = (connector as never as ControllerConnector)?.controller;
    if (isMobile) {
      controller?.openSettings();
    } else {
      controller?.openProfile("inventory");
    }
  }, [connector]);

  // Start glitched music on mount (crossfades from home track)
  useEffect(() => {
    startMusic("glitched");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set game ID from URL params
  useEffect(() => {
    const gameId = searchParams.get("game");
    if (gameId) {
      setGameId(Number(gameId));
      resetOrbPitchProgression();
      // Reset all local state when game changes
      lastPullIdRef.current = null;
      prevLevelRef.current = null;
      milestoneShownRef.current = false;
      setCurrentOrb(undefined);
      setOverlay("none");
      setIsEnteringShop(false);
      setIsExitingShop(false);
      setIsPulling(false);
      setShowLevelComplete(false);
      setShowLevelEnter(false);
      setShowRewardOverlay(false);
      setAnimateHeaderCount(false);
      setRevealedSegments(new Set());
    }
  }, [resetOrbPitchProgression, setGameId, searchParams]);

  // Show reward overlay for fresh games (skip expired ones and tutorial games)
  useEffect(() => {
    // Skip reward overlay during tutorial — go straight to game
    if (tutorial.state.active) return;

    const isExpired =
      game &&
      game.created_at > 0 &&
      game.created_at + 86400 <= Math.floor(Date.now() / 1000);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    game?.id,
    game?.level,
    game?.pull_count,
    game?.over,
    tutorial.state.active,
  ]);

  // Reset loading states when data changes
  useEffect(() => {
    if (game?.shop && game.shop.length > 0) {
      // Shop loaded - reset entering shop loading state and close milestone
      setIsEnteringShop(false);
      setOverlay("none");
    } else if (game?.shop && game.shop.length === 0) {
      // Shop cleared - reset exiting shop loading state
      setIsExitingShop(false);
    }
    if (!game?.shop || game.shop.length === 0) {
      setShopBalanceOverride(null);
    }
  }, [game?.shop]);

  // Close cashout dialog when game ends
  useEffect(() => {
    if (game?.over) {
      setShowCashoutConfirm(false);
      setIsCashingOut(false);
    }
  }, [game?.over]);

  // Tutorial: detect game over
  useEffect(() => {
    if (!tutorial.state.active) return;
    if (game?.over) {
      const won = (game?.health ?? 0) > 0;
      tutorial.onGameEnd(won);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.over]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.points, game?.milestone]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.level]);

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

  // Initialize lastPullIdRef when initial fetch completes
  useEffect(() => {
    if (!initialFetchComplete) return;

    // Set to 0 if no existing pulls, otherwise set to the max existing pull id
    // Using 0 as sentinel means any real pull (id >= 1) will trigger animation
    if (pulls.length === 0) {
      lastPullIdRef.current = 0;
    } else {
      const maxId = Math.max(...pulls.map((p) => p.id));
      lastPullIdRef.current = maxId;
    }
    // Only run once when initialFetchComplete becomes true
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      // Trigger burst immediately so bars update at pull time
      if (orb.isPoint()) {
        setPointsBurst((prev) => prev + 1);
      }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOrb]);

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

  // Displayed outcome content (updates when multiplier breakdown reveals)
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

  const openStash = useCallback(() => {
    setOverlay("stash");
    tutorial.onBagOpened();
  }, [tutorial]);
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

  // Bars always reflect actual game state immediately
  const displayedPoints = game?.points ?? 0;
  const displayedHealth = game?.health ?? 0;

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

  const gameIdParam = searchParams.get("game");
  const isGameReady = !!game && tokenContracts.length > 0;
  useLoadingSignal("game", isGameReady);

  const handlePlayAgain = useCallback(() => {
    if (isPractice) {
      const newGameId = createOfflineGame();
      navigate(mobilePath(`/play?game=${newGameId}`));
    } else {
      navigate(mobilePath("/"));
    }
  }, [isPractice, navigate]);

  if (!gameIdParam) return null;
  if (!isGameReady) return null;

  // Determine which screen to show
  const renderScreen = () => {
    // Expired (created_at + 24h has passed without completion)
    const isExpired =
      game.created_at > 0 &&
      game.created_at + 86400 <= Math.floor(Date.now() / 1000);

    if (!game.over && isExpired) {
      return (
        <GameOver
          level={game.level}
          moonrocksEarned={0}
          plData={plData}
          pulls={pulls}
          cashedOut={false}
          expired={true}
          onPlayAgain={handlePlayAgain}
          onOpenStash={openStash}
          health={game.health}
          points={game.points}
          milestone={game.milestone}
        />
      );
    }

    // Game over (terminal state) — delayed during death sequence so bomb animation plays
    if (game.over && !deathPending) {
      const cashedOut = game.health > 0;
      // When died (health = 0), moonrocks earned on death (from recent PR #148)
      // When cashed out, game.moonrocks has the full score
      const moonrocksEarned = game.moonrocks;

      return (
        <GameOver
          level={game.level}
          moonrocksEarned={moonrocksEarned}
          plData={plData}
          pulls={pulls}
          cashedOut={cashedOut}
          onPlayAgain={handlePlayAgain}
          onOpenStash={openStash}
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

    // Priority 2: Shop (when shop has items)
    if (game.shop.length > 0) {
      return (
        <GameShop
          balance={game.chips}
          orbs={game.shop}
          bag={game.pullables}
          initialPurchaseCounts={game.shopPurchaseCounts}
          onConfirm={handleBuyAndExit}
          isLoading={isExitingShop}
          onBalanceChange={(bal) => {
            setShopBalanceOverride(bal);
            // Tutorial: detect first orb added to cart (balance dropped)
            if (bal < game.chips) tutorial.onOrbBought();
          }}
        />
      );
    }

    // Check if milestone reached
    const milestoneReached = game.points >= game.milestone;

    // Main gameplay view - inlined to prevent remount on re-render
    return (
      <div className="flex min-h-full flex-col max-w-[420px] mx-auto px-4 pb-[clamp(6px,1.1svh,12px)]">
        {milestoneReached && !currentOrb ? (
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
              <MilestoneChoice
                moonrocks={game.moonrocks}
                points={game.points}
                ante={milestoneCost(game.level + 1)}
                cashOutValue={formatCashOutValue}
                onCashOut={openCashout}
                onEnterShop={handleEnterShop}
                isEnteringShop={isEnteringShop}
                isCashingOut={isCashingOut}
                nextCurseLabel={nextCurseLabel}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col">
            <div className="flex flex-1 min-h-0 flex-col gap-[clamp(6px,2svh,18px)]">
              <GameStats
                points={displayedPoints}
                milestone={game.milestone}
                health={displayedHealth}
                level={game.level}
                pointsBurst={pointsBurst}
                pointsRef={pointsRef}
                healthRef={healthRef}
              />
              {/* PL Chart with outcome overlay */}
              <div className="relative">
                <PLChartTabs
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
              <GameScene
                className="mt-[clamp(16px,2.4svh,28px)] min-h-[clamp(220px,40svh,340px)] h-full flex-1"
                sceneRef={gameSceneRef}
                lives={game.health}
                bombs={distribution.bombs}
                orbs={game.pullables.length}
                multiplier={game.multiplier}
                values={
                  showRewardOverlay ? progressiveDistribution : distribution
                }
                pullLoading={isPulling}
                showPercentages={displaySettings.showDistributionPercent}
                onPull={handlePull}
              />
            </div>
            <div className="flex items-center justify-center pb-[clamp(2px,0.6svh,6px)]">
              <BombTracker details={bombDetails} size="lg" />
            </div>
            <div className="pt-[clamp(4px,0.8svh,8px)] pb-[clamp(4px,0.8svh,8px)] flex items-stretch gap-[clamp(8px,2.4svh,20px)]">
              <div className="flex-1" data-tutorial-id="bag-button">
                <GradientBorder color="green" className="w-full">
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-2 min-h-[clamp(40px,6svh,56px)] font-secondary text-[clamp(0.65rem,1.5svh,0.875rem)] tracking-widest text-green-400 rounded-lg transition-all duration-200 hover:brightness-110 bg-[#0D2518]"
                    onClick={openStash}
                  >
                    <BagIcon className="w-5 h-5" />
                    ORBS
                  </button>
                </GradientBorder>
              </div>
              <div className="flex-1" data-tutorial-id="cash-out-button">
                <GradientBorder color="green" className="w-full">
                  <button
                    type="button"
                    className="w-full flex items-center justify-center min-h-[clamp(40px,6svh,56px)] font-secondary text-[clamp(0.65rem,1.5svh,0.875rem)] tracking-widest text-green-400 rounded-lg transition-all duration-200 hover:brightness-110 bg-[#0D2518]"
                    onClick={openCashout}
                  >
                    CASH OUT
                  </button>
                </GradientBorder>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

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
      <GameHeader
        moonrocks={game?.moonrocks ?? 100}
        chips={shopBalanceOverride ?? game?.chips ?? INITIAL_GAME_VALUES.chips}
        username={username}
        moonrocksRef={moonrocksRef}
        animateCount={animateHeaderCount}
        rewardOverlayOpen={showRewardOverlay}
        audioSettings={audioSettings}
        onMusicMutedChange={setMusicMuted}
        onSfxMutedChange={setSfxMuted}
        onMusicVolumeChange={setMusicVolume}
        onSfxVolumeChange={setSfxVolume}
        showDistributionPercent={displaySettings.showDistributionPercent}
        onShowDistributionPercentChange={setShowDistributionPercent}
        stashViewMode={displaySettings.stashViewMode}
        onStashViewModeChange={setStashViewMode}
        onProfileClick={onProfileClick}
        onLeaderboard={() => setShowLeaderboard(!showLeaderboard)}
      />
      <div className="flex-1 min-h-0 overflow-hidden pt-0 pb-0">
        {renderScreen()}
      </div>
      <StashModal
        open={overlay === "stash"}
        onOpenChange={(open) => {
          setOverlay(open ? "stash" : "none");
          if (!open) tutorial.onBagClosed();
        }}
        orbs={game?.bag ?? []}
        discards={game?.discards ?? []}
        viewMode={displaySettings.stashViewMode}
      />
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
      {showLeaderboard && (
        <div className="absolute inset-0 z-50 flex-1 bg-black/70 backdrop-blur-[4px]">
          <div className="absolute inset-0 z-50 m-2 md:m-6 flex-1">
            <LeaderboardScene
              rows={[]}
              onClose={() => setShowLeaderboard(false)}
              className="h-full"
            />
          </div>
        </div>
      )}
      <RewardOverlay
        open={showRewardOverlay}
        onDismiss={() => {
          setShowRewardOverlay(false);
          setAnimateHeaderCount(false);
        }}
        onAnimationStart={() => setAnimateHeaderCount(true)}
        onOrbArrive={(key: DistributionKey) =>
          setRevealedSegments((prev) => new Set([...prev, key]))
        }
        onTakeAll={playRewardSound}
        targetRef={moonrocksRef}
        orbTargetRef={gameSceneRef}
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
      <TutorialOverlay />
    </motion.div>
  );
};
