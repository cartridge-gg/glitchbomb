import type ControllerConnector from "@cartridge/connector/controller";
import { useAccount, useConnect, useNetwork } from "@starknet-react/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/containers";
import { Connect, LoadingSpinner } from "@/components/elements";
import { ElectricBorder } from "@/components/ui/electric-border";
import { ArrowRightIcon, OrbBombIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { getTokenAddress } from "@/config";
import { useEntitiesContext } from "@/contexts/use-entities-context";
import { useActions } from "@/hooks/actions";
import { useGames } from "@/hooks/games";
import { usePacks } from "@/hooks/packs";
import { toDecimal, useTokens } from "@/hooks/tokens";
import { isOfflineMode, setOfflineMode } from "@/offline/mode";
import {
  createPack,
  selectTotalMoonrocks,
  useOfflineStore,
} from "@/offline/store";

export const Home = () => {
  const navigate = useNavigate();
  const { mint, start } = useActions();
  const { chain } = useNetwork();
  const { account, address, connector } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { starterpack, config } = useEntitiesContext();
  const { packs } = usePacks();
  const offlineState = useOfflineStore();
  const [username, setUsername] = useState<string>();
  const [loadingGameId, setLoadingGameId] = useState<string | null>(null);
  const pendingNavigationRef = useRef<{
    packId: number;
    gameId: number;
  } | null>(null);

  const offline = isOfflineMode();

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
      (b) => BigInt(b.contract_address) === BigInt(tokenAddress),
    );
    if (!tokenBalance) return 0;
    return toDecimal(tokenContract, tokenBalance);
  }, [tokenContracts, tokenBalances, tokenAddress]);

  const offlineMoonrocks = useMemo(
    () => selectTotalMoonrocks(offlineState),
    [offlineState],
  );
  const displayMoonrocks = offline ? offlineMoonrocks : balance;

  const onProfileClick = useCallback(() => {
    (connector as never as ControllerConnector)?.controller.openProfile(
      "inventory",
    );
  }, [connector]);

  const onConnectClick = useCallback(async () => {
    await connectAsync({ connector: connectors[0] });
  }, [connectAsync, connectors]);

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

  // Build game list
  const gameList = useMemo(() => {
    const games: Array<{
      packId: number;
      gameId: number;
      pullCount: number;
      bagSize: number;
      level: number;
      isOver: boolean;
      hasNoGame: boolean;
      points: number;
      multiplier: number;
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
        points: game?.points ?? 0,
        multiplier: game?.multiplier ?? 1,
      });
    }

    return games.sort((a, b) => b.packId - a.packId);
  }, [packs, getGameForPack]);

  // Split into active and completed games
  const activeGames = useMemo(
    () => gameList.filter((g) => !g.isOver),
    [gameList],
  );

  const completedGames = useMemo(
    () => gameList.filter((g) => g.isOver),
    [gameList],
  );

  const [activeGameIndex, setActiveGameIndex] = useState(0);

  // Clamp index when the list changes
  useEffect(() => {
    if (activeGames.length === 0) return;
    setActiveGameIndex((prev) =>
      prev >= activeGames.length ? activeGames.length - 1 : prev,
    );
  }, [activeGames.length]);

  const activeGame = activeGames[activeGameIndex] ?? null;

  const handlePrev = useCallback(() => {
    if (activeGameIndex <= 0) return;
    setActiveGameIndex((i) => i - 1);
  }, [activeGameIndex]);

  const handleNext = useCallback(() => {
    if (activeGameIndex >= activeGames.length - 1) return;
    setActiveGameIndex((i) => i + 1);
  }, [activeGameIndex, activeGames.length]);

  const handlePlay = async (
    packId: number,
    gameId: number,
    hasNoGame: boolean,
  ) => {
    const gameKey = `${packId}-${gameId}`;
    setLoadingGameId(gameKey);

    const existingGame = getGameForPack(packId, gameId);
    if (existingGame) {
      navigate(`/play?pack=${packId}&game=${gameId}`);
      return;
    }

    pendingNavigationRef.current = { packId, gameId };

    try {
      if (hasNoGame) {
        await start(packId);
      }
    } catch (error) {
      console.error(error);
      pendingNavigationRef.current = null;
      setLoadingGameId(null);
    }
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

  const handlePractice = useCallback(() => {
    setOfflineMode(true);
    createPack();
  }, []);

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
              <Connect
                highlight
                className="h-12 w-full px-10"
                onClick={onConnectClick}
              />
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
      {/* Header */}
      <AppHeader
        moonrocks={displayMoonrocks}
        username={username}
        showBack={false}
        onMint={offline ? undefined : () => mint(tokenAddress)}
        onProfileClick={onProfileClick}
      />

      {/* Scrollable content */}
      <div
        className="flex-1 flex flex-col items-center px-4 pb-0 overflow-y-auto"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="flex flex-col gap-4 w-full max-w-[500px]">
          {/* Banner */}
          <button
            type="button"
            className="w-full rounded-xl p-4 flex items-center justify-between"
            style={{
              background:
                "linear-gradient(135deg, rgba(89,31,255,0.64) 0%, transparent 100%)",
            }}
            onClick={() => {
              if (activeGame) {
                handlePlay(
                  activeGame.packId,
                  activeGame.gameId,
                  activeGame.hasNoGame,
                );
              } else {
                handleNewGame();
              }
            }}
          >
            <div className="flex items-center gap-3">
              <OrbBombIcon size="xl" className="text-white" />
              <div className="text-left">
                <p className="text-green-400 font-body text-xl uppercase leading-tight">
                  Play
                </p>
                <p className="text-white font-body text-2xl uppercase leading-tight">
                  Nums
                </p>
              </div>
            </div>
            <div className="bg-yellow-100 text-black-100 font-secondary text-sm tracking-widest uppercase px-5 py-2.5 rounded-lg font-bold">
              PLAY
            </div>
          </button>

          {/* My Games Section */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-white font-secondary text-xs tracking-widest uppercase">
                  MY GAMES
                </h2>
                <span className="text-white/60 font-secondary text-xs tracking-widest bg-white/10 px-2 py-0.5 rounded-full">
                  {activeGames.length}
                </span>
              </div>
              {activeGames.length > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex items-center justify-center h-12 w-12 rounded-xl bg-green-900 transition-colors hover:brightness-110 disabled:opacity-30"
                    onClick={handlePrev}
                    disabled={activeGameIndex <= 0}
                    aria-label="Previous game"
                  >
                    <svg
                      viewBox="0 0 16 16"
                      className="h-5 w-5"
                      fill="none"
                    >
                      <path
                        d="M8.55 3H9.66V4.11H8.55V3ZM7.44 4.11H8.55V5.22H7.44V4.11ZM6.33 5.22H7.44V6.33H6.33V5.22ZM5.22 6.33H6.33V7.44H5.22V6.33ZM4.11 7.44H5.22V8.55H4.11V7.44ZM5.22 8.55H6.33V9.66H5.22V8.55ZM6.33 9.66H7.44V10.77H6.33V9.66ZM7.44 10.77H8.55V11.88H7.44V10.77ZM8.55 11.88H9.66V13H8.55V11.88ZM10.77 6.33H11.88V9.66H10.77V6.33Z"
                        fill="currentColor"
                        className="text-green-400"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center h-12 w-12 rounded-xl bg-green-900 transition-colors hover:brightness-110 disabled:opacity-30"
                    onClick={handleNext}
                    disabled={activeGameIndex >= activeGames.length - 1}
                    aria-label="Next game"
                  >
                    <svg
                      viewBox="0 0 16 16"
                      className="h-5 w-5"
                      fill="none"
                    >
                      <path
                        d="M6.33 3H7.44V4.11H6.33V3ZM7.44 4.11H8.55V5.22H7.44V4.11ZM8.55 5.22H9.66V6.33H8.55V5.22ZM9.66 6.33H10.77V7.44H9.66V6.33ZM10.77 7.44H11.88V8.55H10.77V7.44ZM9.66 8.55H10.77V9.66H9.66V8.55ZM8.55 9.66H9.66V10.77H8.55V9.66ZM7.44 10.77H8.55V11.88H7.44V10.77ZM6.33 11.88H7.44V13H6.33V11.88ZM4.11 6.33H5.22V9.66H4.11V6.33Z"
                        fill="currentColor"
                        className="text-green-400"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Active Game Cards — horizontal sliding carousel */}
            {activeGames.length > 0 && (
              <div className="overflow-hidden rounded-md">
                <div
                  className="flex transition-transform duration-300 ease-out"
                  style={{
                    transform: `translateX(-${activeGameIndex * 100}%)`,
                  }}
                >
                  {activeGames.map((game, idx) => (
                    <div
                      key={`${game.packId}-${game.gameId}`}
                      className="w-full shrink-0"
                    >
                      <ElectricBorder
                        color="#36F818"
                        gradient="linear-gradient(0deg, rgba(0,0,0,0.3), rgba(0,0,0,0.3))"
                        borderGradient="linear-gradient(0deg, #36F818, #81F464)"
                        seed={42 + idx}
                        cornerRadius={3}
                        noiseAmplitude={0.15}
                        borderWidth={2}
                        safetyMargin={1}
                        noisePoints={400}
                        noiseFrequency={20}
                        glowOpacity={0}
                        className="rounded-md"
                      >
                        <button
                          type="button"
                          className="w-full p-3 flex items-center gap-3"
                          onClick={() =>
                            handlePlay(
                              game.packId,
                              game.gameId,
                              game.hasNoGame,
                            )
                          }
                        >
                          {/* Icon container */}
                          <div className="shrink-0 flex items-center justify-center rounded bg-white/[0.04] p-2">
                            <OrbBombIcon
                              size="sm"
                              className="text-green-400"
                            />
                          </div>

                          {/* 2x2 grid */}
                          <div className="flex-1 min-w-0">
                            <div className="grid grid-cols-2 gap-x-2 gap-y-2">
                              <div className="flex flex-col gap-1">
                                <p
                                  className="font-secondary text-sm leading-none"
                                  style={{ color: "rgba(54, 248, 24, 0.24)" }}
                                >
                                  Game ID
                                </p>
                                <p
                                  className="font-secondary text-sm uppercase leading-none"
                                  style={{ color: "#36F818" }}
                                >
                                  #{game.gameId}
                                </p>
                              </div>
                              <div className="flex flex-col gap-1">
                                <p
                                  className="font-secondary text-sm leading-none"
                                  style={{ color: "rgba(54, 248, 24, 0.24)" }}
                                >
                                  Expires In
                                </p>
                                <p
                                  className="font-secondary text-sm uppercase leading-none"
                                  style={{ color: "#36F818" }}
                                >
                                  --
                                </p>
                              </div>
                              <div className="flex flex-col gap-1">
                                <p
                                  className="font-secondary text-sm leading-none"
                                  style={{ color: "rgba(54, 248, 24, 0.24)" }}
                                >
                                  Level
                                </p>
                                <p
                                  className="font-secondary text-sm uppercase leading-none"
                                  style={{ color: "#36F818" }}
                                >
                                  L{game.level}
                                </p>
                              </div>
                              <div className="flex flex-col gap-1">
                                <p
                                  className="font-secondary text-sm leading-none"
                                  style={{ color: "rgba(54, 248, 24, 0.24)" }}
                                >
                                  Max Payout
                                </p>
                                <p
                                  className="font-secondary text-sm uppercase leading-none"
                                  style={{ color: "#36F818" }}
                                >
                                  {game.points}
                                </p>
                              </div>
                            </div>
                          </div>

                          {loadingGameId ===
                          `${game.packId}-${game.gameId}` ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <ArrowRightIcon
                              size="xs"
                              className="text-green-400 shrink-0"
                            />
                          )}
                        </button>
                      </ElectricBorder>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {gameList.length === 0 && (
              <div className="flex flex-col items-center gap-4 p-6 rounded-xl border border-green-900 bg-green-950/30">
                <p className="text-white/60 font-secondary text-sm tracking-widest uppercase">
                  No games yet
                </p>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 h-10 px-6 rounded-lg font-secondary uppercase text-sm tracking-widest transition-all duration-200 hover:brightness-110 bg-green-900 text-green-400"
                  onClick={handleNewGame}
                >
                  Purchase
                </button>
              </div>
            )}
          </div>

          {/* Activity Feed — finished games only, sorted by most recent */}
          {completedGames.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-white font-secondary text-xs tracking-widest uppercase">
                ACTIVITY
              </h2>
              <div
                className="rounded-xl overflow-hidden"
                style={{ background: "rgba(1,1,1,0.4)" }}
              >
                <div className="px-3 py-2">
                  <p className="text-white/30 font-secondary text-2xs tracking-widest uppercase">
                    Recent
                  </p>
                </div>
                {completedGames.map((game) => (
                  <button
                    key={`${game.packId}-${game.gameId}`}
                    type="button"
                    className="w-full flex items-center gap-3 px-3 py-3 hover:bg-white/5 transition-colors"
                    onClick={() =>
                      navigate(
                        `/play?pack=${game.packId}&game=${game.gameId}&view=true`,
                      )
                    }
                  >
                    <OrbBombIcon
                      size="md"
                      className="text-green-600 shrink-0"
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-white font-body text-sm uppercase">
                        Game #{game.gameId}
                      </p>
                    </div>
                    <span className="text-white/60 font-secondary text-xs tracking-widest">
                      LVL {game.level}
                    </span>
                    <span className="text-green-400 font-secondary text-xs tracking-widest">
                      {game.points > 0 ? `+${game.points}` : game.points}
                    </span>
                    <ArrowRightIcon
                      size="xs"
                      className="text-white/30 shrink-0"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Spacer for footer */}
          <div className="h-20" />
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-black-100 via-black-100 to-transparent pt-6 pb-4 px-4">
        <div className="flex gap-3 w-full max-w-[500px] mx-auto">
          <Button
            variant="secondary"
            className="flex-1 h-12 font-secondary uppercase text-sm tracking-widest"
            onClick={handlePractice}
          >
            PRACTICE
          </Button>
          <button
            type="button"
            className="flex-1 h-12 rounded-lg font-secondary uppercase text-sm tracking-widest font-bold bg-green-900 text-white hover:brightness-110 transition-all disabled:opacity-50"
            onClick={() => {
              if (activeGame) {
                handlePlay(
                  activeGame.packId,
                  activeGame.gameId,
                  activeGame.hasNoGame,
                );
              } else {
                handleNewGame();
              }
            }}
          >
            {activeGame ? "CONTINUE" : "NEW GAME"}
          </button>
        </div>
      </div>
    </div>
  );
};
