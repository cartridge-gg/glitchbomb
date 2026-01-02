import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { GameFooter, GameHeader, GameScene } from "@/components/containers";
import { useEntitiesContext } from "@/contexts";
import { useActions } from "@/hooks/actions";

export const Game = () => {
  const [searchParams] = useSearchParams();
  const { cashOut, pull } = useActions();
  const navigate = useNavigate();
  const { pack, game, setPackId, setGameId } = useEntitiesContext();

  useEffect(() => {
    const packId = searchParams.get("pack");
    const gameId = searchParams.get("game");
    if (!packId || !gameId) return;
    setPackId(Number(packId));
    setGameId(Number(gameId));
  }, [setPackId, setGameId, searchParams]);

  if (!pack || !game) return null;

  return (
    <div className="absolute inset-0 flex flex-col gap-8 max-w-[420px] m-auto py-6">
      <GameHeader
        packId={pack.id}
        gameId={game.id}
        score={game.points}
        multiplier={game.multiplier}
        moonrocks={pack.moonrocks}
        chips={game.chips}
        milestone={game.milestone}
        className="w-full"
        onLeftClick={() => cashOut(pack.id, game.id)}
      />
      <GameScene
        packId={pack.id}
        gameId={game.id}
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
  );
};
