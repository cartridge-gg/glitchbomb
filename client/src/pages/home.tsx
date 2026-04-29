import { useAccount, useConnect, useNetwork } from "@starknet-react/core";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type {
  GameActivitiesProps,
  GameCardsProps,
} from "@/components/containers";
import { HomeScene } from "@/components/scenes";
import { getFaucetAddress, getTokenAddress } from "@/config";
import { useModal } from "@/contexts/modal";
import { usePrices } from "@/contexts/prices";
import { usePurchaseModal } from "@/contexts/purchase-modal";
import { useAppData } from "@/contexts/use-app-data";
import { useEntitiesContext } from "@/contexts/use-entities-context";
import { useLoadingSignal } from "@/contexts/use-loading";
import {
  maxPayout as maxPayoutRaw,
  tokenPayout,
  toTokens,
} from "@/helpers/payout";
import { useActivities } from "@/hooks/activities";
import { useBanners } from "@/hooks/banner";
import { useOwnedGames } from "@/hooks/packs";
import { useTokens } from "@/hooks/tokens";
import { useAudio } from "@/hooks/use-audio";
import { useControllerUsername } from "@/hooks/use-controller-username";
import {
  createOfflineGame,
  resetOfflineState,
  selectGame,
  useOfflineStore,
} from "@/offline/store";
import { useTutorial } from "@/tutorial";
import { isMobile } from "@/utils/mobile";

