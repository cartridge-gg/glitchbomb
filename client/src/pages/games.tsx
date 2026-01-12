import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SparklesIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useActions } from "@/hooks/actions";
import { useGames } from "@/hooks/games";
import { usePacks } from "@/hooks/packs";

interface GameCardProps {
  packId: number;
  gameId: number;
  isOver?: boolean;
  onPlay: () => void;
}

const GameCard = ({ packId, gameId, isOver, onPlay }: GameCardProps) => {
  return (
    <div className="flex items-center gap-4 p-3 rounded-xl border border-green-900/50 bg-green-950/30">
      {/* Orb Icon */}
      <div className="relative w-14 h-14 rounded-full border-2 border-green-500 flex items-center justify-center bg-green-950/50">
        <div
          className="absolute inset-1 rounded-full bg-center opacity-30"
          style={{
            backgroundImage: "url(/assets/orb.png)",
            backgroundSize: "cover",
          }}
        />
        <SparklesIcon size="lg" className="text-green-400 relative z-10" />
      </div>

      {/* Game Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-primary text-lg tracking-wide">
          GAME {gameId}
        </h3>
        <p className="text-green-600 font-secondary text-xs tracking-wider uppercase">
          Pack #{packId} • {isOver ? "ENDED" : "ACTIVE"}
        </p>
      </div>

      {/* Play Button */}
      <Button
        variant="default"
        className="h-10 px-6 font-secondary uppercase text-sm tracking-widest"
        onClick={onPlay}
        disabled={isOver}
      >
        Play
      </Button>
    </div>
  );
};

export const Games = () => {
  const navigate = useNavigate();
  const { start } = useActions();
  const { packs } = usePacks();

  // Build game keys from packs
  const gameKeys = useMemo(() => {
    return packs.map((p) => ({
      packId: p.id,
      gameId: Math.max(p.game_count, 1),
    }));
  }, [packs]);

  const { getGameForPack } = useGames(gameKeys);

  // Build list of all games
  const gameList = useMemo(() => {
    const games: Array<{
      packId: number;
      gameId: number;
      isOver: boolean;
      hasNoGame: boolean;
    }> = [];

    for (const pack of packs) {
      const gameId = Math.max(pack.game_count, 1);
      const game = getGameForPack(pack.id, gameId);
      games.push({
        packId: pack.id,
        gameId,
        isOver: game?.over ?? false,
        hasNoGame: pack.game_count === 0,
      });
    }

    return games;
  }, [packs, getGameForPack]);

  const handlePlay = async (
    packId: number,
    gameId: number,
    hasNoGame: boolean,
  ) => {
    if (hasNoGame) {
      await start(packId);
    }
    navigate(`/play?pack=${packId}&game=${gameId}`);
  };

  return (
    <div className="absolute inset-0 flex flex-col max-w-[420px] m-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-2xl font-primary tracking-wide">
          MY GAMES
        </h1>
        <Button
          variant="secondary"
          className="h-10 px-4 font-secondary uppercase text-xs tracking-widest"
          onClick={() => navigate("/")}
        >
          Back
        </Button>
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto flex-1">
        {gameList.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-green-600">
            <p className="font-secondary text-sm tracking-wider">
              No games yet
            </p>
            <p className="font-secondary text-xs tracking-wider mt-1">
              Purchase a pack to start playing
            </p>
          </div>
        ) : (
          gameList.map((game) => (
            <GameCard
              key={`${game.packId}-${game.gameId}`}
              packId={game.packId}
              gameId={game.gameId}
              isOver={game.isOver}
              onPlay={() =>
                handlePlay(game.packId, game.gameId, game.hasNoGame)
              }
            />
          ))
        )}
      </div>
    </div>
  );
};
