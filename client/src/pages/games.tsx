import type ControllerConnector from "@cartridge/connector/controller";
import { useAccount, useNetwork } from "@starknet-react/core";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Balance, Profile } from "@/components/elements";
import {
  ArrowLeftIcon,
  GlitchBombIcon,
  SparklesIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { getTokenAddress } from "@/config";
import { useEntitiesContext } from "@/contexts";
import { useActions } from "@/hooks/actions";
import { useGames } from "@/hooks/games";
import { usePacks } from "@/hooks/packs";
import { toDecimal, useTokens } from "@/hooks/tokens";

interface GameCardProps {
  gameId: number;
  pullCount: number;
  bagSize: number;
  level: number;
  hasStarted: boolean;
  isOver?: boolean;
  onPlay: () => void;
}

const GameCard = ({
  gameId,
  pullCount,
  bagSize,
  level,
  hasStarted,
  isOver,
  onPlay,
}: GameCardProps) => {
  return (
    <div className="flex items-center gap-4 p-3 rounded-xl border border-green-900 bg-green-950/30">
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
          {pullCount}/{bagSize} • {isOver ? "ENDED" : `LEVEL ${level}`}
        </p>
      </div>

      {/* Play Button */}
      <Button
        variant="default"
        className="h-10 px-6 font-secondary uppercase text-sm tracking-widest"
        onClick={onPlay}
        disabled={isOver}
      >
        {hasStarted ? "Continue" : "Play"}
      </Button>
    </div>
  );
};

export const Games = () => {
  const navigate = useNavigate();
  const { chain } = useNetwork();
  const { account, connector } = useAccount();
  const { starterpack, config } = useEntitiesContext();
  const { start, mint } = useActions();
  const { packs } = usePacks();
  const [username, setUsername] = useState<string>();

  // Token balance
  const tokenAddress = config?.token || getTokenAddress(chain.id);
  const { tokenBalances, tokenContracts } = useTokens({
    accountAddresses: account?.address ? [account?.address] : [],
    contractAddresses: [tokenAddress],
  });

  const balance = useMemo(() => {
    if (!tokenAddress) return 0;
    const tokenContract = tokenContracts.find(
      (contract) => BigInt(contract.contract_address) === BigInt(tokenAddress),
    );
    if (!tokenContract) return 0;
    const tokenBalance = tokenBalances.find(
      (b) => BigInt(b.contract_address) === BigInt(tokenAddress),
    );
    if (!tokenBalance) return 0;
    return toDecimal(tokenContract, tokenBalance);
  }, [tokenContracts, tokenBalances, tokenAddress]);

  // Fetch username
  useEffect(() => {
    if (!connector) return;
    (connector as never as ControllerConnector).controller
      .username()
      ?.then((name) => setUsername(name));
  }, [connector]);

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
      pullCount: number;
      bagSize: number;
      level: number;
      isOver: boolean;
      hasNoGame: boolean;
    }> = [];

    for (const pack of packs) {
      const gameId = Math.max(pack.game_count, 1);
      const game = getGameForPack(pack.id, gameId);
      games.push({
        packId: pack.id,
        gameId,
        pullCount: game?.pull_count ?? 0,
        bagSize: game?.bag.length ?? 0,
        level: game?.level ?? 1,
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

  const handleNewGame = useCallback(() => {
    if (starterpack) {
      (connector as ControllerConnector)?.controller.openStarterPack(
        starterpack.id.toString(),
      );
    }
  }, [connector, starterpack]);

  const onProfileClick = useCallback(() => {
    (connector as never as ControllerConnector)?.controller.openProfile(
      "inventory",
    );
  }, [connector]);

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Header - full width */}
      <div className="relative flex items-center justify-between px-4 py-4">
        {/* Left: Back button */}
        <Button
          variant="secondary"
          className="h-12 w-12 p-0"
          onClick={() => navigate("/")}
        >
          <ArrowLeftIcon size="sm" />
        </Button>

        {/* Center: GlitchBomb icon - absolutely positioned for perfect centering */}
        <GlitchBombIcon
          size="xl"
          className="absolute left-1/2 -translate-x-1/2 text-white"
        />

        {/* Right: Balance + Profile */}
        <div className="flex gap-2">
          <Balance
            balance={balance}
            onClick={() => mint(tokenAddress)}
            className="w-auto px-4"
          />
          {username && (
            <Profile
              username={username}
              onClick={onProfileClick}
              className="w-auto px-4"
            />
          )}
        </div>
      </div>

      {/* Game list - centered with max width */}
      <div className="flex-1 overflow-y-auto px-4">
        <div className="flex flex-col gap-3 max-w-[500px] mx-auto">
          {gameList.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 min-h-[300px] text-green-600">
              <p className="font-secondary text-sm tracking-wider">
                No games yet
              </p>
              <Button
                variant="default"
                className="mt-4 h-10 px-6 font-secondary uppercase text-sm tracking-widest"
                onClick={handleNewGame}
              >
                Buy a Pack
              </Button>
            </div>
          ) : (
          gameList.map((game) => (
            <GameCard
              key={`${game.packId}-${game.gameId}`}
              gameId={game.gameId}
              pullCount={game.pullCount}
              bagSize={game.bagSize}
              level={game.level}
              hasStarted={!game.hasNoGame}
              isOver={game.isOver}
              onPlay={() =>
                handlePlay(game.packId, game.gameId, game.hasNoGame)
              }
            />
          ))
          )}
        </div>
      </div>
    </div>
  );
};
