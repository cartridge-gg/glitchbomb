import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  GameFooter,
  GameHeader,
  GameScene,
  GameShop,
} from "@/components/containers";
import { BombIcon, HeartIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEntitiesContext } from "@/contexts";
import { usePulls } from "@/hooks";
import { useActions } from "@/hooks/actions";

export const Game = () => {
  const [searchParams] = useSearchParams();
  const { cashOut, pull, enter, buyAndExit } = useActions();
  const navigate = useNavigate();
  const { pack, game, setPackId, setGameId } = useEntitiesContext();
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false);
  // Pulls data for future use (e.g., pull history display)
  usePulls({
    packId: pack?.id ?? 0,
    gameId: game?.id ?? 0,
  });

  useEffect(() => {
    const packId = searchParams.get("pack");
    const gameId = searchParams.get("game");
    if (!packId || !gameId) return;
    setPackId(Number(packId));
    setGameId(Number(gameId));
  }, [setPackId, setGameId, searchParams]);

  useEffect(() => {
    if (game && game.points >= game.milestone && !game.over) {
      setMilestoneDialogOpen(true);
    }
  }, [game]);

  if (!pack || !game) return null;

  // Game over screen
  if (game.over) {
    return (
      <div className="absolute inset-0 flex flex-col gap-8 max-w-[420px] m-auto py-6 px-4">
        <div className="flex-1 flex flex-col items-center justify-center gap-8 text-center">
          <BombIcon className="w-24 h-24 text-red-400" />
          <div className="flex flex-col gap-3">
            <h1 className="text-white uppercase text-3xl font-glitch">
              GAME OVER
            </h1>
            <p className="text-green-600 font-secondary text-sm tracking-wide max-w-xs">
              You ran out of health! Your final score was{" "}
              <span className="text-white font-bold">{game.points}</span> points
              on level {game.level}.
            </p>
          </div>
        </div>

        <div className="flex items-stretch gap-3 w-full pt-2">
          <Button
            variant="secondary"
            className="min-h-14 flex-1 font-secondary text-sm tracking-widest"
            onClick={() => navigate("/games")}
          >
            ← GAMES
          </Button>
          <Button
            variant="default"
            className="min-h-14 flex-1 font-secondary text-sm tracking-widest"
            onClick={() => navigate("/")}
          >
            HOME
          </Button>
        </div>
      </div>
    );
  }

  if (game.shop.length !== 0) {
    return (
      <div className="absolute inset-0 flex flex-col gap-8 max-w-[420px] m-auto py-6">
        <GameShop
          balance={game.chips}
          orbs={game.shop}
          bag={game.bag}
          onConfirm={(indices: number[]) =>
            buyAndExit(pack.id, game.id, indices)
          }
        />
      </div>
    );
  }

  return (
    <>
      <div className="absolute inset-0 flex flex-col gap-8 max-w-[420px] m-auto py-6">
        <GameHeader
          score={game.points}
          multiplier={game.multiplier}
          moonrocks={pack.moonrocks}
          chips={game.chips}
          milestone={game.milestone}
          className="w-full"
          onLeftClick={() => cashOut(pack.id, game.id)}
        />
        <GameScene
          className="grow"
          lives={game.health}
          bombs={game.distribution().bombs}
          orbs={game.pullables.length}
          values={game.distribution()}
          onPull={() => pull(pack.id, game.id)}
        />
        {/* Hearts display */}
        <div className="flex items-center justify-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <HeartIcon
              key={i}
              className="w-10 h-10"
              style={
                i < game.health
                  ? {
                      color: "#FF0080",
                      filter: "drop-shadow(0 0 8px #FF0080)",
                    }
                  : {
                      color: "rgba(20, 83, 45, 0.3)",
                    }
              }
            />
          ))}
        </div>
        <GameFooter
          className="w-full"
          details={game.bombs()}
          onLeftClick={() => navigate("/games")}
          onRightClick={() => navigate("/")}
        />
      </div>

      <Dialog open={milestoneDialogOpen} onOpenChange={setMilestoneDialogOpen}>
        <DialogContent className="bg-green-gradient-100 border-green-700 rounded-xl max-w-[300px]">
          <DialogHeader>
            <DialogTitle className="text-white tracking-wide">
              Milestone Reached!
            </DialogTitle>
            <DialogDescription className="text-white/50 text-sm font-secondary">
              Congratulations! You've reached {game.milestone} points. Do you
              want to cash out or continue playing?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1 font-secondary text-sm tracking-widest"
              onClick={() => {
                cashOut(pack.id, game.id)
                  .then(() => {
                    setMilestoneDialogOpen(false);
                  })
                  .catch((error) => {
                    console.error(error);
                    setMilestoneDialogOpen(false);
                  });
              }}
            >
              Cash Out
            </Button>
            <Button
              variant="secondary"
              className="flex-1 font-secondary text-sm tracking-widest"
              onClick={() => {
                enter(pack.id, game.id)
                  .then(() => {
                    setMilestoneDialogOpen(false);
                  })
                  .catch((error) => {
                    console.error(error);
                    setMilestoneDialogOpen(false);
                  });
              }}
            >
              Enter Shop
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
