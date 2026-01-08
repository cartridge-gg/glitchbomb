import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  GameFooter,
  GameHeader,
  GameScene,
  GameShop,
} from "@/components/containers";
import { BombIcon } from "@/components/icons";
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
  const { cashOut, pull, enter, buy, exit } = useActions();
  const navigate = useNavigate();
  const { pack, game, setPackId, setGameId } = useEntitiesContext();
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false);
  const [gameOverDialogOpen, setGameOverDialogOpen] = useState(false);
  // Pulls data for future use (e.g., pull history display)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { pulls } = usePulls({
    packId: pack?.id ?? 0,
    gameId: game?.id ?? 0,
  });

  const handleGoHome = useCallback(() => {
    setGameOverDialogOpen(false);
    navigate("/");
  }, [navigate]);

  useEffect(() => {
    const packId = searchParams.get("pack");
    const gameId = searchParams.get("game");
    if (!packId || !gameId) return;
    setPackId(Number(packId));
    setGameId(Number(gameId));
  }, [setPackId, setGameId, searchParams]);

  // Detect game over state
  useEffect(() => {
    if (game && game.over) {
      setGameOverDialogOpen(true);
    }
  }, [game]);

  useEffect(() => {
    if (game && game.points >= game.milestone && !game.over) {
      setMilestoneDialogOpen(true);
    }
  }, [game]);

  if (!pack || !game) return null;

  if (game.shop.length !== 0) {
    return (
      <div className="absolute inset-0 flex flex-col gap-8 max-w-[420px] m-auto py-6">
        <GameShop
          balance={game.chips}
          orbs={game.shop}
          onPurchase={(indices: number[]) => buy(pack.id, game.id, indices)}
          onInventory={() => {}}
          onContinue={() => exit(pack.id, game.id)}
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
          orbs={game.pullables.length}
          values={game.distribution()}
          onPull={() => pull(pack.id, game.id)}
        />
        <GameFooter
          className="w-full"
          details={game.bombs()}
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

      <Dialog open={gameOverDialogOpen} onOpenChange={setGameOverDialogOpen}>
        <DialogContent className="bg-orange-gradient-100 border-orange-500 rounded-xl max-w-[300px]">
          <DialogHeader className="items-center">
            <BombIcon className="w-16 h-16 text-white mb-2" />
            <DialogTitle className="text-white tracking-wide text-2xl font-glitch">
              GAME OVER
            </DialogTitle>
            <DialogDescription className="text-white/70 text-sm font-secondary text-center">
              You ran out of health! Your final score was{" "}
              <span className="text-white font-bold">{game.points}</span> points
              on level {game.level}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 mt-4">
            <Button
              variant="secondary"
              className="flex-1 font-secondary text-sm tracking-widest"
              onClick={handleGoHome}
            >
              Back to Home
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
