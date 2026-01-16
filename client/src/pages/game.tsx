import type ControllerConnector from "@cartridge/connector/controller";
import { useAccount } from "@starknet-react/core";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
  HeartsDisplay,
  Multiplier,
  type PLDataPoint as PLDataPointComponent,
  PLGraph,
  PointsProgress,
} from "@/components/elements";
import { BagIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { GradientBorder } from "@/components/ui/gradient-border";
import { useEntitiesContext } from "@/contexts";
import { usePLDataPoints } from "@/hooks";
import { useActions } from "@/hooks/actions";

type OverlayView = "none" | "stash" | "cashout" | "milestone";

export const Game = () => {
  const [searchParams] = useSearchParams();
  const { connector } = useAccount();
  const { cashOut, pull, enter, buyAndExit } = useActions();
  const { pack, game, setPackId, setGameId } = useEntitiesContext();

  const [overlay, setOverlay] = useState<OverlayView>("none");
  const [username, setUsername] = useState<string>();

  const { dataPoints } = usePLDataPoints({
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
    () => (game ? game.distribution() : { points: 0, bombs: 0 }),
    [game],
  );

  if (!pack || !game) return null;

  // Determine which screen to show
  const renderScreen = () => {
    // Priority 1: Game over (terminal state)
    if (game.over) {
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
        return <GameStash orbs={game.pullables} onClose={closeOverlay} />;

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
            <PLGraph data={plData} mode="absolute" title="POTENTIAL" />

            <GameScene
              className="grow"
              lives={game.health}
              bombs={distribution.bombs}
              orbs={game.pullables.length}
              values={distribution}
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
        moonrocks={pack.moonrocks}
        chips={game.chips}
        username={username}
      />
      <div className="flex-1 overflow-hidden py-6">{renderScreen()}</div>
    </div>
  );
};
