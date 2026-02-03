import type ControllerConnector from "@cartridge/connector/controller";
import { useAccount, useNetwork } from "@starknet-react/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppHeader } from "@/components/containers";
import { LoadingSpinner, TabBar } from "@/components/elements";
import {
  ControllerIcon,
  MoonrockIcon,
  SparkleIcon,
} from "@/components/icons";
import { getTokenAddress } from "@/config";
import { useEntitiesContext } from "@/contexts";
import { useActions } from "@/hooks/actions";
import { useGames } from "@/hooks/games";
import { usePacks } from "@/hooks/packs";
import { toDecimal, useTokens } from "@/hooks/tokens";
import { setOfflineMode, useOfflineMode } from "@/offline/mode";
import {
  createPack,
  selectTotalMoonrocks,
  useOfflineStore,
} from "@/offline/store";

interface GameCardProps {
  gameId: number;
  pullCount: number;
  bagSize: number;
  level: number;
  hasStarted: boolean;
  isOver?: boolean;
  isLoading?: boolean;
  onPlay: () => void;
  onView?: () => void;
}

const GameCard = ({
  gameId,
  pullCount,
  bagSize,
  level,
  hasStarted,
  isOver,
  isLoading,
  onPlay,
  onView,
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
        <SparkleIcon size="lg" className="text-green-400 relative z-10" />
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

      {/* Play/View Button */}
      {isOver ? (
        <button
          type="button"
          className="flex items-center justify-center h-10 px-6 rounded-lg font-secondary uppercase text-sm tracking-widest transition-all duration-200 hover:brightness-110 bg-[#0A2518] text-green-400"
          onClick={onView}
        >
          View
        </button>
      ) : (
        <button
          type="button"
          className="flex items-center justify-center h-10 w-24 rounded-lg font-secondary uppercase text-sm tracking-widest transition-all duration-200 hover:brightness-110 bg-[#0A2518] text-green-400 disabled:opacity-50"
          onClick={onPlay}
          disabled={isLoading}
        >
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : hasStarted ? (
            "Continue"
          ) : (
            "Play"
          )}
        </button>
      )}
    </div>
  );
};

