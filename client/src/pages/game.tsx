import type ControllerConnector from "@cartridge/connector/controller";
import { useAccount, useNetwork } from "@starknet-react/core";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ConfirmationDialog,
  GameHeader,
  GameOver,
  GameScene,
  GameShop,
  StashModal,
} from "@/components/containers";
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
import { Button } from "@/components/ui/button";
import { GradientBorder } from "@/components/ui/gradient-border";
import { getTokenAddress } from "@/config";
import { useEntitiesContext } from "@/contexts/use-entities-context";
import { cumulativeRewards, toTokens } from "@/helpers/payout";
import { usePLDataPoints, usePulls } from "@/hooks";
import { useActions } from "@/hooks/actions";
import { useTokenPrice } from "@/hooks/token-price";
import { useTokens } from "@/hooks/tokens";
import { useAudio } from "@/hooks/use-audio";
import { useDisplaySettings } from "@/hooks/use-display-settings";
import { OrbType } from "@/models/orb";
import { milestoneCost } from "@/offline/milestone";
import { mobilePath } from "@/utils/mobile";

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
  6: "Sticky Bomb",
  7: "Double Bomb",
};

type OverlayView = "none" | "stash";

export const Game = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { account, connector } = useAccount();
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
    playRewardSound,
    playLevelCompleteSound,
    playLevelStartSound,
    startPulling,
    stopPulling,
    startMusic,
  } = useAudio();
  const { displaySettings, setShowDistributionPercent, setStashViewMode } =
    useDisplaySettings();

  // Payout chart data
  const tokenAddress = config?.token || getTokenAddress(chain.id);
  const glitchAddress = getTokenAddress(chain.id);
  const { price: tokenPrice } = useTokenPrice(
    glitchAddress,
    config?.quote,
    chain.id.toString(),
  );
  const { tokenContracts } = useTokens({
    accountAddresses: account?.address ? [account.address] : [],
    contractAddresses: [tokenAddress],
  });
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
    const score = game.moonrocks + game.points;
    if (score <= 0) return undefined;
    const rewards = cumulativeRewards(game.stake, supply, target);
    const glitch = toTokens(rewards[Math.min(score, rewards.length) - 1] || 0);
    return `$${(glitch * tokenPrice).toFixed(2)}`;
  }, [game, tokenPrice, supply, target]);

  const [overlay, setOverlay] = useState<OverlayView>("none");
  const [showCashoutConfirm, setShowCashoutConfirm] = useState(false);
  const [showRewardOverlay, setShowRewardOverlay] = useState(false);
  const [animateHeaderCount, setAnimateHeaderCount] = useState(false);
  const moonrocksRef = useRef<HTMLDivElement>(null);
  const gameSceneRef = useRef<HTMLDivElement>(null);
  const [revealedSegments, setRevealedSegments] = useState<Set<string>>(
    new Set(),
  );
  const rewardShownForGameRef = useRef<number | null>(null);
  const [username, setUsername] = useState<string>();
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
  // Hold displayed values at pre-pull value until flying animation arrives
  const [heldPoints, setHeldPoints] = useState<number | null>(null);
  const [heldHealth, setHeldHealth] = useState<number | null>(null);
  // Capture game state at time of pull initiation (before any state updates)
  const prePullPointsRef = useRef<number | null>(null);
  const prePullHealthRef = useRef<number | null>(null);
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

  const { dataPoints } = usePLDataPoints({
    gameId: game?.id ?? 0,
  });

  const { pulls, initialFetchComplete } = usePulls({
    gameId: game?.id ?? 0,
  });

  // Convert PLDataPoint events to graph format
  const plData: PLDataPointComponent[] = useMemo(() => {
    if (dataPoints.length === 0) return [];

    const sorted = [...dataPoints].sort((a, b) => a.id - b.id);

    return sorted.map((point, index) => {
      const orbType = point.orb;

      // Level cost / game start entries (orb=0) → grey
      if (orbType === 0) {
        return {
          value: point.potentialMoonrocks,
          variant: "grey" as const,
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
  }, [dataPoints]);

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

  // Fetch username from controller
  useEffect(() => {
    if (!connector) return;
    (connector as never as ControllerConnector).controller
      .username()
      ?.then((name) => setUsername(name));
  }, [connector]);

  const onProfileClick = useCallback(() => {
    (connector as never as ControllerConnector)?.controller.openProfile(
      "inventory",
    );
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
      setHeldHealth(null);
      prePullHealthRef.current = null;
    }
  }, [setGameId, searchParams]);

  // Show reward overlay for fresh games (skip expired ones)
  useEffect(() => {
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
  }, [game?.id, game?.level, game?.pull_count, game?.over]);

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

  // Detect milestone reached — show "Level X Complete" before MilestoneChoice
  useEffect(() => {
    if (!game || game.over) return;
    const reached = game.points >= game.milestone && game.milestone > 0;
    if (reached && !milestoneShownRef.current) {
      milestoneShownRef.current = true;
      setShowLevelComplete(true);
      playLevelCompleteSound();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.points, game?.milestone]);

  // Detect level-up after exiting shop — show "Entering Level X"
  useEffect(() => {
    if (!game) return;
    if (prevLevelRef.current !== null && game.level > prevLevelRef.current) {
      milestoneShownRef.current = false;
      setShowLevelEnter(true);
      playLevelStartSound();
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

  // Keep a ref to current game for reading inside pull detection without re-triggering
  const gameRef = useRef(game);
  gameRef.current = game;

  // Detect new pulls and show outcome animation
  useEffect(() => {
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
      const currentGame = gameRef.current;
      const base = orb.basePoints();
      // Use snapshotted multiplier (captured at pull time, before state updates)
      const mult = prePullMultiplierRef.current;
      const multiplied = base !== null ? Math.floor(base * mult) : null;
      const hasMultEffect =
        base !== null && multiplied !== null && multiplied !== base && mult > 1;

      // Hold displayed values at pre-pull value until flying animation arrives
      if (orb.isPoint()) {
        setHeldPoints(prePullPointsRef.current ?? currentGame?.points ?? 0);
      }
      if (orb.isHealth() || orb.isBomb()) {
        setHeldHealth(prePullHealthRef.current ?? currentGame?.health ?? 0);
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
      // Skip orb sound if this pull triggered milestone (level complete sound plays instead)
      if (!milestoneShownRef.current) {
        playOrbSound(orb);
      }
      stopPulling();
      setIsPulling(false);

      lastPullIdRef.current = latestPull.id;

      // Clear after animation — launch flying particle first
      const clearMs = hasMultEffect ? 2500 : 2000;
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
        // Held values are released when the flying particle arrives (handlePointsArrive / health callback).
        // Only release here as a safety fallback for non-point/non-health orbs.
        if (!orb.isPoint()) {
          setHeldPoints(null);
          prePullPointsRef.current = null;
        }
        if (!orb.isHealth() && !orb.isBomb()) {
          setHeldHealth(null);
          prePullHealthRef.current = null;
        }
      }, clearMs);

      return () => clearTimeout(timer);
    }
  }, [pulls, playOrbSound, stopPulling]);

  // Memoize callbacks to prevent unnecessary re-renders
  const handlePull = useCallback(async () => {
    if (!game || isPulling) return;
    // Snapshot state before pull for held-display during animation
    prePullPointsRef.current = game.points;
    prePullHealthRef.current = game.health;
    prePullMultiplierRef.current = game.multiplier;
    setIsPulling(true);
    const success = await pull(game.id);
    if (!success) {
      setIsPulling(false);
      prePullPointsRef.current = null;
      prePullHealthRef.current = null;
    }
  }, [pull, game, isPulling]);

  const handlePointsArrive = useCallback(() => {
    // Release held points → GlitchText burst transition to new value
    setHeldPoints(null);
    prePullPointsRef.current = null;
    setPointsBurst((prev) => prev + 1);
  }, []);

  // Flying particle → target counter callback
  useEffect(() => {
    if (!flyParticle) return;
    const timer = setTimeout(() => {
      if (flyParticle.variant === "point") {
        handlePointsArrive();
      } else if (flyParticle.variant === "health") {
        setHeldHealth(null);
        prePullHealthRef.current = null;
      }
      setFlyParticle(null);
    }, 350);
    return () => clearTimeout(timer);
  }, [flyParticle, handlePointsArrive]);

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
    if (success) {
      setOverlay("none");
    }
    setIsCashingOut(false);
  }, [cashOut, game]);

  const handleEnterShop = useCallback(async () => {
    if (!game) return;
    setIsEnteringShop(true);
    const success = await enter(game.id);
    if (!success) {
      // User cancelled or error - reset loading state
      setIsEnteringShop(false);
    }
    // On success, don't close overlay - wait for shop to load
  }, [enter, game]);

  const handleBuyAndExit = useCallback(
    async (indices: number[]) => {
      if (game) {
        setIsExitingShop(true);
        const success = await buyAndExit(game.id, indices);
        if (!success) {
          // User cancelled or error - reset loading state
          setIsExitingShop(false);
        }
        // On success, wait for shop to clear via useEffect
      }
    },
    [buyAndExit, game],
  );

  const openStash = useCallback(() => setOverlay("stash"), []);
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

  // Displayed values: held at pre-pull value during fly animation, otherwise actual
  const displayedPoints =
    heldPoints !== null ? heldPoints : (game?.points ?? 0);
  const displayedHealth =
    heldHealth !== null ? heldHealth : (game?.health ?? 0);

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
  const hasStickyBomb = useMemo(
    () => game?.bag?.some((orb) => orb.value === OrbType.StickyBomb) ?? false,
    [game?.bag],
  );
  const nextCurseLabel = useMemo(() => {
    const nextLevel = (game?.level ?? 0) + 1;
    return NEXT_LEVEL_CURSES[nextLevel];
  }, [game?.level]);
  const hasCurse = hasStickyBomb;
  const curseLabel = hasStickyBomb ? "Sticky Bomb" : undefined;

  // Check if we're still loading (have URL params but no data yet)
  const isLoading = !game;
  const gameIdParam = searchParams.get("game");

  // If no URL params at all, show nothing
  if (!gameIdParam) return null;

  // Determine which screen to show
  const renderScreen = () => {
    // Loading state - show optimistic UI
    if (isLoading) {
      return (
        <div className="flex min-h-full flex-col max-w-[420px] mx-auto px-4 pb-[clamp(6px,1.1svh,12px)]">
          <div className="flex flex-1 flex-col">
            <div className="flex flex-1 min-h-0 flex-col justify-center gap-[clamp(6px,2svh,18px)]">
              <GameStats
                points={INITIAL_GAME_VALUES.points}
                milestone={INITIAL_GAME_VALUES.milestone}
                health={INITIAL_GAME_VALUES.health}
                level={INITIAL_GAME_VALUES.level}
              />
              <PLChartTabs
                data={[]}
                pulls={[]}
                mode="absolute"
                title="POTENTIAL"
              />
              <GameScene
                className="mt-[clamp(6px,1svh,12px)] min-h-[clamp(220px,40svh,340px)] h-full flex-1"
                lives={INITIAL_GAME_VALUES.health}
                bombs={INITIAL_GAME_VALUES.distribution.bombs}
                orbs={INITIAL_GAME_VALUES.orbsCount}
                multiplier={INITIAL_GAME_VALUES.multiplier}
                values={INITIAL_GAME_VALUES.distribution}
                hasCurse={false}
                showPercentages={displaySettings.showDistributionPercent}
                onPull={() => {}} // No-op while loading
              />
            </div>
            <div className="flex items-center justify-center pb-[clamp(4px,1svh,10px)] opacity-50">
              <BombTracker details={bombDetails} size="lg" />
            </div>
            <div className="pt-[clamp(6px,1.1svh,12px)] flex items-stretch gap-[clamp(8px,2.4svh,20px)] opacity-50 pointer-events-none">
              <Button
                variant="secondary"
                gradient="green"
                className="min-h-[clamp(40px,6svh,56px)] min-w-16"
                disabled
              >
                <BagIcon className="w-6 h-6 text-green-400" />
              </Button>
              <GradientBorder color="purple" className="flex-1">
                <button
                  type="button"
                  disabled
                  className="w-full min-h-[clamp(40px,6svh,56px)] font-secondary text-[clamp(0.65rem,1.5svh,0.875rem)] tracking-widest rounded-lg"
                  style={{
                    background:
                      "linear-gradient(180deg, #4A1A6B 0%, #2D1052 100%)",
                    color: "#FF80FF",
                  }}
                >
                  LOADING...
                </button>
              </GradientBorder>
            </div>
          </div>
        </div>
      );
    }

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
          onPlayAgain={() => navigate(mobilePath("/"))}
        />
      );
    }

    // Game over (terminal state) - both view mode and immediate game over
    if (game.over) {
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
          onPlayAgain={() => navigate(mobilePath("/"))}
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
          onBalanceChange={setShopBalanceOverride}
        />
      );
    }

    // Check if milestone reached
    const milestoneReached = game.points >= game.milestone;

    // Main gameplay view - inlined to prevent remount on re-render
    return (
      <div className="flex min-h-full flex-col max-w-[420px] mx-auto px-4 pb-[clamp(6px,1.1svh,12px)]">
        {milestoneReached ? (
          <div className="flex flex-1 min-h-0 flex-col justify-start gap-[clamp(6px,2svh,18px)] overflow-y-auto pb-[clamp(6px,1.1svh,12px)]">
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
                ante={game.level === 1 ? 0 : milestoneCost(game.level + 1)}
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
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 15,
                          mass: 0.8,
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
                hasCurse={hasCurse}
                curseLabel={curseLabel}
                pullLoading={isPulling}
                showPercentages={displaySettings.showDistributionPercent}
                onPull={handlePull}
              />
            </div>
            <div className="flex items-center justify-center pb-[clamp(2px,0.6svh,6px)]">
              <BombTracker details={bombDetails} size="lg" />
            </div>
            <div className="pt-[clamp(4px,0.8svh,8px)] pb-[clamp(4px,0.8svh,8px)] flex items-stretch gap-[clamp(8px,2.4svh,20px)]">
              <GradientBorder color="green" className="flex-1">
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 min-h-[clamp(40px,6svh,56px)] font-secondary text-[clamp(0.65rem,1.5svh,0.875rem)] tracking-widest text-green-400 rounded-lg transition-all duration-200 hover:brightness-110 bg-[#0D2518]"
                  onClick={openStash}
                >
                  <BagIcon className="w-5 h-5" />
                  ORBS
                </button>
              </GradientBorder>
              <GradientBorder color="yellow" className="flex-1">
                <button
                  type="button"
                  className="w-full flex items-center justify-center min-h-[clamp(40px,6svh,56px)] font-secondary text-[clamp(0.65rem,1.5svh,0.875rem)] tracking-widest text-yellow-400 rounded-lg transition-all duration-200 hover:brightness-110 bg-[#302A10]"
                  onClick={openCashout}
                >
                  CASH OUT
                </button>
              </GradientBorder>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="absolute inset-0 flex flex-col min-h-0">
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
      />
      <div className="flex-1 min-h-0 overflow-hidden pt-0 pb-0">
        {renderScreen()}
      </div>
      <StashModal
        open={overlay === "stash"}
        onOpenChange={(open) => setOverlay(open ? "stash" : "none")}
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
          setShowCashoutConfirm(false);
          handleCashOut();
        }}
        onDismiss={setCashoutConfirmDismissed}
        isConfirming={isCashingOut}
      />
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
    </div>
  );
};
