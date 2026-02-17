import type ControllerConnector from "@cartridge/connector/controller";
import { useAccount, useConnect, useNetwork } from "@starknet-react/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/containers";
import { LoadingSpinner } from "@/components/elements";
import {
  ArrowRightIcon,
  BombIcon,
  BracketArrowIcon,
  NumsLogoIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ElectricBorder } from "@/components/ui/electric-border";
import { GradientBorder } from "@/components/ui/gradient-border";
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
  const { account, connector } = useAccount();
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
      updatedAt: number;
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
        updatedAt: pack.updated_at ?? 0,
      });
    }

    return games.sort((a, b) => b.updatedAt - a.updatedAt || b.packId - a.packId);
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

  // Group completed games by dynamic date labels using entity timestamps
  const activityGroups = useMemo(() => {
    if (completedGames.length === 0) return [];

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const todayMs = startOfToday.getTime();
    const yesterdayMs = todayMs - 86_400_000;

    const getLabel = (tsMs: number): string => {
      if (tsMs >= todayMs) return "Today";
      if (tsMs >= yesterdayMs) return "Yesterday";

      const daysAgo = Math.floor((todayMs - tsMs) / 86_400_000);
      if (daysAgo < 7) return `${daysAgo} Days Ago`;

      const weeksAgo = Math.floor(daysAgo / 7);
      if (weeksAgo === 1) return "Last Week";
      if (daysAgo < 30) return `${weeksAgo} Weeks Ago`;

      const d = new Date(tsMs);
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      if (d.getFullYear() === now.getFullYear()) return monthNames[d.getMonth()];
      return `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    };

    // Preserve insertion order (games are already sorted by most recent first)
    const grouped: Array<{ label: string; games: typeof completedGames }> = [];
    const labelIndex: Record<string, number> = {};

    for (const game of completedGames) {
      const tsMs = game.updatedAt > 0 ? game.updatedAt * 1000 : Date.now();
      const label = getLabel(tsMs);
      if (label in labelIndex) {
        grouped[labelIndex[label]].games.push(game);
      } else {
        labelIndex[label] = grouped.length;
        grouped.push({ label, games: [game] });
      }
    }

    return grouped;
  }, [completedGames]);

  const [bannerIndex, setBannerIndex] = useState(0);
  const bannerCount = 2;
  const bannerDragStart = useRef<{ x: number; time: number } | null>(null);
  const [bannerDragOffset, setBannerDragOffset] = useState(0);
  const [isBannerDragging, setIsBannerDragging] = useState(false);
  const bannerDidDrag = useRef(false);

  const handleBannerPointerDown = useCallback((e: React.PointerEvent) => {
    setIsBannerDragging(true);
    setBannerDragOffset(0);
    bannerDidDrag.current = false;
    bannerDragStart.current = { x: e.clientX, time: Date.now() };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handleBannerPointerMove = useCallback((e: React.PointerEvent) => {
    if (!bannerDragStart.current) return;
    const dx = e.clientX - bannerDragStart.current.x;
    if (Math.abs(dx) > 5) bannerDidDrag.current = true;
    setBannerDragOffset(dx);
  }, []);

  const handleBannerPointerUp = useCallback((e: React.PointerEvent) => {
    if (!bannerDragStart.current) return;
    const dx = e.clientX - bannerDragStart.current.x;
    const dt = Date.now() - bannerDragStart.current.time;
    const velocity = Math.abs(dx) / dt;
    const threshold = 60;

    if (dx < -threshold || (dx < 0 && velocity > 0.5)) {
      setBannerIndex((i) => Math.min(i + 1, bannerCount - 1));
    } else if (dx > threshold || (dx > 0 && velocity > 0.5)) {
      setBannerIndex((i) => Math.max(i - 1, 0));
    }

    bannerDragStart.current = null;
    setBannerDragOffset(0);
    setIsBannerDragging(false);
  }, []);

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
    [totalSlides],
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    if (Math.abs(dx) > 5) didDrag.current = true;
    setDragOffset(dx);
  }, []);

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

  const requireLogin = useCallback(
    (action: () => void) => {
      if (!isLoggedIn) {
        onConnectClick();
        return;
      }
      action();
    },
    [isLoggedIn, onConnectClick],
  );

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Header */}
      <AppHeader
        moonrocks={displayMoonrocks}
        username={username}
        showBack={false}
        onMint={offline ? undefined : () => mint(tokenAddress)}
        onProfileClick={onProfileClick}
        onConnect={isLoggedIn ? undefined : onConnectClick}
      />

      {/* Content */}
      <div className="flex-1 flex flex-col items-center px-4 pb-0 min-h-0 overflow-hidden">
        <div className="flex flex-col gap-4 w-full max-w-[500px] min-h-0 flex-1 md:flex-initial">
          {/* Banner Carousel */}
          <div
            className="overflow-hidden rounded-xl touch-pan-y"
            onPointerDown={handleBannerPointerDown}
            onPointerMove={handleBannerPointerMove}
            onPointerUp={handleBannerPointerUp}
            onPointerCancel={handleBannerPointerUp}
          >
            <div
              className={`flex ${isBannerDragging ? "" : "transition-transform duration-300 ease-out"}`}
              style={{
                transform: `translateX(calc(-${bannerIndex * 100}% + ${bannerDragOffset}px))`,
              }}
            >
              {/* Slide 1: Play Nums */}
              <div className="w-full shrink-0">
                <GradientBorder color="purple" className="rounded-xl">
                  <button
                    type="button"
                    className="relative w-full rounded-xl pl-1 pr-2 md:pl-4 md:pr-4 pt-3 pb-2 md:py-4 flex items-center justify-between overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(89,31,255,0.64) 0%, transparent 100%)",
                    }}
                    onClick={() => {
                      if (bannerDidDrag.current) return;
                      window.open("https://sepolia.nums.gg", "_blank");
                    }}
                  >
                    {/* Background wave pattern */}
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      viewBox="0 0 420 96"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      preserveAspectRatio="none"
                    >
                      <path
                        opacity="0.64"
                        d="M66.882 0.336C68.857 0.221 70.848 0.109 72.836 0H0.005V8.127C8.418 6.291 17.273 4.802 26.469 3.684C40.342 2 54.683 1.046 66.882 0.336Z"
                        fill="url(#pb0)"
                      />
                      <path
                        opacity="0.64"
                        d="M41.903 16.853C55.774 15.168 70.117 14.215 82.317 13.505C87.33 13.213 92.434 12.943 97.369 12.682C107.827 12.128 118.644 11.556 129.017 10.751C140.418 9.867 150.128 8.784 158.705 7.441C169.062 5.82 179.427 3.386 190.388 0H156.043C154.356 0.308 152.672 0.593 150.987 0.856C142.41 2.198 132.7 3.282 121.299 4.166C110.926 4.972 100.112 5.543 89.651 6.097C84.716 6.358 79.613 6.627 74.597 6.92C62.398 7.63 48.057 8.584 34.184 10.268C22.129 11.733 10.658 13.835 0.005 16.524V25.197C0.939 24.929 1.88 24.663 2.827 24.401C14.829 21.084 27.976 18.545 41.903 16.853Z"
                        fill="url(#pb1)"
                      />
                      <path
                        opacity="0.64"
                        d="M57.346 30.029C71.217 28.344 85.56 27.391 97.759 26.681C102.775 26.389 107.876 26.119 112.813 25.858C123.272 25.304 134.086 24.732 144.462 23.927C155.863 23.042 165.573 21.96 174.15 20.617C184.534 18.991 194.926 16.548 205.923 13.149C216.064 10.014 225.809 6.347 234.922 2.86C236.551 2.236 238.214 1.596 239.822 0.977C240.666 0.652 241.512 0.326 242.361 0H217.319C211.153 2.281 204.759 4.532 198.199 6.561C187.204 9.96 176.812 12.403 166.426 14.028C157.849 15.371 148.139 16.454 136.738 17.339C126.365 18.144 115.55 18.715 105.09 19.269C100.155 19.531 95.051 19.8 90.036 20.092C77.836 20.803 63.495 21.756 49.622 23.441C35.695 25.132 22.548 27.672 10.546 30.988C6.932 31.986 3.425 33.035 0.002 34.12V43.257C5.832 41.257 11.886 39.339 18.267 37.577C30.27 34.26 43.416 31.721 57.344 30.029H57.346Z"
                        fill="url(#pb2)"
                      />
                      <path
                        opacity="0.64"
                        d="M72.79 43.206C86.661 41.521 101.004 40.568 113.203 39.858C118.219 39.565 123.322 39.296 128.257 39.034C138.716 38.481 149.53 37.909 159.905 37.104C171.306 36.219 181.017 35.137 189.594 33.794C199.977 32.168 210.37 29.725 221.366 26.326C231.507 23.191 241.253 19.524 250.365 16.036C251.995 15.413 253.658 14.773 255.265 14.154C268.123 9.206 281.294 4.14 296.254 0.001H267.775C260.817 2.46 254.141 5.028 247.546 7.566C245.938 8.185 244.273 8.825 242.646 9.449C233.533 12.937 223.788 16.604 213.647 19.739C202.653 23.138 192.26 25.581 181.874 27.206C173.297 28.548 163.587 29.632 152.186 30.516C141.813 31.322 130.998 31.893 120.538 32.447C115.603 32.708 110.5 32.978 105.484 33.27C93.284 33.98 78.943 34.934 65.071 36.618C51.143 38.31 37.996 40.85 25.994 44.166C16.75 46.72 8.192 49.6 0.007 52.579V62.038C10.526 58.056 21.527 54.122 33.716 50.754C45.718 47.438 58.865 44.898 72.792 43.207L72.79 43.206Z"
                        fill="url(#pb3)"
                      />
                      <path
                        opacity="0.64"
                        d="M323.91 1.928C300.139 6.439 281.25 13.707 262.981 20.737C261.373 21.355 259.708 21.995 258.081 22.619C248.968 26.107 239.223 29.774 229.082 32.909C218.088 36.308 207.695 38.752 197.309 40.377C188.732 41.719 179.022 42.802 167.621 43.687C157.248 44.492 146.433 45.064 135.973 45.617C131.038 45.879 125.935 46.148 120.919 46.44C108.719 47.151 94.378 48.104 80.506 49.789C66.578 51.48 53.431 54.02 41.429 57.336C26.23 61.537 12.882 66.617 0.005 71.572V81.12C2.118 80.313 4.214 79.507 6.292 78.706C19.611 73.58 33.386 68.278 49.148 63.922C61.151 60.606 74.3 58.066 88.225 56.375C102.096 54.689 116.439 53.736 128.638 53.026C133.654 52.734 138.757 52.464 143.692 52.203C154.151 51.649 164.965 51.078 175.34 50.272C186.741 49.388 196.452 48.305 205.029 46.962C215.412 45.337 225.805 42.894 236.801 39.495C246.94 36.36 256.688 32.692 265.8 29.205C267.43 28.582 269.093 27.942 270.7 27.323C288.968 20.294 307.859 13.026 331.63 8.515C355.073 4.066 380.517 2.72 405.126 1.419C408.891 1.22 412.784 1.013 416.569 0.801C417.695 0.738 418.844 0.672 420.001 0.605V0H335.445C331.558 0.571 327.71 1.208 323.915 1.928H323.91Z"
                        fill="url(#pb4)"
                      />
                      <path
                        opacity="0.64"
                        d="M21.726 91.876C35.046 86.748 48.82 81.446 64.583 77.091C76.585 73.774 89.732 71.235 103.659 69.543C117.532 67.858 131.873 66.905 144.073 66.195C149.086 65.902 154.19 65.633 159.127 65.372C169.585 64.818 180.4 64.246 190.775 63.441C202.176 62.556 211.886 61.474 220.463 60.131C230.847 58.505 241.239 56.062 252.236 52.663C262.375 49.528 272.122 45.861 281.235 42.374C282.865 41.75 284.527 41.11 286.135 40.491C304.402 33.462 323.293 26.193 347.064 21.682C370.328 17.267 395.564 15.908 419.998 14.616V7.619C417.601 7.749 415.197 7.877 412.841 8.001C388.234 9.303 362.788 10.648 339.345 15.097C315.574 19.608 296.685 26.877 278.417 33.906C276.81 34.525 275.145 35.165 273.517 35.789C264.405 39.277 254.659 42.943 244.518 46.078C233.524 49.477 223.132 51.921 212.746 53.546C204.169 54.889 194.458 55.972 183.057 56.856C172.685 57.661 161.868 58.233 151.409 58.787C146.474 59.048 141.371 59.318 136.357 59.61C124.158 60.32 109.817 61.274 95.944 62.958C82.017 64.65 68.87 67.189 56.868 70.506C41.105 74.861 27.33 80.163 14.011 85.291C9.43 87.055 4.754 88.855 0.007 90.61V96H10.929C14.578 94.628 18.18 93.241 21.726 91.876Z"
                        fill="url(#pb5)"
                      />
                      <path
                        opacity="0.64"
                        d="M119.096 82.712C132.967 81.027 147.31 80.074 159.51 79.364C164.526 79.071 169.629 78.802 174.564 78.541C185.022 77.987 195.837 77.415 206.212 76.61C217.613 75.726 227.323 74.643 235.9 73.3C246.284 71.674 256.676 69.232 267.673 65.832C277.812 62.697 287.559 59.03 296.672 55.543C298.302 54.92 299.964 54.28 301.572 53.66C319.839 46.631 338.73 39.362 362.501 34.851C380.893 31.362 400.517 29.781 420.001 28.634V21.613C398.008 22.812 375.606 24.316 354.784 28.267C331.013 32.778 312.122 40.046 293.854 47.075C292.247 47.694 290.582 48.334 288.955 48.957C279.842 52.445 270.096 56.112 259.955 59.247C248.961 62.646 238.569 65.089 228.183 66.714C219.606 68.056 209.896 69.14 198.495 70.024C188.122 70.83 177.307 71.401 166.846 71.955C161.912 72.216 156.808 72.486 151.792 72.778C139.593 73.488 125.252 74.442 111.379 76.127C97.452 77.818 84.305 80.358 72.302 83.674C59.053 87.335 47.208 91.665 35.86 96H61.584C67.468 93.977 73.578 92.038 80.022 90.258C92.025 86.942 105.171 84.402 119.099 82.711L119.096 82.712Z"
                        fill="url(#pb6)"
                      />
                      <path
                        opacity="0.64"
                        d="M370.214 41.435C346.442 45.946 327.554 53.214 309.284 60.244C307.676 60.862 306.012 61.502 304.384 62.126C295.271 65.613 285.526 69.281 275.385 72.416C264.391 75.815 253.998 78.259 243.612 79.884C235.035 81.226 225.325 82.308 213.924 83.194C203.551 83.999 192.736 84.571 182.276 85.124C177.341 85.386 172.238 85.655 167.222 85.947C155.022 86.658 140.679 87.611 126.809 89.296C114.093 90.841 102.029 93.094 90.891 96H133.616C133.92 95.96 134.224 95.921 134.53 95.883C148.401 94.198 162.744 93.245 174.944 92.535C179.957 92.243 185.061 91.973 189.998 91.712C200.456 91.158 211.273 90.587 221.646 89.781C233.047 88.897 242.757 87.814 251.334 86.471C261.718 84.845 272.11 82.403 283.107 79.004C293.246 75.868 302.993 72.201 312.106 68.714C313.736 68.091 315.398 67.451 317.006 66.831C335.273 59.802 354.164 52.534 377.935 48.023C391.471 45.454 405.672 43.92 419.998 42.832V35.697C403.073 36.815 386.18 38.405 370.216 41.434L370.214 41.435Z"
                        fill="url(#pb7)"
                      />
                      <path
                        opacity="0.64"
                        d="M324.728 73.42C323.12 74.039 321.456 74.679 319.828 75.303C310.715 78.79 300.97 82.457 290.829 85.592C279.835 88.991 269.442 91.435 259.056 93.06C251.641 94.221 243.377 95.187 233.907 96H284.842C289.333 94.89 293.887 93.622 298.549 92.18C308.688 89.045 318.435 85.377 327.548 81.89C329.178 81.267 330.84 80.627 332.448 80.008C350.715 72.979 369.606 65.711 393.377 61.2C402.024 59.559 410.945 58.341 419.994 57.391V50.056C408.3 51.096 396.752 52.505 385.655 54.611C361.884 59.122 342.996 66.391 324.726 73.42H324.728Z"
                        fill="url(#pb8)"
                      />
                      <path
                        opacity="0.64"
                        d="M340.173 86.596C338.565 87.214 336.9 87.854 335.273 88.478C328.735 90.98 321.868 93.574 314.766 96H340.536C341.359 95.686 342.177 95.373 342.988 95.063C344.618 94.44 346.28 93.8 347.888 93.18C366.156 86.151 385.046 78.883 408.817 74.372C412.499 73.673 416.229 73.052 419.998 72.494V64.863C413.595 65.661 407.278 66.615 401.1 67.788C377.329 72.299 358.44 79.567 340.173 86.596Z"
                        fill="url(#pb9)"
                      />
                      <path
                        opacity="0.64"
                        d="M365.464 96H391.731C400.501 93.134 409.804 90.512 420 88.388V80.326C418.842 80.53 417.687 80.738 416.537 80.956C397.005 84.663 380.768 90.232 365.464 96Z"
                        fill="url(#pb10)"
                      />
                      <path
                        opacity="0.64"
                        d="M419.995 96V88.389C409.799 90.513 400.498 93.134 391.727 96H419.995Z"
                        fill="url(#pb11)"
                      />
                      <defs>
                        <linearGradient
                          id="pb0"
                          x1="34.689"
                          y1="1.3"
                          x2="35.524"
                          y2="6.617"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#8581FF" />
                          <stop
                            offset="1"
                            stopColor="#8581FF"
                            stopOpacity="0"
                          />
                        </linearGradient>
                        <linearGradient
                          id="pb1"
                          x1="90.669"
                          y1="4.03"
                          x2="93.71"
                          y2="20.355"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#8581FF" />
                          <stop
                            offset="1"
                            stopColor="#8581FF"
                            stopOpacity="0"
                          />
                        </linearGradient>
                        <linearGradient
                          id="pb2"
                          x1="115.418"
                          y1="6.919"
                          x2="122.27"
                          y2="34.195"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#8581FF" />
                          <stop
                            offset="1"
                            stopColor="#8581FF"
                            stopOpacity="0"
                          />
                        </linearGradient>
                        <linearGradient
                          id="pb3"
                          x1="141.086"
                          y1="9.924"
                          x2="152.363"
                          y2="48.186"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#8581FF" />
                          <stop
                            offset="1"
                            stopColor="#8581FF"
                            stopOpacity="0"
                          />
                        </linearGradient>
                        <linearGradient
                          id="pb4"
                          x1="200.016"
                          y1="12.975"
                          x2="213.78"
                          y2="63.612"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#8581FF" />
                          <stop
                            offset="1"
                            stopColor="#8581FF"
                            stopOpacity="0"
                          />
                        </linearGradient>
                        <linearGradient
                          id="pb5"
                          x1="200.015"
                          y1="21.756"
                          x2="216.147"
                          y2="76.223"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#8581FF" />
                          <stop
                            offset="1"
                            stopColor="#8581FF"
                            stopOpacity="0"
                          />
                        </linearGradient>
                        <linearGradient
                          id="pb6"
                          x1="218.795"
                          y1="33.511"
                          x2="231.445"
                          y2="79.927"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#8581FF" />
                          <stop
                            offset="1"
                            stopColor="#8581FF"
                            stopOpacity="0"
                          />
                        </linearGradient>
                        <linearGradient
                          id="pb7"
                          x1="247.618"
                          y1="45.343"
                          x2="257.392"
                          y2="83.244"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#8581FF" />
                          <stop
                            offset="1"
                            stopColor="#8581FF"
                            stopOpacity="0"
                          />
                        </linearGradient>
                        <linearGradient
                          id="pb8"
                          x1="322.526"
                          y1="57.404"
                          x2="332.074"
                          y2="84.884"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#8581FF" />
                          <stop
                            offset="1"
                            stopColor="#8581FF"
                            stopOpacity="0"
                          />
                        </linearGradient>
                        <linearGradient
                          id="pb9"
                          x1="364.879"
                          y1="69.844"
                          x2="372.286"
                          y2="87.631"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#8581FF" />
                          <stop
                            offset="1"
                            stopColor="#8581FF"
                            stopOpacity="0"
                          />
                        </linearGradient>
                        <linearGradient
                          id="pb10"
                          x1="391.435"
                          y1="82.833"
                          x2="395.087"
                          y2="91.863"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#8581FF" />
                          <stop
                            offset="1"
                            stopColor="#8581FF"
                            stopOpacity="0"
                          />
                        </linearGradient>
                        <linearGradient
                          id="pb11"
                          x1="405.189"
                          y1="89.606"
                          x2="406.879"
                          y2="94.067"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#8581FF" />
                          <stop
                            offset="1"
                            stopColor="#8581FF"
                            stopOpacity="0"
                          />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="relative flex items-center gap-1">
                      <NumsLogoIcon size="lg+" className="text-white" />
                      <div className="text-left uppercase">
                        <p
                          className="text-2xl leading-none -mb-2"
                          style={{
                            fontFamily: "'Pixel Game', sans-serif",
                            color: "#48F095",
                            textShadow: "2px 2px 0 rgba(0, 0, 0, 0.24)",
                          }}
                        >
                          Play
                        </p>
                        <p
                          className="text-white text-3xl leading-none"
                          style={{
                            fontFamily: "'Pixel Game', sans-serif",
                            textShadow: "2px 2px 0 rgba(0, 0, 0, 0.24)",
                          }}
                        >
                          Nums
                        </p>
                      </div>
                    </div>
                    <div
                      className="relative text-xl uppercase px-5 rounded-lg tracking-wide"
                      style={{
                        fontFamily: "'Pixel Game', sans-serif",
                        backgroundColor: "#48F095",
                        color: "#383838",
                        textShadow: "2px 2px 0 rgba(0, 0, 0, 0.24)",
                        paddingTop: "8px",
                        paddingBottom: "4px",
                      }}
                    >
                      PLAY
                    </div>
                  </button>
                </GradientBorder>
              </div>

              {/* Slide 2: Share */}
              <div className="w-full shrink-0">
                <GradientBorder color="green" className="rounded-xl">
                  <button
                    type="button"
                    className="relative w-full rounded-xl pl-3 pr-2 md:pl-4 md:pr-4 pt-3 pb-2 md:py-4 flex items-center justify-between overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.8) 60%, rgba(54, 248, 24, 0.24) 100%)",
                    }}
                    onClick={() => {
                      if (bannerDidDrag.current) return;
                      if (navigator.share) {
                        navigator.share({
                          title: "Glitch Bomb",
                          text: "Play Glitch Bomb for free!",
                          url: window.location.origin,
                        });
                      } else {
                        navigator.clipboard.writeText(window.location.origin);
                      }
                    }}
                  >
                    <div className="relative text-left uppercase">
                      <p
                        className="text-lg leading-none -mb-1"
                        style={{
                          fontFamily: "'Pixel Game', sans-serif",
                          color: "#36F818",
                          textShadow: "2px 2px 0 rgba(0, 0, 0, 0.24)",
                        }}
                      >
                        Spread the word...
                      </p>
                      <p
                        className="text-white text-2xl leading-none"
                        style={{
                          fontFamily: "'Pixel Game', sans-serif",
                          textShadow: "2px 2px 0 rgba(255, 255, 255, 0.2)",
                        }}
                      >
                        Play for free!
                      </p>
                    </div>
                    <div
                      className="relative text-xl uppercase px-5 rounded-lg tracking-wide"
                      style={{
                        fontFamily: "'Pixel Game', sans-serif",
                        backgroundColor: "#36F818",
                        color: "#000000",
                        textShadow: "1px 2px 0 rgba(0, 0, 0, 0.3)",
                        paddingTop: "8px",
                        paddingBottom: "4px",
                      }}
                    >
                      SHARE
                    </div>
                  </button>
                </GradientBorder>
              </div>
            </div>
          </div>

          {/* My Games Section */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <h2 className="text-green-400 font-secondary text-xs tracking-widest uppercase">
                  MY GAMES
                </h2>
                <span
                  className="font-secondary text-xs tracking-widest px-2 py-0.5 rounded-full"
                  style={{ color: "#36F818", backgroundColor: "rgba(54, 248, 24, 0.1)" }}
                >
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
                    <BracketArrowIcon size="xs" direction="left" />
                  </Button>
                  <Button
                    variant="secondary"
                    gradient="green"
                    className="h-12 w-12 p-0"
                    onClick={handleNext}
                    disabled={activeGameIndex >= totalSlides - 1}
                    aria-label="Next game"
                  >
                    <BracketArrowIcon size="xs" direction="right" />
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
                          requireLogin(() =>
                            handlePlay(
                              game.packId,
                              game.gameId,
                              game.hasNoGame,
                            ),
                          );
                        }}
                      >
                        {/* Icon container */}
                        <div className="shrink-0 self-stretch flex items-center justify-center rounded bg-white/[0.04] px-3">
                          <BombIcon size="lg" className="text-green-400" />
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

                        {loadingGameId === `${game.packId}-${game.gameId}` && (
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
                        requireLogin(() => handleNewGame());
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
          <div className="flex flex-col gap-4 min-h-0 flex-1">
            <h2 className="text-green-400 font-secondary text-xs tracking-widest uppercase shrink-0 px-1">
              ACTIVITY
            </h2>
            <div
              className="rounded-xl border border-green-900 bg-black-100 p-3 flex flex-col gap-3 overflow-y-auto flex-1"
              style={{ scrollbarWidth: "none" }}
            >
              {activityGroups.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <p
                    className="font-secondary text-sm tracking-widest uppercase text-center leading-relaxed"
                    style={{ color: "#255115" }}
                  >
                    YOU HAVE NOT PLAYED
                    <br />
                    ANY GAMES YET
                  </p>
                </div>
              ) : (
                <>
                  {activityGroups.map((group, groupIdx) => (
                    <div key={group.label} className="flex flex-col gap-2">
                      {groupIdx > 0 && (
                        <p
                          className="font-secondary text-sm tracking-widest uppercase pt-1"
                          style={{ color: "#36F818" }}
                        >
                          {group.label}
                        </p>
                      )}
                      {group.games.map((game) => {
                        const cashedOut = game.health > 0;
                        return (
                          <div
                            key={`${group.label}-${game.packId}-${game.gameId}`}
                            className="flex items-center gap-2"
                          >
                            <button
                              type="button"
                              className="flex-1 min-w-0 flex items-center gap-4 rounded-lg px-4 py-3 transition-colors hover:brightness-110"
                              style={{
                                background: cashedOut ? "#071304" : "#1A0505",
                              }}
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
                              <span className="font-secondary text-sm tracking-widest text-white">
                                #{game.packId}
                              </span>
                              <span className="font-secondary text-sm tracking-widest text-white">
                                L{game.level}
                              </span>
                              <span
                                className="font-secondary text-sm tracking-widest"
                                style={{
                                  color: cashedOut ? "#36F818" : "#EF4444",
                                }}
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
                  ))}
                </>
              )}
            </div>
          </div>
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
            onClick={() =>
              requireLogin(() => {
                if (isOnNewGameCard) {
                  handleNewGame();
                } else if (activeGame) {
                  handlePlay(
                    activeGame.packId,
                    activeGame.gameId,
                    activeGame.hasNoGame,
                  );
                }
              })
            }
          >
            {isOnNewGameCard ? "NEW GAME" : "CONTINUE"}
          </Button>
        </div>
      </div>
    </div>
  );
};
