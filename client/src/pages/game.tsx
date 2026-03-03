import type ControllerConnector from "@cartridge/connector/controller";
import { useAccount, useNetwork } from "@starknet-react/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  GameHeader,
  GameOver,
  GameScene,
  GameShop,
  StashModal,
} from "@/components/containers";
import {
  BombTracker,
  CashOutChoice,
  GameStats,
  MilestoneChoice,
  PLChartTabs,
  type PLDataPoint as PLDataPointComponent,
  RewardOverlay,
} from "@/components/elements";
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
import { OrbType } from "@/models/orb";
import { milestoneCost } from "@/offline/milestone";

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
    chips: 0,
    moonrocks: 0,
  },
  orbsCount: 11,
};

const NEXT_LEVEL_CURSES: Record<number, string> = {
  4: "Double Bomb",
  6: "Sticky Bomb",
  7: "Double Bomb",
};

type OverlayView = "none" | "stash" | "cashout";

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
    startMusic,
    stopMusic,
  } = useAudio();

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
  const [showRewardOverlay, setShowRewardOverlay] = useState(false);
  const [animateHeaderCount, setAnimateHeaderCount] = useState(false);
  const moonrocksRef = useRef<HTMLDivElement>(null);
  const rewardShownForGameRef = useRef<number | null>(null);
  const [username, setUsername] = useState<string>();
  const [shopBalanceOverride, setShopBalanceOverride] = useState<number | null>(
    null,
  );
  const [currentOrb, setCurrentOrb] = useState<
    | {
        variant:
          | "point"
          | "bomb"
          | "multiplier"
          | "chip"
          | "moonrock"
          | "health";
        content: string;
      }
    | undefined
  >(undefined);
  const lastPullIdRef = useRef<number | null>(null);

  // Loading states for actions
  const [isEnteringShop, setIsEnteringShop] = useState(false);
  const [isExitingShop, setIsExitingShop] = useState(false);
  const [isCashingOut, setIsCashingOut] = useState(false);
  const [isPulling, setIsPulling] = useState(false);

  const { dataPoints } = usePLDataPoints({
    gameId: game?.id ?? 0,
  });

  const { pulls, initialFetchComplete } = usePulls({
    gameId: game?.id ?? 0,
  });

  // Convert PLDataPoint events to graph format
  const plData: PLDataPointComponent[] = useMemo(() => {
    if (dataPoints.length === 0) return [];

    // Sort by id and convert to graph format
    const sorted = [...dataPoints].sort((a, b) => a.id - b.id);
    return sorted.map((point, index) => {
      // Get the orb-based color
      let variant = point.variant();

      // If value decreased from previous point, override to red
      if (index > 0) {
        const prevValue = sorted[index - 1].potentialMoonrocks;
        if (point.potentialMoonrocks < prevValue) {
          variant = "red";
        }
      }

      return {
        value: point.potentialMoonrocks,
        variant,
        id: point.id,
      };
    });
  }, [dataPoints]);

  // Fetch username from controller
  useEffect(() => {
    if (!connector) return;
    (connector as never as ControllerConnector).controller
      .username()
      ?.then((name) => setUsername(name));
  }, [connector]);

  // Start background music on mount, stop on unmount
  useEffect(() => {
    startMusic("glitched");
    return () => stopMusic();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set game ID from URL params
  useEffect(() => {
    const gameId = searchParams.get("game");
    if (gameId) {
      setGameId(Number(gameId));
      // Reset all local state when game changes
      lastPullIdRef.current = null;
      setCurrentOrb(undefined);
      setOverlay("none");
      setIsEnteringShop(false);
      setIsExitingShop(false);
      setIsPulling(false);
      setShowRewardOverlay(false);
      setAnimateHeaderCount(false);
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

  useEffect(() => {
    if (!isPulling) return;
    const timer = setTimeout(() => {
      setIsPulling(false);
    }, 15000);
    return () => clearTimeout(timer);
  }, [isPulling]);

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
      // Show the outcome
      setCurrentOrb({
        variant: latestPull.orb.outcomeVariant(),
        content: latestPull.orb.outcome(),
      });
      playOrbSound(latestPull.orb);
      setIsPulling(false);

      // Update the last seen pull id
      lastPullIdRef.current = latestPull.id;

      // Clear after animation (2 seconds matches GameScene timing)
      const timer = setTimeout(() => {
        setCurrentOrb(undefined);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [pulls, playOrbSound]);

  // Memoize callbacks to prevent unnecessary re-renders
  const handlePull = useCallback(async () => {
    if (!game || isPulling) return;
    setIsPulling(true);
    const success = await pull(game.id);
    if (!success) {
      setIsPulling(false);
    }
  }, [pull, game, isPulling]);

  const closeOverlay = useCallback(() => setOverlay("none"), []);

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
  const openCashout = useCallback(() => setOverlay("cashout"), []);

  // Memoize computed values to prevent recalculation
  const distribution = useMemo(
    () => (game ? game.distribution() : INITIAL_GAME_VALUES.distribution),
    [game],
  );
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
          onPlayAgain={() => navigate("/")}
        />
      );
    }

    // Game over (terminal state) - both view mode and immediate game over
    if (game.over) {
      const cashedOut = game.health > 0;
      // When cashed out, points were converted to moonrocks (game.points is now 0)
      // Calculate from the final P/L value (last data point before cash out)
      // When died (health = 0), no moonrocks earned
      const lastPLValue =
        plData.length > 0 ? plData[plData.length - 1].value : 0;
      const moonrocksEarned = cashedOut ? Math.max(0, lastPLValue) : 0;

      return (
        <GameOver
          level={game.level}
          moonrocksEarned={moonrocksEarned}
          plData={plData}
          pulls={pulls}
          cashedOut={cashedOut}
          onPlayAgain={() => navigate("/")}
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
          onConfirm={handleBuyAndExit}
          isLoading={isExitingShop}
          onBalanceChange={setShopBalanceOverride}
        />
      );
    }

    // Check if milestone reached or cashout confirmation
    const milestoneReached = game.points >= game.milestone;
    const showCashoutChoice = overlay === "cashout";

    // Main gameplay view - inlined to prevent remount on re-render
    return (
      <div className="flex min-h-full flex-col max-w-[420px] mx-auto px-4 pb-[clamp(6px,1.1svh,12px)]">
        {showCashoutChoice ? (
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
            />
            <div className="mt-[clamp(6px,2.2svh,18px)] flex-1 min-h-0 flex items-center justify-center">
              <CashOutChoice
                moonrocks={game.moonrocks}
                points={game.points}
                cashOutValue={formatCashOutValue}
                onConfirm={handleCashOut}
                onCancel={closeOverlay}
                isConfirming={isCashingOut}
              />
            </div>
          </div>
        ) : milestoneReached ? (
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
            />
            <div className="flex-1 min-h-0 flex items-center justify-center">
              <MilestoneChoice
                moonrocks={game.moonrocks}
                points={game.points}
                ante={milestoneCost(game.level + 1)}
                cashOutValue={formatCashOutValue}
                onCashOut={handleCashOut}
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
              />
              <GameScene
                className="mt-[clamp(16px,2.4svh,28px)] min-h-[clamp(220px,40svh,340px)] h-full flex-1"
                lives={game.health}
                bombs={distribution.bombs}
                orbs={game.pullables.length}
                multiplier={game.multiplier}
                values={distribution}
                hasCurse={hasCurse}
                curseLabel={curseLabel}
                orb={currentOrb}
                pullLoading={isPulling}
                onPull={handlePull}
              />
            </div>
            <div className="flex items-center justify-center pb-[clamp(2px,0.6svh,6px)]">
              <BombTracker details={bombDetails} size="lg" />
            </div>
            <div className="pt-[clamp(4px,0.8svh,8px)] pb-[clamp(4px,0.8svh,8px)] flex items-stretch gap-[clamp(8px,2.4svh,20px)]">
              <GradientBorder color="yellow" className="flex-1">
                <button
                  type="button"
                  className="w-full flex items-center justify-center min-h-[clamp(40px,6svh,56px)] font-secondary text-[clamp(0.65rem,1.5svh,0.875rem)] tracking-widest text-yellow-400 rounded-lg transition-all duration-200 hover:brightness-110 bg-[#302A10]"
                  onClick={openCashout}
                >
                  CASH OUT
                </button>
              </GradientBorder>
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
      />
      <div className="flex-1 min-h-0 overflow-hidden pt-0 pb-0">
        {renderScreen()}
      </div>
      <StashModal
        open={overlay === "stash"}
        onOpenChange={(open) => setOverlay(open ? "stash" : "none")}
        orbs={game?.bag ?? []}
        discards={game?.discards ?? []}
      />
      <RewardOverlay
        open={showRewardOverlay}
        onDismiss={() => {
          setShowRewardOverlay(false);
          setAnimateHeaderCount(false);
        }}
        onAnimationStart={() => setAnimateHeaderCount(true)}
        targetRef={moonrocksRef}
        reward={{
          variant: "moonrock",
          count: game?.moonrocks ?? 0,
          label: "Moonrocks",
        }}
      />
    </div>
  );
};
