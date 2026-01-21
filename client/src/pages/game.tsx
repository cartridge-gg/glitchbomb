import type ControllerConnector from "@cartridge/connector/controller";
import { useAccount } from "@starknet-react/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CashOutConfirmation,
  GameHeader,
  GameOver,
  GameScene,
  GameShop,
  GameStash,
  MilestoneReached,
} from "@/components/containers";
import {
  GameRecap,
  HeartsDisplay,
  Multiplier,
  PLChartTabs,
  type PLDataPoint as PLDataPointComponent,
  PointsProgress,
} from "@/components/elements";
import { BagIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { GradientBorder } from "@/components/ui/gradient-border";
import { useEntitiesContext } from "@/contexts";
import { usePLDataPoints, usePulls } from "@/hooks";
import { useActions } from "@/hooks/actions";

// Initial game values for optimistic rendering
const INITIAL_GAME_VALUES = {
  health: 5,
  level: 1,
  points: 0,
  milestone: 12,
  multiplier: 1,
  chips: 0,
  // Initial bag: 4 bombs, 7 other orbs
  distribution: { points: 7, bombs: 4, multipliers: 0, health: 0, chips: 0, moonrocks: 0 },
  orbsCount: 11,
};

type OverlayView = "none" | "stash" | "cashout" | "milestone";

export const Game = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { connector } = useAccount();
  const { cashOut, pull, enter, buyAndExit } = useActions();
  const { pack, game, setPackId, setGameId } = useEntitiesContext();

  const [overlay, setOverlay] = useState<OverlayView>("none");
  const [username, setUsername] = useState<string>();
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

  // Check if we're in view mode (for finished games)
  const isViewMode = searchParams.get("view") === "true";

  const { dataPoints } = usePLDataPoints({
    packId: pack?.id ?? 0,
    gameId: game?.id ?? 0,
  });

  const { pulls } = usePulls({
    packId: pack?.id ?? 0,
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

  // Set pack/game IDs from URL params
  useEffect(() => {
    const packId = searchParams.get("pack");
    const gameId = searchParams.get("game");
    if (packId && gameId) {
      setPackId(Number(packId));
      setGameId(Number(gameId));
    }
  }, [setPackId, setGameId, searchParams]);

  // Auto-show milestone screen when reached
  useEffect(() => {
    if (game && game.points >= game.milestone && !game.over) {
      setOverlay("milestone");
    }
  }, [game]);

  // Detect new pulls and show outcome animation
  useEffect(() => {
    if (pulls.length === 0) return;

    // Get the latest pull (highest id)
    const latestPull = pulls.reduce((latest, pull) =>
      pull.id > latest.id ? pull : latest,
    );

    // Check if this is a new pull we haven't seen
    if (
      lastPullIdRef.current !== null &&
      latestPull.id > lastPullIdRef.current
    ) {
      // Show the outcome
      setCurrentOrb({
        variant: latestPull.orb.outcomeVariant(),
        content: latestPull.orb.outcome(),
      });

      // Clear after animation (2 seconds matches GameScene timing)
      const timer = setTimeout(() => {
        setCurrentOrb(undefined);
      }, 2500);

      return () => clearTimeout(timer);
    }

    // Update the last seen pull id
    lastPullIdRef.current = latestPull.id;
  }, [pulls]);

  // Memoize callbacks to prevent unnecessary re-renders
  const handlePull = useCallback(() => {
    if (pack && game) {
      pull(pack.id, game.id);
    }
  }, [pull, pack, game]);

  const closeOverlay = useCallback(() => setOverlay("none"), []);

  const handleCashOut = useCallback(async () => {
    if (!pack || !game) return;
    try {
      await cashOut(pack.id, game.id);
    } catch (error) {
      console.error(error);
    } finally {
      setOverlay("none");
    }
  }, [cashOut, pack, game]);

  const handleEnterShop = useCallback(async () => {
    if (!pack || !game) return;
    try {
      await enter(pack.id, game.id);
    } catch (error) {
      console.error(error);
    } finally {
      setOverlay("none");
    }
  }, [enter, pack, game]);

  const handleBuyAndExit = useCallback(
    (indices: number[]) => {
      if (pack && game) {
        buyAndExit(pack.id, game.id, indices);
      }
    },
    [buyAndExit, pack, game],
  );

  const openStash = useCallback(() => setOverlay("stash"), []);
  const openCashout = useCallback(() => setOverlay("cashout"), []);

  // Memoize computed values to prevent recalculation
  const distribution = useMemo(
    () => (game ? game.distribution() : INITIAL_GAME_VALUES.distribution),
    [game],
  );

  // Check if we're still loading (have URL params but no data yet)
  const isLoading = !pack || !game;
  const packId = searchParams.get("pack");
  const gameId = searchParams.get("game");

  // If no URL params at all, show nothing
  if (!packId || !gameId) return null;

  // Determine which screen to show
  const renderScreen = () => {
    // Loading state - show optimistic UI
    if (isLoading) {
      return (
        <div className="flex flex-col gap-4 max-w-[420px] mx-auto px-4 h-full">
          <PointsProgress
            points={INITIAL_GAME_VALUES.points}
            milestone={INITIAL_GAME_VALUES.milestone}
          />
          <PLChartTabs data={[]} pulls={[]} mode="absolute" title="POTENTIAL" />

          <GameScene
            className="grow"
            lives={INITIAL_GAME_VALUES.health}
            bombs={INITIAL_GAME_VALUES.distribution.bombs}
            orbs={INITIAL_GAME_VALUES.orbsCount}
            values={INITIAL_GAME_VALUES.distribution}
            onPull={() => {}} // No-op while loading
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center px-2 py-1.5 rounded-lg border border-green-900">
                <span className="font-secondary text-green-400 text-md tracking-wider">
                  L{INITIAL_GAME_VALUES.level}
                </span>
              </div>
              <HeartsDisplay health={INITIAL_GAME_VALUES.health} />
            </div>
            <Multiplier
              count={INITIAL_GAME_VALUES.multiplier}
              className="h-12 w-20"
            />
          </div>

          <div className="flex items-stretch gap-3 opacity-50 pointer-events-none">
            <Button
              variant="secondary"
              gradient="green"
              className="min-h-14 min-w-16"
              disabled
            >
              <BagIcon className="w-6 h-6 text-green-400" />
            </Button>
            <GradientBorder color="purple" className="flex-1">
              <button
                type="button"
                disabled
                className="w-full min-h-14 font-secondary text-sm tracking-widest rounded-lg"
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
      );
    }

    // View mode for finished games - show recap with game stats
    if (isViewMode && game.over) {
      // Overlay screens in view mode
      if (overlay === "stash") {
        return (
          <GameStash
            orbs={game.pullables}
            pulls={pulls}
            onClose={closeOverlay}
          />
        );
      }

      // Main view mode layout
      return (
        <div className="flex flex-col gap-4 max-w-[420px] mx-auto px-4 h-full">
          <PointsProgress points={game.points} milestone={game.milestone} />
          <PLChartTabs
            data={plData}
            pulls={pulls}
            mode="absolute"
            title="POTENTIAL"
          />

          {/* Game recap instead of GameScene */}
          <div className="grow flex items-center justify-center">
            <GameRecap points={game.points} level={game.level} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center px-2 py-1.5 rounded-lg border border-green-900">
                <span className="font-secondary text-green-400 text-md tracking-wider">
                  L{game.level}
                </span>
              </div>
              <HeartsDisplay health={game.health} />
            </div>
            <Multiplier count={game.multiplier} className="h-12 w-20" />
          </div>

          <div className="flex items-stretch gap-3">
            <Button
              variant="secondary"
              gradient="green"
              className="min-h-14 min-w-16"
              onClick={openStash}
            >
              <BagIcon className="w-6 h-6 text-green-400" />
            </Button>
            <Button
              variant="secondary"
              className="min-h-14 flex-1 font-secondary text-sm tracking-widest"
              onClick={() => navigate("/games")}
            >
              ← BACK TO GAMES
            </Button>
          </div>
        </div>
      );
    }

    // Priority 1: Game over (terminal state) - only show if not in view mode
    if (game.over && !isViewMode) {
      return <GameOver points={game.points} level={game.level} />;
    }

    // Priority 2: Shop (when shop has items)
    if (game.shop.length > 0) {
      return (
        <GameShop
          balance={game.chips}
          orbs={game.shop}
          bag={game.pullables}
          onConfirm={handleBuyAndExit}
        />
      );
    }

    // Priority 3: Overlay screens
    switch (overlay) {
      case "milestone":
        return (
          <MilestoneReached
            milestone={game.milestone}
            onCashOut={handleCashOut}
            onEnterShop={handleEnterShop}
          />
        );

      case "stash":
        return (
          <GameStash
            orbs={game.pullables}
            pulls={pulls}
            onClose={closeOverlay}
          />
        );

      case "cashout":
        return (
          <CashOutConfirmation
            moonrocks={pack.moonrocks}
            points={game.points}
            onConfirm={handleCashOut}
            onCancel={closeOverlay}
          />
        );

      default:
        // Main gameplay view - inlined to prevent remount on re-render
        return (
          <div className="flex flex-col gap-4 max-w-[420px] mx-auto px-4 h-full">
            <PointsProgress points={game.points} milestone={game.milestone} />
            <PLChartTabs
              data={plData}
              pulls={pulls}
              mode="absolute"
              title="POTENTIAL"
            />

            <GameScene
              className="grow"
              lives={game.health}
              bombs={distribution.bombs}
              orbs={game.pullables.length}
              values={distribution}
              orb={currentOrb}
              onPull={handlePull}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center px-2 py-1.5 rounded-lg border border-green-900">
                  <span className="font-secondary text-green-400 text-md tracking-wider">
                    L{game.level}
                  </span>
                </div>
                <HeartsDisplay health={game.health} />
              </div>
              <Multiplier count={game.multiplier} className="h-12 w-20" />
            </div>

            <div className="flex items-stretch gap-3">
              <Button
                variant="secondary"
                gradient="green"
                className="min-h-14 min-w-16"
                onClick={openStash}
              >
                <BagIcon className="w-6 h-6 text-green-400" />
              </Button>
              <GradientBorder color="purple" className="flex-1">
                <button
                  type="button"
                  className="w-full min-h-14 font-secondary text-sm tracking-widest rounded-lg transition-all duration-200 hover:brightness-125 hover:shadow-[0_0_20px_rgba(128,0,128,0.5)]"
                  style={{
                    background:
                      "linear-gradient(180deg, #4A1A6B 0%, #2D1052 100%)",
                    color: "#FF80FF",
                  }}
                  onClick={openCashout}
                >
                  CASH OUT
                </button>
              </GradientBorder>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col">
      <GameHeader
        moonrocks={pack?.moonrocks ?? 100}
        chips={game?.chips ?? INITIAL_GAME_VALUES.chips}
        username={username}
      />
      <div className="flex-1 overflow-hidden py-6">{renderScreen()}</div>
    </div>
  );
};