export const Home = () => {
  const navigate = useNavigate();
  const { chain } = useNetwork();
  const { account } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { config } = useEntitiesContext();
  const { tokenContracts } = useAppData();
  const { getGlitchPrice } = usePrices();
  const { openPurchaseScene, handleBuyGame } = usePurchaseModal();
  const tokenPrice = useMemo(() => {
    const p = getGlitchPrice();
    return p ? parseFloat(p) : null;
  }, [getGlitchPrice]);

  const { games: onchainGames, isLoading: gamesLoading } = useOwnedGames();

  const tokenAddress = getTokenAddress(chain.id);
  const faucetAddress = getFaucetAddress(chain.id);
  const { isLoading: tokensLoading } = useTokens({
    accountAddresses: account?.address ? [account.address] : [],
    contractAddresses: faucetAddress
      ? [tokenAddress, faucetAddress]
      : [tokenAddress],
  });

  const isHomeReady =
    !gamesLoading && !tokensLoading && tokenContracts.length > 0;
  useLoadingSignal("home", isHomeReady);

  const offlineState = useOfflineStore();

  const ownedGames = useMemo(() => {
    if (!isMobile) return onchainGames;
    return Object.keys(offlineState.games)
      .map(Number)
      .map((id) => selectGame(offlineState, id))
      .filter((g): g is NonNullable<typeof g> => !!g)
      .sort((a, b) => b.id - a.id);
  }, [offlineState, onchainGames]);
  const { startMusic } = useAudio();
  const tutorial = useTutorial();
  const { username } = useControllerUsername();
  const [loadingGameId, setLoadingGameId] = useState<number | null>(null);
  const { close: closeModal, isOpen } = useModal();
  const showDetails = isOpen("purchase");
  const setShowDetails = useCallback(
    (show: boolean) => (show ? openPurchaseScene() : closeModal()),
    [openPurchaseScene, closeModal],
  );
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  const [gameId, setGameId] = useState<number | undefined>(undefined);
  const { banners } = useBanners();
  const {
    activities: sqlActivities,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch: refetchActivities,
  } = useActivities();

  useEffect(() => {
    const interval = setInterval(
      () => setNow(Math.floor(Date.now() / 1000)),
      60_000,
    );
    return () => clearInterval(interval);
  }, []);

  // Start normal background music on homepage (crossfades from game track)
  useEffect(() => {
    startMusic("normal");
  }, [startMusic]);

  const formatExpiry = useCallback(
    (expiration: number) => {
      if (!expiration) return "--";
      const remaining = expiration - now;
      if (remaining <= 0) return "EXPIRED";
      const hours = Math.floor(remaining / 3600);
      const minutes = Math.floor((remaining % 3600) / 60);
      if (hours > 0) return `${hours}h ${minutes}m`;
      return `${minutes}m`;
    },
    [now],
  );

  const tokenContract = useMemo(() => {
    if (!tokenAddress) return undefined;
    return tokenContracts.find(
      (contract) => BigInt(contract.contract_address) === BigInt(tokenAddress),
    );
  }, [tokenContracts, tokenAddress]);

  const supply = useMemo(
    () => BigInt(tokenContract?.total_supply ?? "0"),
    [tokenContract],
  );
  const target = config?.target_supply ?? 0n;

  const formatPayout = useCallback(
    (score: number, stake: number) => {
      if (score <= 0) return "$0.00";
      const glitch = toTokens(tokenPayout(score, stake, supply, target));
      if (tokenPrice) return `$${(glitch * tokenPrice).toFixed(2)}`;
      return `${glitch.toFixed(1)} GLITCH`;
    },
    [supply, target, tokenPrice],
  );

  const formatMaxPayout = useCallback(
    (stake: number) => {
      const raw = maxPayoutRaw(stake, supply, target);
      const glitch = toTokens(raw);
      if (tokenPrice) return `$${(glitch * tokenPrice).toFixed(2)}`;
      return `${glitch.toFixed(1)} GLITCH`;
    },
    [supply, target, tokenPrice],
  );

  const onConnectClick = useCallback(async () => {
    await connectAsync({ connector: connectors[0] });
  }, [connectAsync, connectors]);

  // Build game list from owned games
  const gameList = useMemo(() => {
    return [...ownedGames].sort((a, b) => {
      // 1. Expiry urgency: less time remaining = higher priority
      const aRemaining = a.expiration > 0 ? a.expiration - now : Infinity;
      const bRemaining = b.expiration > 0 ? b.expiration - now : Infinity;
      if (aRemaining !== bRemaining) return aRemaining - bRemaining;
      // 2. Higher level first
      if (a.level !== b.level) return b.level - a.level;
      // 3. Higher points first
      if (a.points !== b.points) return b.points - a.points;
      // 4. Newest game first (tiebreaker)
      return b.id - a.id;
    });
  }, [ownedGames, now]);

  // Check if a non-completed game has expired
  const isExpired = useCallback(
    (game: { expiration: number; over: number }) =>
      !game.over && game.expiration > 0 && game.expiration <= now,
    [now],
  );

  // Split into active, expired, and completed games
  const activeGames = useMemo(
    () => gameList.filter((g) => !g.over && !isExpired(g)),
    [gameList, isExpired],
  );

  useEffect(() => {
    if (gameId === undefined && activeGames.length > 0) {
      setGameId(activeGames[0].id);
    }
  }, [activeGames, gameId]);

  const expiredGames = useMemo(
    () => gameList.filter((g) => isExpired(g)),
    [gameList, isExpired],
  );

  const completedGames = useMemo(
    () => gameList.filter((g) => g.over),
    [gameList],
  );

  const playerActivityItems = useMemo<GameActivitiesProps["activities"]>(() => {
    const expired = expiredGames.map((g) => ({
      gameId: `#${g.id}`,
      moonrocks: g.moonrocks,
      payout: "EXPIRED",
      to: `/game/${g.id}`,
      variant: "expired" as const,
      timestamp: g.expiration,
    }));
    const completed = completedGames.map((g) => {
      const cashedOut = g.health > 0;
      return {
        gameId: `#${g.id}`,
        moonrocks: g.moonrocks,
        payout: cashedOut ? formatPayout(g.moonrocks, g.stake) : "GLITCHED",
        to: mobilePath(`/play?game=${g.id}&view=true`),
        variant: cashedOut ? ("default" as const) : ("glitched" as const),
        timestamp: g.over,
      };
    });
    return [...expired, ...completed].sort((a, b) => b.timestamp - a.timestamp);
  }, [completedGames, expiredGames, formatPayout]);

  const allActivityItems = useMemo<GameActivitiesProps["activities"]>(() => {
    return sqlActivities.map((row) => ({
      gameId: row.username ? row.username : `#${row.gameId}`,
      moonrocks: row.score,
      payout: tokenPrice
        ? `$${(row.reward * tokenPrice).toFixed(2)}`
        : `${row.reward.toFixed(1)} GLITCH`,
      to: row.to,
      variant: "default" as const,
      timestamp: row.timestamp,
    }));
  }, [sqlActivities, tokenPrice]);

  const handlePlay = useCallback(
    (id: number) => {
      setLoadingGameId(id);
      navigate(`/game/${id}`);
    },
    [navigate],
  );

  const handleNewGame = useCallback(() => {
    openPurchaseScene();
  }, [openPurchaseScene]);

  const handlePractice = useCallback(() => {
    resetOfflineState();
    const isFirstPlay = !tutorial.state.completed;
    if (isFirstPlay) {
      tutorial.startTutorial();
    }
    createOfflineGame();
    navigate(isFirstPlay ? "/tutorial" : "/practice");
  }, [navigate, tutorial]);

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

  const gamesProps: GameCardsProps = useMemo(
    () => ({
      activeGames,
      gameId,
      setGameId,
      loadingGameId,
      formatExpiry,
      formatMaxPayout,
      onPlay: handlePlay,
      onNewGame: handleNewGame,
      onPractice: handlePractice,
      requireLogin,
    }),
    [
      activeGames,
      gameId,
      loadingGameId,
      formatExpiry,
      formatMaxPayout,
      handlePlay,
      handleNewGame,
      handlePractice,
      requireLogin,
    ],
  );

  const playerActivities: GameActivitiesProps = useMemo(
    () => ({ activities: playerActivityItems }),
    [playerActivityItems],
  );

  const allActivities: GameActivitiesProps = useMemo(
    () => ({ activities: allActivityItems }),
    [allActivityItems],
  );

  const handleLoadMoreActivities = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) fetchNextPage();
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  if (!isHomeReady) return null;

  return (
    <div className="absolute inset-0 flex flex-col py-4 md:py-8">
      <HomeScene
        gamesProps={gamesProps}
        allActivities={allActivities}
        playerActivities={playerActivities}
        banners={banners}
        showDetails={showDetails}
        onBuyGame={handleBuyGame}
        onShowDetailsChange={setShowDetails}
        onLoadMoreActivities={handleLoadMoreActivities}
        hasMoreActivities={hasNextPage}
        onRefreshActivities={refetchActivities}
      />
    </div>
  );
};
