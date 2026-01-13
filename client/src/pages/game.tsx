import type ControllerConnector from "@cartridge/connector/controller";
import { useAccount } from "@starknet-react/core";
import { useEffect, useMemo, useRef, useState } from "react";
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
  GameGraph,
  HeartsDisplay,
  Multiplier,
  PointsProgress,
} from "@/components/elements";
import { BagIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useEntitiesContext } from "@/contexts";
import { usePulls } from "@/hooks";
import { useActions } from "@/hooks/actions";
import type { OrbPulled } from "@/models";

type OverlayView = "none" | "stash" | "cashout" | "milestone";

// Map orb model variant to GameScene orb variant
const getOrbVariant = (
  orb: OrbPulled["orb"],
): "point" | "bomb" | "multiplier" | "chip" | "moonrock" | "health" => {
  if (orb.isBomb()) return "bomb";
  if (orb.isMultiplier()) return "multiplier";
  if (orb.isHealth()) return "health";
  if (orb.isChips()) return "chip";
  if (orb.isMoonrock()) return "moonrock";
  return "point";
};

// Get display content for orb
const getOrbContent = (orb: OrbPulled["orb"]): string => {
  if (orb.isBomb()) return "-1 HP";
  if (orb.isHealth()) return "+1 HP";
  if (orb.isMultiplier()) return orb.name();
  if (orb.isChips()) return `+${orb.cost()} Chips`;
  if (orb.isMoonrock()) return `+${orb.cost()} Moonrocks`;
  return `+${orb.cost()} pts`;
};

export const Game = () => {
  const [searchParams] = useSearchParams();
  const { connector } = useAccount();
  const { cashOut, pull, enter, buyAndExit } = useActions();
  const { pack, game, setPackId, setGameId } = useEntitiesContext();

  const [overlay, setOverlay] = useState<OverlayView>("none");
  const [username, setUsername] = useState<string>();
  const [currentOrb, setCurrentOrb] = useState<{
    variant: "point" | "bomb" | "multiplier" | "chip" | "moonrock" | "health";
    content: string;
  } | null>(null);

  const { pulls } = usePulls({
    packId: pack?.id ?? 0,
    gameId: game?.id ?? 0,
  });

  // Track the last seen pull to detect new ones
  const lastPullIdRef = useRef<number>(0);

  // Get the latest pull
  const latestPull = useMemo(() => {
    if (pulls.length === 0) return null;
    return pulls.reduce(
      (latest, p) => (p.id > latest.id ? p : latest),
      pulls[0],
    );
  }, [pulls]);

  // Detect new pulls and trigger animation
  useEffect(() => {
    if (latestPull && latestPull.id > lastPullIdRef.current) {
      lastPullIdRef.current = latestPull.id;
      // Set the orb to trigger animation
      setCurrentOrb({
        variant: getOrbVariant(latestPull.orb),
        content: getOrbContent(latestPull.orb),
      });

      // Clear the orb after animation completes (4s total)
      const timer = setTimeout(() => {
        setCurrentOrb(null);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [latestPull]);

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
        return (
          <GameStash
            orbs={game.bag}
            chips={game.chips}
            onClose={closeOverlay}
          />
        );

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
      <GameGraph pulls={pulls} className="mt-8" />

      <GameScene
        className="grow"
        lives={game.health}
        bombs={game.distribution().bombs}
        orbs={game.pullables.length}
        values={game.distribution()}
        orb={currentOrb ?? undefined}
        onPull={() => pull(pack.id, game.id)}
      />

      <div className="flex items-center justify-between">
        <HeartsDisplay health={game.health} />
        <Multiplier count={game.multiplier} className="h-12 w-20" />
      </div>

      <div className="flex items-stretch gap-3">
        <Button
          variant="secondary"
          className="min-h-14 min-w-16"
          onClick={() => setOverlay("stash")}
        >
          <BagIcon className="w-6 h-6 text-green-400" />
        </Button>
        <button
          type="button"
          className="flex-1 min-h-14 font-secondary text-sm tracking-widest rounded-lg transition-all duration-200 hover:brightness-125 hover:shadow-[0_0_20px_rgba(128,0,128,0.5)]"
          style={{
            background: "linear-gradient(180deg, #4A1A6B 0%, #2D1052 100%)",
            border: "2px solid rgba(138, 43, 226, 0.4)",
            color: "#FF80FF",
          }}
          onClick={() => setOverlay("cashout")}
        >
          CASH OUT
        </button>
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
