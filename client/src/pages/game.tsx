import type ControllerConnector from "@cartridge/connector/controller";
import { useAccount } from "@starknet-react/core";
import { useEffect, useMemo, useState } from "react";
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
  type PLDataPoint,
  PLGraph,
  PointsProgress,
} from "@/components/elements";
import { BagIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { GradientBorder } from "@/components/ui/gradient-border";
import { useEntitiesContext } from "@/contexts";
import { usePulls } from "@/hooks";
import { useActions } from "@/hooks/actions";

type OverlayView = "none" | "stash" | "cashout" | "milestone";

export const Game = () => {
  const [searchParams] = useSearchParams();
  const { connector } = useAccount();
  const { cashOut, pull, enter, buyAndExit } = useActions();
  const { pack, game, setPackId, setGameId } = useEntitiesContext();

  const [overlay, setOverlay] = useState<OverlayView>("none");
  const [username, setUsername] = useState<string>();

  const { pulls } = usePulls({
    packId: pack?.id ?? 0,
    gameId: game?.id ?? 0,
  });

  // Convert pulls to PLDataPoint[] for the potential moonrocks graph
  const plData: PLDataPoint[] = useMemo(() => {
    if (pulls.length === 0) return [];

    // Sort pulls by id and map to PLDataPoint
    const sorted = [...pulls].sort((a, b) => a.id - b.id);

    // Map orb variant to PLGraph variant
    const mapVariant = (
      orbVariant: string,
    ): "green" | "red" | "yellow" | "blue" => {
      switch (orbVariant) {
        case "red":
          return "red"; // Bombs
        case "yellow":
          return "yellow"; // Multiplier orbs
        case "blue":
          return "blue"; // Moonrock orbs
        default:
          return "green"; // Point orbs, health, chips, etc.
      }
    };

    const data = sorted.map((pull) => ({
      value: pull.potential_moonrocks,
      variant: mapVariant(pull.orb.variant()),
      id: pull.id,
    }));

    // Filter out if all values are 0 (old events without potential_moonrocks)
    const hasValidData = data.some((d) => d.value > 0);
    return hasValidData ? data : [];
  }, [pulls]);

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

  if (!pack || !game) return null;

  const closeOverlay = () => setOverlay("none");

  const handleCashOut = async () => {
    try {
      await cashOut(pack.id, game.id);
    } catch (error) {
      console.error(error);
    } finally {
      closeOverlay();
    }
  };

  const handleEnterShop = async () => {
    try {
      await enter(pack.id, game.id);
    } catch (error) {
      console.error(error);
    } finally {
      closeOverlay();
    }
  };

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
          bag={game.bag}
          onConfirm={(indices) => buyAndExit(pack.id, game.id, indices)}
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
        return <GameStash orbs={game.bag} onClose={closeOverlay} />;

      case "cashout":
        return (
          <CashOutConfirmation
            points={game.points}
            onConfirm={handleCashOut}
            onCancel={closeOverlay}
          />
        );

      default:
        return <GamePlayView />;
    }
  };

  // Main gameplay view component
  const GamePlayView = () => (
    <div className="flex flex-col gap-4 max-w-[420px] mx-auto px-4 h-full">
      <PointsProgress points={game.points} milestone={game.milestone} />
      <PLGraph data={plData} mode="absolute" title="POTENTIAL" />

      <GameScene
        className="grow"
        lives={game.health}
        bombs={game.distribution().bombs}
        orbs={game.pullables.length}
        values={game.distribution()}
        onPull={() => pull(pack.id, game.id)}
      />

      <div className="flex items-center justify-between">
        <HeartsDisplay health={game.health} />
        <Multiplier count={game.multiplier} className="h-12 w-20" />
      </div>

      <div className="flex items-stretch gap-3">
        <Button
          variant="secondary"
          gradient="green"
          className="min-h-14 min-w-16"
          onClick={() => setOverlay("stash")}
        >
          <BagIcon className="w-6 h-6 text-green-400" />
        </Button>
        <GradientBorder color="purple" className="flex-1">
          <button
            type="button"
            className="w-full min-h-14 font-secondary text-sm tracking-widest rounded-lg transition-all duration-200 hover:brightness-125 hover:shadow-[0_0_20px_rgba(128,0,128,0.5)]"
            style={{
              background: "linear-gradient(180deg, #4A1A6B 0%, #2D1052 100%)",
              color: "#FF80FF",
            }}
            onClick={() => setOverlay("cashout")}
          >
            CASH OUT
          </button>
        </GradientBorder>
      </div>
    </div>
  );

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
