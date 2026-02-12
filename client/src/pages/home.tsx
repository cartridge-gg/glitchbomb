import type ControllerConnector from "@cartridge/connector/controller";
import { useAccount, useConnect, useNetwork } from "@starknet-react/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/containers";
import { Connect, LoadingSpinner, Multiplier } from "@/components/elements";
import { ArrowLeftIcon, ArrowRightIcon, BombIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { getTokenAddress } from "@/config";
import { useEntitiesContext } from "@/contexts/use-entities-context";
import { useActions } from "@/hooks/actions";
import { useGames } from "@/hooks/games";
import { usePacks } from "@/hooks/packs";
import { toDecimal, useTokens } from "@/hooks/tokens";
import { setOfflineMode } from "@/offline/mode";
import { createPack, start as startOffline } from "@/offline/store";

interface DashboardGame {
  packId: number;
  gameId: number;
  level: number;
  pullCount: number;
  bagSize: number;
  multiplier: number;
  points: number;
  health: number;
  isOver: boolean;
}

export const Home = () => {
  const navigate = useNavigate();
  const { chain } = useNetwork();
  const { account, connector } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { config, starterpack } = useEntitiesContext();
  const { mint, start: startGame } = useActions();
  const { packs } = usePacks();

  const [username, setUsername] = useState<string>();
  const [selectedOngoingIndex, setSelectedOngoingIndex] = useState(0);
  const [isStartingGame, setIsStartingGame] = useState(false);

  const pendingNavigationRef = useRef<{
    packId: number;
    gameId: number;
  } | null>(null);

  // Use token address from Config (blockchain state) if available, fallback to manifest.
  const tokenAddress = config?.token || getTokenAddress(chain.id);
  const { tokenBalances, tokenContracts } = useTokens({
    accountAddresses: account?.address ? [account.address] : [],
    contractAddresses: [tokenAddress],
  });

  const balance = useMemo(() => {
    if (!tokenAddress) return 0;
    const tokenContract = tokenContracts.find(
      (contract) => BigInt(contract.contract_address) === BigInt(tokenAddress),
    );
    if (!tokenContract) return 0;
    const tokenBalance = tokenBalances.find(
      (item) => BigInt(item.contract_address) === BigInt(tokenAddress),
    );
    if (!tokenBalance) return 0;
    return toDecimal(tokenContract, tokenBalance);
  }, [tokenContracts, tokenBalances, tokenAddress]);

  const allGameKeys = useMemo(() => {
    return packs.flatMap((pack) =>
      Array.from({ length: pack.game_count }, (_unused, index) => ({
        packId: pack.id,
        gameId: index + 1,
      })),
    );
  }, [packs]);

  const { games, getGameForPack } = useGames(allGameKeys);

  const gameList = useMemo<DashboardGame[]>(() => {
    const deduped = new Map<string, DashboardGame>();

    for (const game of games) {
      deduped.set(`${game.pack_id}-${game.id}`, {
        packId: game.pack_id,
        gameId: game.id,
        level: game.level,
        pullCount: game.pull_count,
        bagSize: game.bag.length,
        multiplier: game.multiplier,
        points: game.points,
        health: game.health,
        isOver: game.over,
      });
    }

    return [...deduped.values()].sort((a, b) => {
      if (a.packId !== b.packId) return b.packId - a.packId;
      return b.gameId - a.gameId;
    });
  }, [games]);

  const ongoingGames = useMemo(
    () => gameList.filter((game) => !game.isOver),
    [gameList],
  );

  const finishedGames = useMemo(
    () => gameList.filter((game) => game.isOver),
    [gameList],
  );

  const currentOngoingGame = ongoingGames[selectedOngoingIndex];

  const canCycleOngoingGames = ongoingGames.length > 1;

  useEffect(() => {
    if (!ongoingGames.length) {
      setSelectedOngoingIndex(0);
      return;
    }
    setSelectedOngoingIndex((previousIndex) =>
      Math.min(previousIndex, ongoingGames.length - 1),
    );
  }, [ongoingGames.length]);

  // Navigate once a just-started game becomes available from Torii.
  useEffect(() => {
    if (!pendingNavigationRef.current) return;

    const { packId, gameId } = pendingNavigationRef.current;
    const game = getGameForPack(packId, gameId);
    if (!game) return;

    pendingNavigationRef.current = null;
    setIsStartingGame(false);
    navigate(`/play?pack=${packId}&game=${gameId}`);
  }, [getGameForPack, navigate]);

  const onProfileClick = useCallback(() => {
    (connector as never as ControllerConnector)?.controller.openProfile(
      "inventory",
    );
  }, [connector]);

  const onConnectClick = useCallback(async () => {
    await connectAsync({ connector: connectors[0] });
  }, [connectAsync, connectors]);

  const onPurchaseClick = useCallback(() => {
    if (!starterpack) return;
    (connector as ControllerConnector)?.controller.openStarterPack(
      starterpack.id.toString(),
    );
  }, [connector, starterpack]);

  const onCyclePreviousGame = useCallback(() => {
    if (!ongoingGames.length) return;
    setSelectedOngoingIndex((current) => {
      return (current - 1 + ongoingGames.length) % ongoingGames.length;
    });
  }, [ongoingGames.length]);

  const onCycleNextGame = useCallback(() => {
    if (!ongoingGames.length) return;
    setSelectedOngoingIndex((current) => {
      return (current + 1) % ongoingGames.length;
    });
  }, [ongoingGames.length]);

  const onContinueClick = useCallback(async () => {
    setOfflineMode(false);

    if (currentOngoingGame) {
      navigate(
        `/play?pack=${currentOngoingGame.packId}&game=${currentOngoingGame.gameId}`,
      );
      return;
    }

    const packToStart = [...packs]
      .sort((a, b) => b.id - a.id)
      .find((pack) => pack.game_count === 0);

    if (!packToStart) {
      onPurchaseClick();
      return;
    }

    setIsStartingGame(true);
    pendingNavigationRef.current = { packId: packToStart.id, gameId: 1 };

    const started = await startGame(packToStart.id);
    if (started) return;

    pendingNavigationRef.current = null;
    setIsStartingGame(false);
  }, [currentOngoingGame, navigate, onPurchaseClick, packs, startGame]);

  const onPracticeClick = useCallback(() => {
    setOfflineMode(true);
    const packId = createPack();
    const started = startOffline(packId);
    if (!started) return;
    navigate(`/play?pack=${packId}&game=1`);
  }, [navigate]);

  const onViewFinishedGame = useCallback(
    (packId: number, gameId: number) => {
      setOfflineMode(false);
      navigate(`/play?pack=${packId}&game=${gameId}&view=true`);
    },
    [navigate],
  );

  // Fetch username.
  useEffect(() => {
    if (!connector) return;
    (connector as never as ControllerConnector).controller
      .username()
      ?.then((name) => setUsername(name));
  }, [connector]);

  const isLoggedIn = !!account && !!username;

  if (!isLoggedIn) {
    return (
      <div className="absolute inset-0">
        <div className="flex h-full flex-col items-center justify-center px-4">
          <div className="inline-grid grid-cols-1 justify-items-center gap-8">
            <h1 className="m-0 text-center uppercase leading-[0.9]">
              <strong className="block text-green-400 text-6xl md:text-7xl font-glitch font-thin tracking-tight">
                Glitch
              </strong>
              <span className="block text-white text-7xl md:text-8xl tracking-tight">
                Bomb
              </span>
            </h1>

            <div className="grid w-full grid-cols-1 gap-3">
              <Connect highlight className="h-12 w-full px-10" onClick={onConnectClick} />
              <Button
                variant="secondary"
                className="h-11 w-full px-10 font-secondary uppercase text-sm tracking-widest"
                disabled
              >
                Play
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col">
      <AppHeader
        moonrocks={balance}
        username={username}
        showBack={false}
        onMint={() => mint(tokenAddress)}
        onProfileClick={onProfileClick}
      />

      <div className="flex-1 overflow-hidden px-4 pb-4">
        <div className="mx-auto flex h-full w-full max-w-[460px] flex-col gap-4">
          <div className="relative overflow-hidden rounded-lg border border-[#5C2BBE] bg-gradient-to-b from-[#591FFF]/70 to-[#591FFF]/0 px-5 py-4 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)]">
            <div
              className="pointer-events-none absolute inset-0 opacity-70"
              style={{
                background:
                  "radial-gradient(140% 100% at 100% 100%, rgba(57,211,27,0.18) 0%, rgba(89,31,255,0) 55%)",
              }}
            />
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <BombIcon className="h-10 w-10 text-white" />
                <div className="leading-none">
                  <p className="font-secondary text-xs uppercase tracking-[0.24em] text-green-300">
                    Play
                  </p>
                  <p className="text-3xl uppercase tracking-[0.02em] text-white">
                    Nums
                  </p>
                </div>
              </div>

              <Button
                variant="default"
                className="h-10 min-w-[96px] px-5 text-sm font-secondary uppercase tracking-[0.2em] text-black"
                style={{ backgroundColor: "#48F095", color: "#0A1D12" }}
                onClick={onPurchaseClick}
              >
                Play
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-secondary text-base uppercase tracking-[0.2em] text-green-400">
                My Games
              </span>
              <span className="flex h-8 min-w-10 items-center justify-center rounded-full bg-black/20 px-3 text-2xl text-white">
                {ongoingGames.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                className="h-10 w-10 p-0"
                onClick={onCyclePreviousGame}
                disabled={!canCycleOngoingGames}
              >
                <ArrowLeftIcon size="xs" className="text-green-400" />
              </Button>
              <Button
                variant="secondary"
                className="h-10 w-10 p-0"
                onClick={onCycleNextGame}
                disabled={!canCycleOngoingGames}
              >
                <ArrowRightIcon size="xs" className="text-green-400" />
              </Button>
            </div>
          </div>

          {currentOngoingGame ? (
            <div className="rounded-lg border-2 border-orange-100 bg-black/40 p-3 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)]">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 rounded-lg bg-white/5 p-1.5">
                  <Multiplier
                    count={currentOngoingGame.multiplier}
                    className="h-full w-full"
                    cornerRadius={6}
                  />
                </div>

                <div className="grid flex-1 grid-cols-2 gap-x-3 gap-y-1 text-xs uppercase">
                  <div>
                    <p className="font-secondary tracking-[0.16em] text-orange-100/40">
                      Game ID
                    </p>
                    <p className="font-secondary tracking-[0.16em] text-orange-100">
                      #{currentOngoingGame.gameId}
                    </p>
                  </div>
                  <div>
                    <p className="font-secondary tracking-[0.16em] text-orange-100/40">
                      Progress
                    </p>
                    <p className="font-secondary tracking-[0.16em] text-orange-100">
                      {currentOngoingGame.pullCount}/{currentOngoingGame.bagSize}
                    </p>
                  </div>
                  <div>
                    <p className="font-secondary tracking-[0.16em] text-orange-100/40">
                      Level
                    </p>
                    <p className="font-secondary tracking-[0.16em] text-orange-100">
                      L{currentOngoingGame.level}
                    </p>
                  </div>
                  <div>
                    <p className="font-secondary tracking-[0.16em] text-orange-100/40">
                      Points
                    </p>
                    <p className="font-secondary tracking-[0.16em] text-orange-100">
                      {currentOngoingGame.points}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-black/15 bg-black/30 px-4 py-6 text-center">
              <p className="font-secondary text-sm uppercase tracking-[0.22em] text-green-300/70">
                No ongoing games
              </p>
            </div>
          )}

          <div className="font-secondary text-base uppercase tracking-[0.2em] text-green-400">
            Activity
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border-2 border-black/15 bg-black/40 p-3">
            <div className="flex flex-col gap-2">
              {finishedGames.map((game) => (
                <div key={`${game.packId}-${game.gameId}`} className="flex items-center gap-2">
                  <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-black/15 px-3 py-2">
                    <BombIcon className="h-4 w-4 shrink-0 text-white" />
                    <span className="truncate font-secondary text-sm uppercase tracking-[0.14em] text-white">
                      #{game.gameId}
                    </span>
                    <span className="font-secondary text-xs uppercase tracking-[0.14em] text-white/70">
                      L{game.level}
                    </span>
                    <span className="ml-auto truncate font-secondary text-xs uppercase tracking-[0.14em] text-green-400">
                      {game.health > 0 ? "Cashed Out" : "Busted"}
                    </span>
                  </div>

                  <Button
                    variant="secondary"
                    className="h-10 w-10 p-0"
                    onClick={() => onViewFinishedGame(game.packId, game.gameId)}
                  >
                    <ArrowRightIcon size="xs" className="text-green-400" />
                  </Button>
                </div>
              ))}

              {finishedGames.length === 0 && (
                <div className="rounded-lg bg-black/15 px-3 py-6 text-center">
                  <p className="font-secondary text-xs uppercase tracking-[0.2em] text-green-300/70">
                    No finished games yet
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <Button
              variant="secondary"
              className="h-12 font-secondary text-sm uppercase tracking-[0.2em]"
              onClick={onPracticeClick}
            >
              Practice
            </Button>

            <Button
              variant="default"
              className="h-12 font-secondary text-sm uppercase tracking-[0.2em]"
              onClick={onContinueClick}
              disabled={isStartingGame}
            >
              {isStartingGame ? <LoadingSpinner size="sm" /> : "Continue"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