export const Games = () => {
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const { chain } = useNetwork();
  const { account, connector } = useAccount();
  const { starterpack, config } = useEntitiesContext();
  const { start, mint } = useActions();
  const { packs } = usePacks();
  const offlineState = useOfflineStore();
  const offlineMode = useOfflineMode();
  const [username, setUsername] = useState<string>();
  const [loadingGameId, setLoadingGameId] = useState<string | null>(null);
  const pendingNavigationRef = useRef<{
    packId: number;
    gameId: number;
  } | null>(null);

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
  const offlineMoonrocks = useMemo(
    () => selectTotalMoonrocks(offlineState),
    [offlineState],
  );
  const isLoggedIn = !!account && !!username;
  const canUseOffline = isLoggedIn;
  const offline = offlineMode && canUseOffline;
  const mode: "onchain" | "offline" = offline ? "offline" : "onchain";
  const displayMoonrocks = offline ? offlineMoonrocks : balance;
  const displayUsername = username;

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

  // Navigate when pending game becomes available
  useEffect(() => {
    if (!pendingNavigationRef.current) return;
    const { packId, gameId } = pendingNavigationRef.current;
    const game = getGameForPack(packId, gameId);
    if (game) {
      pendingNavigationRef.current = null;
      setLoadingGameId(null);
      navigate(`/play?pack=${packId}&game=${gameId}`);
    }
  }, [getGameForPack, navigate]);

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

    return games.sort((a, b) => b.packId - a.packId);
  }, [packs, getGameForPack]);

  const handlePlay = async (
    packId: number,
    gameId: number,
    hasNoGame: boolean,
  ) => {
    const gameKey = `${packId}-${gameId}`;
    setLoadingGameId(gameKey);

    // Check if game already exists
    const existingGame = getGameForPack(packId, gameId);
    if (existingGame) {
      // Game already loaded, navigate immediately
      navigate(`/play?pack=${packId}&game=${gameId}`);
      return;
    }

    // Set pending navigation - will navigate when game is available
    pendingNavigationRef.current = { packId, gameId };

    try {
      if (hasNoGame) {
        await start(packId);
      }
      // Navigation will happen in useEffect when game becomes available
    } catch (error) {
      console.error(error);
      pendingNavigationRef.current = null;
      setLoadingGameId(null);
    }
  };

  const handleView = (packId: number, gameId: number) => {
    navigate(`/play?pack=${packId}&game=${gameId}&view=true`);
  };

  const handleNewGame = useCallback(() => {
    if (offline) {
      createPack();
      return;
    }
    if (starterpack) {
      (connector as ControllerConnector)?.controller.openStarterPack(
        starterpack.id.toString(),
      );
    }
  }, [connector, starterpack, offline]);

  const onProfileClick = useCallback(() => {
    (connector as never as ControllerConnector)?.controller.openProfile(
      "inventory",
    );
  }, [connector]);

  const persistMode = useCallback(
    (nextMode: "onchain" | "offline") => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        if (nextMode === "offline") {
          params.set("offline", "1");
        } else {
          params.delete("offline");
        }
        setSearchParams(params, { replace: true });
        setOfflineMode(nextMode === "offline");
      }
    },
    [setSearchParams],
  );

  const handleModeChange = useCallback(
    (nextMode: "onchain" | "offline") => {
      if (nextMode === "offline" && !canUseOffline) return;
      persistMode(nextMode);
    },
    [canUseOffline, persistMode],
  );

  useEffect(() => {
    if (canUseOffline || !offlineMode) return;
    persistMode("onchain");
  }, [canUseOffline, offlineMode, persistMode]);

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Header */}
      <AppHeader
        moonrocks={displayMoonrocks}
        username={displayUsername}
        showBack={true}
        backPath="/"
        onMint={offline ? undefined : () => mint(tokenAddress)}
        onProfileClick={onProfileClick}
      />

      {/* Content */}
      <div className="flex-1 flex flex-col items-center px-4 pt-24 pb-16 overflow-y-auto">
        <div className="flex flex-col gap-6 w-full max-w-[500px]">
          <TabBar
            items={[
              { id: "onchain", label: "On-Chain", Icon: ControllerIcon },
              ...(isLoggedIn
                ? [{ id: "offline", label: "Offline", Icon: MoonrockIcon }]
                : []),
            ]}
            active={mode}
            onChange={handleModeChange}
          />
          {/* Purchase New Game Card */}
          <div className="flex flex-col items-center gap-4 p-6 rounded-xl border border-green-900 bg-green-950/30">
            <p className="text-white font-secondary text-sm tracking-widest uppercase">
              {offline ? "Offline Mode" : "Play Now"}
            </p>
            <button
              type="button"
              className="flex items-center justify-center gap-2 h-10 px-6 rounded-lg font-secondary uppercase text-sm tracking-widest transition-all duration-200 hover:brightness-110 bg-[#0A2518] text-green-400"
              onClick={handleNewGame}
            >
              <MoonrockIcon size="sm" />
              {offline ? "Play Offline for Free" : "Purchase"}
            </button>
          </div>

          {/* Game list */}
          <div className="flex flex-col gap-3">
            {gameList.map((game) => (
              <GameCard
                key={`${game.packId}-${game.gameId}`}
                gameId={game.gameId}
                pullCount={game.pullCount}
                bagSize={game.bagSize}
                level={game.level}
                hasStarted={!game.hasNoGame}
                isOver={game.isOver}
                isLoading={loadingGameId === `${game.packId}-${game.gameId}`}
                onPlay={() =>
                  handlePlay(game.packId, game.gameId, game.hasNoGame)
                }
                onView={() => handleView(game.packId, game.gameId)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
