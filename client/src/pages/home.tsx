import type ControllerConnector from "@cartridge/connector/controller";
import { useAccount, useConnect, useNetwork } from "@starknet-react/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/containers";
import { Connect, LoadingSpinner } from "@/components/elements";
import { ElectricBorder } from "@/components/ui/electric-border";
import { ArrowLeftIcon, ArrowRightIcon, BombIcon, OrbBombIcon } from "@/components/icons";
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
      health: number;
      moonrocks: number;
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
        health: game?.health ?? 0,
        moonrocks: pack.moonrocks ?? 0,
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

  // Total slides = active games + 1 placeholder "New Game" card
  const totalSlides = activeGames.length + 1;

  // Clamp index when the list changes
  useEffect(() => {
    setActiveGameIndex((prev) =>
      prev >= totalSlides ? totalSlides - 1 : prev,
    );
  }, [totalSlides]);

  const activeGame = activeGames[activeGameIndex] ?? null;
  const isOnNewGameCard = activeGameIndex >= activeGames.length;

  const handlePrev = useCallback(() => {
    if (activeGameIndex <= 0) return;
    setActiveGameIndex((i) => i - 1);
  }, [activeGameIndex]);

  const handleNext = useCallback(() => {
    if (activeGameIndex >= totalSlides - 1) return;
    setActiveGameIndex((i) => i + 1);
  }, [activeGameIndex, totalSlides]);

  // Drag/swipe carousel state
  const carouselRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; time: number } | null>(null);
  const didDrag = useRef(false);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (totalSlides <= 1) return;
      setIsDragging(true);
      setDragOffset(0);
      didDrag.current = false;
      dragStart.current = { x: e.clientX, time: Date.now() };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [activeGames.length],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragStart.current) return;
      const dx = e.clientX - dragStart.current.x;
      if (Math.abs(dx) > 5) didDrag.current = true;
      setDragOffset(dx);
    },
    [],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragStart.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dt = Date.now() - dragStart.current.time;
      const velocity = Math.abs(dx) / dt; // px/ms

      const containerWidth = carouselRef.current?.offsetWidth ?? 1;
      const threshold = containerWidth * 0.2;

      // Snap based on distance or velocity (fast flick)
      if (dx < -threshold || (dx < 0 && velocity > 0.5)) {
        setActiveGameIndex((i) => Math.min(i + 1, totalSlides - 1));
      } else if (dx > threshold || (dx > 0 && velocity > 0.5)) {
        setActiveGameIndex((i) => Math.max(i - 1, 0));
      }

      dragStart.current = null;
      setDragOffset(0);
      setIsDragging(false);
    },
    [totalSlides],
  );

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

      {/* Content */}
      <div className="flex-1 flex flex-col items-center px-4 pb-0 min-h-0 overflow-hidden">
        <div className="flex flex-col gap-4 w-full max-w-[500px] min-h-0">
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
              {totalSlides > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    gradient="green"
                    className="h-12 w-12 p-0"
                    onClick={handlePrev}
                    disabled={activeGameIndex <= 0}
                    aria-label="Previous game"
                  >
                    <ArrowLeftIcon size="sm" />
                  </Button>
                  <Button
                    variant="secondary"
                    gradient="green"
                    className="h-12 w-12 p-0"
                    onClick={handleNext}
                    disabled={activeGameIndex >= totalSlides - 1}
                    aria-label="Next game"
                  >
                    <ArrowRightIcon size="sm" />
                  </Button>
                </div>
              )}
            </div>

            {/* Game Cards — horizontal sliding carousel */}
            <div
              ref={carouselRef}
              className="overflow-hidden rounded-md touch-pan-y"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <div
                className={`flex ${isDragging ? "" : "transition-transform duration-300 ease-out"}`}
                style={{
                  transform: `translateX(calc(-${activeGameIndex * 100}% + ${dragOffset}px))`,
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
                        className="w-full p-3 flex items-center gap-3 text-left"
                        onClick={() => {
                          if (didDrag.current) return;
                          handlePlay(
                            game.packId,
                            game.gameId,
                            game.hasNoGame,
                          );
                        }}
                      >
                        {/* Icon container */}
                        <div className="shrink-0 self-stretch flex items-center justify-center rounded bg-white/[0.04] px-3">
                          <BombIcon
                            size="lg"
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
                                #{game.packId}
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
                                {game.moonrocks + game.points}
                              </p>
                            </div>
                          </div>
                        </div>

                        {loadingGameId ===
                          `${game.packId}-${game.gameId}` && (
                          <LoadingSpinner size="sm" />
                        )}
                      </button>
                    </ElectricBorder>
                  </div>
                ))}

                {/* New Game placeholder card */}
                <div key="new-game" className="w-full shrink-0">
                  <ElectricBorder
                    color="#FACC15"
                    gradient="linear-gradient(0deg, rgba(0,0,0,0.3), rgba(0,0,0,0.3))"
                    borderGradient="linear-gradient(0deg, #FACC15, #FCE360)"
                    seed={99}
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
                      className="w-full p-3 flex items-center gap-3 text-left"
                      onClick={() => {
                        if (didDrag.current) return;
                        handleNewGame();
                      }}
                    >
                      {/* Icon container */}
                      <div className="shrink-0 self-stretch flex items-center justify-center rounded bg-white/[0.04] px-3">
                        <span
                          className="font-secondary text-3xl"
                          style={{ color: "#FACC15" }}
                        >
                          +
                        </span>
                      </div>

                      {/* 2x2 grid */}
                      <div className="flex-1 min-w-0">
                        <div className="grid grid-cols-2 gap-x-2 gap-y-2">
                          <div className="flex flex-col gap-1">
                            <p
                              className="font-secondary text-sm leading-none"
                              style={{ color: "rgba(250, 204, 21, 0.24)" }}
                            >
                              Game ID
                            </p>
                            <p
                              className="font-secondary text-sm uppercase leading-none"
                              style={{ color: "#FACC15" }}
                            >
                              ---
                            </p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <p
                              className="font-secondary text-sm leading-none"
                              style={{ color: "rgba(250, 204, 21, 0.24)" }}
                            >
                              Expires In
                            </p>
                            <p
                              className="font-secondary text-sm uppercase leading-none"
                              style={{ color: "#FACC15" }}
                            >
                              ---
                            </p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <p
                              className="font-secondary text-sm leading-none"
                              style={{ color: "rgba(250, 204, 21, 0.24)" }}
                            >
                              Level
                            </p>
                            <p
                              className="font-secondary text-sm uppercase leading-none"
                              style={{ color: "#FACC15" }}
                            >
                              ---
                            </p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <p
                              className="font-secondary text-sm leading-none"
                              style={{ color: "rgba(250, 204, 21, 0.24)" }}
                            >
                              Max Payout
                            </p>
                            <p
                              className="font-secondary text-sm uppercase leading-none"
                              style={{ color: "#FACC15" }}
                            >
                              ---
                            </p>
                          </div>
                        </div>
                      </div>
                    </button>
                  </ElectricBorder>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Feed — finished games only, grouped by date */}
          {completedGames.length > 0 && (
            <div className="flex flex-col gap-3 min-h-0">
              <h2 className="text-white font-secondary text-xs tracking-widest uppercase shrink-0">
                ACTIVITY
              </h2>
              <div
                className="rounded-xl border border-green-900 bg-black-100 p-3 flex flex-col gap-3 overflow-y-auto"
                style={{ scrollbarWidth: "none" }}
              >
                {/* Today group */}
                <div className="flex flex-col gap-2">
                  {completedGames.slice(0, 2).map((game) => {
                    const cashedOut = game.health > 0;
                    return (
                      <div
                        key={`today-${game.packId}-${game.gameId}`}
                        className="flex items-center gap-2"
                      >
                        <button
                          type="button"
                          className="flex-1 min-w-0 flex items-center gap-4 rounded-lg px-4 py-3 transition-colors hover:brightness-110"
                          style={{ background: cashedOut ? "#071304" : "#1A0505" }}
                          onClick={() =>
                            navigate(
                              `/play?pack=${game.packId}&game=${game.gameId}&view=true`,
                            )
                          }
                        >
                          <BombIcon
                            size="md"
                            className="text-white shrink-0"
                          />
                          <span
                            className="font-secondary text-sm tracking-widest text-white"
                          >
                            #{game.packId}
                          </span>
                          <span
                            className="font-secondary text-sm tracking-widest text-white"
                          >
                            L{game.level}
                          </span>
                          <span
                            className="font-secondary text-sm tracking-widest"
                            style={{ color: cashedOut ? "#36F818" : "#EF4444" }}
                          >
                            {cashedOut
                              ? `+$${(game.points * 0.01).toFixed(2)}`
                              : "GLITCHED"}
                          </span>
                        </button>
                        <Button
                          variant="secondary"
                          gradient={cashedOut ? "green" : "red"}
                          className={`shrink-0 h-12 w-12 p-0 ${cashedOut ? "" : "!bg-[#1A0505] hover:!bg-[#2A0808] !text-red-100"}`}
                          onClick={() =>
                            navigate(
                              `/play?pack=${game.packId}&game=${game.gameId}&view=true`,
                            )
                          }
                          aria-label="View game"
                        >
                          <ArrowRightIcon size="sm" />
                        </Button>
                      </div>
                    );
                  })}
                </div>

                {/* Yesterday group */}
                {completedGames.length > 2 && (
                  <>
                    <p
                      className="font-secondary text-sm tracking-widest uppercase pt-1"
                      style={{ color: "#36F818" }}
                    >
                      YESTERDAY
                    </p>
                    <div className="flex flex-col gap-2">
                      {completedGames.slice(2).map((game) => {
                        const cashedOut = game.health > 0;
                        return (
                          <div
                            key={`yesterday-${game.packId}-${game.gameId}`}
                            className="flex items-center gap-2"
                          >
                            <button
                              type="button"
                              className="flex-1 min-w-0 flex items-center gap-4 rounded-lg px-4 py-3 transition-colors hover:brightness-110"
                              style={{ background: cashedOut ? "#071304" : "#1A0505" }}
                              onClick={() =>
                                navigate(
                                  `/play?pack=${game.packId}&game=${game.gameId}&view=true`,
                                )
                              }
                            >
                              <BombIcon
                                size="md"
                                className="text-white shrink-0"
                              />
                              <span
                                className="font-secondary text-sm tracking-widest text-white"
                              >
                                #{game.packId}
                              </span>
                              <span
                                className="font-secondary text-sm tracking-widest text-white"
                              >
                                L{game.level}
                              </span>
                              <span
                                className="font-secondary text-sm tracking-widest"
                                style={{ color: cashedOut ? "#36F818" : "#EF4444" }}
                              >
                                {cashedOut
                                  ? `+$${(game.points * 0.01).toFixed(2)}`
                                  : "GLITCHED"}
                              </span>
                            </button>
                            <Button
                              variant="secondary"
                              gradient={cashedOut ? "green" : "red"}
                              className={`shrink-0 h-12 w-12 p-0 ${cashedOut ? "" : "!bg-[#1A0505] hover:!bg-[#2A0808] !text-red-100"}`}
                              onClick={() =>
                                navigate(
                                  `/play?pack=${game.packId}&game=${game.gameId}&view=true`,
                                )
                              }
                              aria-label="View game"
                            >
                              <ArrowRightIcon size="sm" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 pt-4 pb-4 px-4">
        <div className="flex gap-3 w-full max-w-[500px] mx-auto">
          <Button
            variant="secondary"
            gradient="green"
            wrapperClassName="flex-1"
            className="w-full h-12 font-secondary uppercase text-sm tracking-widest"
            onClick={handlePractice}
          >
            PRACTICE
          </Button>
          <Button
            variant="secondary"
            gradient={isOnNewGameCard ? "yellow" : "green"}
            wrapperClassName={`flex-1 ${isOnNewGameCard ? "!bg-[linear-gradient(180deg,#FACC1560_0%,#FACC1500_100%)]" : "!bg-[linear-gradient(180deg,#35F81860_0%,#36F81800_100%)]"}`}
            className={`w-full h-12 font-secondary uppercase text-sm tracking-widest hover:!brightness-125 ${isOnNewGameCard ? "!text-yellow-100" : "!bg-green-900"}`}
            style={isOnNewGameCard ? { backgroundColor: "#3D3200" } : undefined}
            onClick={() => {
              if (isOnNewGameCard) {
                handleNewGame();
              } else if (activeGame) {
                handlePlay(
                  activeGame.packId,
                  activeGame.gameId,
                  activeGame.hasNoGame,
                );
              }
            }}
          >
            {isOnNewGameCard ? "NEW GAME" : "CONTINUE"}
          </Button>
        </div>
      </div>
    </div>
  );
};
