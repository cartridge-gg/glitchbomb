import type ControllerConnector from "@cartridge/connector/controller";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useNetwork,
} from "@starknet-react/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header, Settings } from "@/components/containers";
import {
  AchievementScene,
  LeaderboardScene,
  PurchaseScene,
  QuestScene,
  ReferralScene,
} from "@/components/scenes";
import {
  getFaucetAddress,
  getSetupAddress,
  getTokenAddress,
  MAINNET_CHAIN_ID,
} from "@/config";
import { useAudio } from "@/contexts/audio";
import { useBundles } from "@/contexts/bundles";
import { useModal } from "@/contexts/modal";
import { usePrices } from "@/contexts/prices";
import { PurchaseModalProvider } from "@/contexts/purchase-modal";
import { useSound } from "@/contexts/sound";
import { useEntitiesContext } from "@/contexts/use-entities-context";
import { useLoadingContext } from "@/contexts/use-loading";
import { MAX_SCORE, toUsd } from "@/helpers/payout";
import { useAchievementScene } from "@/hooks/achievements";
import { useActions } from "@/hooks/actions";
import { useLeaderboard } from "@/hooks/leaderboard";
import { useOwnedGames } from "@/hooks/packs";
import { useQuestScene } from "@/hooks/quests";
import { useReferral } from "@/hooks/referral";
import { toDecimal, useTokens } from "@/hooks/tokens";
import { useControllerUsername } from "@/hooks/use-controller-username";
import { selectGame, useOfflineStore } from "@/offline/store";
import { TutorialOverlay, useTutorial } from "@/tutorial";
import { isMobile, mobilePath } from "@/utils/mobile";

export { Game } from "./game";
export { Home } from "./home";
export { Support } from "./support";

export interface MainProps {
  children: React.ReactNode;
}

export const Main = ({ children }: MainProps) => {
  const { account, connector } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { chain } = useNetwork();
  const { mint } = useActions();
  const {
    volume: sfxVolume,
    isMuted: sfxMuted,
    setVolume: setSfxVolume,
    toggleMute: toggleSfxMute,
  } = useAudio();
  const {
    volume: musicVolume,
    isMuted: musicMuted,
    setVolume: setMusicVolume,
    toggleMute: toggleMusicMute,
  } = useSound();
  const { username } = useControllerUsername();
  const tutorial = useTutorial();
  const {
    open: openModal,
    close: closeModal,
    toggle: toggleModal,
    isOpen,
  } = useModal();

  const showLeaderboard = isOpen("leaderboard");
  const showQuests = isOpen("quests");
  const showAchievements = isOpen("achievements");
  const showReferrals = isOpen("referrals");
  const showSettings = isOpen("settings");
  const showPurchase = isOpen("purchase");

  const navigate = useNavigate();
  const { config } = useEntitiesContext();
  const { paidBundles: bundles } = useBundles();
  const { getGlitchPrice } = usePrices();
  const { setReady } = useLoadingContext();
  const { games: onchainGames } = useOwnedGames();
  const offlineState = useOfflineStore();

  const [bundleIndex, setBundleIndex] = useState(1);
  const purchaseGameIdsRef = useRef<Set<number> | null>(null);

  const tokenPrice = useMemo(() => {
    const p = getGlitchPrice();
    return p ? parseFloat(p) : null;
  }, [getGlitchPrice]);

  const ownedGames = useMemo(() => {
    if (!isMobile) return onchainGames;
    return Object.keys(offlineState.games)
      .map(Number)
      .map((id) => selectGame(offlineState, id))
      .filter((g): g is NonNullable<typeof g> => !!g)
      .sort((a, b) => b.id - a.id);
  }, [offlineState, onchainGames]);

  const { data: leaderboardRows, refetch: refetchLeaderboard } = useLeaderboard(
    { enabled: showLeaderboard },
  );
  const questsProps = useQuestScene();
  const { achievements: achievementRows } = useAchievementScene();
  const { data: referralRows } = useReferral();

  const tokenAddress = getTokenAddress(chain.id);
  const faucetAddress = getFaucetAddress(chain.id);
  const isMainnet = chain.id === BigInt(MAINNET_CHAIN_ID);
  const isLoggedIn = !!account;

  const { tokenBalances, tokenContracts } = useTokens({
    accountAddresses: account?.address ? [account.address] : [],
    contractAddresses: faucetAddress
      ? [tokenAddress, faucetAddress]
      : [tokenAddress],
  });

  const tokenContract = useMemo(() => {
    if (!tokenAddress) return undefined;
    return tokenContracts.find(
      (c) => BigInt(c.contract_address) === BigInt(tokenAddress),
    );
  }, [tokenContracts, tokenAddress]);

  const tokenBalance = useMemo(() => {
    if (!tokenContract || !isLoggedIn) return undefined;
    const balance = tokenBalances.find(
      (b) => BigInt(b.contract_address) === BigInt(tokenAddress),
    );
    if (!balance) return 0;
    return toDecimal(tokenContract, balance);
  }, [tokenContract, tokenBalances, tokenAddress, isLoggedIn]);

  const faucetContract = useMemo(() => {
    if (!faucetAddress) return undefined;
    return tokenContracts.find(
      (c) => BigInt(c.contract_address) === BigInt(faucetAddress),
    );
  }, [tokenContracts, faucetAddress]);

  const faucetBalance = useMemo(() => {
    if (!faucetContract || !faucetAddress || !isLoggedIn) return undefined;
    const balance = tokenBalances.find(
      (b) => BigInt(b.contract_address) === BigInt(faucetAddress),
    );
    if (!balance) return 0;
    return toDecimal(faucetContract, balance);
  }, [faucetContract, tokenBalances, faucetAddress, isLoggedIn]);

  const supply = useMemo(
    () => BigInt(tokenContract?.total_supply ?? "0"),
    [tokenContract],
  );
  const target = config?.target_supply ?? 0n;

  const bundle = useMemo(() => {
    if (
      bundles.length === 0 ||
      bundleIndex < 1 ||
      bundleIndex > bundles.length
    ) {
      return undefined;
    }
    return bundles[bundleIndex - 1];
  }, [bundles, bundleIndex]);

  // stake = floor(bundle.price / base_price) + 1 (matches on-chain tierPrice formula)
  const stake = useMemo(() => {
    if (!bundle || !config?.base_price || config.base_price === 0n) return 1;
    return Number(bundle.price / config.base_price) + 1;
  }, [bundle, config?.base_price]);

  const playPriceUsd = useMemo(() => toUsd(bundle?.price ?? 0n), [bundle]);
  const basePriceUsd = useMemo(() => {
    const basePrice = config?.base_price ?? 0n;
    return toUsd(basePrice * BigInt(stake));
  }, [config?.base_price, stake]);

  const onConnect = useCallback(
    () => connectAsync({ connector: connectors[0] }).then(() => undefined),
    [connectAsync, connectors],
  );

  const handleBuyGame = useCallback(async () => {
    if (!bundle || !chain) return;
    const controller = connector as ControllerConnector | undefined;
    if (!controller?.controller) return;
    purchaseGameIdsRef.current = new Set(ownedGames.map((g) => g.id));
    const registry = getSetupAddress(chain.id);
    await controller.controller.openBundle(bundle.id, registry, {
      onPurchaseComplete: () => {
        // Fired only when the user completes the purchase — not on cancel.
        // Show loading screen while the indexer picks up the new game.
        setReady("purchase", false);
      },
    });
  }, [bundle, chain, connector, ownedGames, setReady]);

  const openPurchaseScene = useCallback(
    () => openModal("purchase"),
    [openModal],
  );

  // Detect new game after purchase and navigate to it
  useEffect(() => {
    if (!purchaseGameIdsRef.current) return;
    const newGame = ownedGames.find(
      (g) => !purchaseGameIdsRef.current?.has(g.id),
    );
    if (newGame) {
      purchaseGameIdsRef.current = null;
      // Close the controller iframe before navigating
      const controllerEl = document.getElementById("controller");
      if (controllerEl) {
        document.body.style.overflow = "auto";
        controllerEl.style.opacity = "0";
        controllerEl.style.display = "none";
      }
      closeModal();
      navigate(mobilePath(`/play?game=${newGame.id}`));
    }
  }, [ownedGames, navigate, closeModal]);

  useEffect(() => {
    if (showLeaderboard) refetchLeaderboard();
  }, [showLeaderboard, refetchLeaderboard]);

  const leaderboardData = useMemo(
    () =>
      (leaderboardRows ?? []).map((row, index) => ({
        rank: index + 1,
        username: row.username || row.player.slice(0, 8),
        score: row.games_played,
        reward: row.total_reward,
      })),
    [leaderboardRows],
  );

  const referralPayments = useMemo(
    () =>
      (referralRows ?? []).map((row) => {
        const executedAt = row.executed_at
          ? new Date(row.executed_at).getTime() / 1000
          : 0;
        const deltaSec = Math.max(
          0,
          Math.floor(Date.now() / 1000 - executedAt),
        );
        const timeAgo =
          deltaSec < 60
            ? `${deltaSec}s`
            : deltaSec < 3600
              ? `${Math.floor(deltaSec / 60)}m`
              : deltaSec < 86400
                ? `${Math.floor(deltaSec / 3600)}h`
                : `${Math.floor(deltaSec / 86400)}d`;
        return {
          amount: row.amount.toFixed(4),
          token: "USDC",
          from: row.username || row.recipient.slice(0, 8),
          timeAgo,
        };
      }),
    [referralRows],
  );

  const referralTotals = useMemo(() => {
    const rows = referralRows ?? [];
    const playersSet = new Set(rows.map((r) => r.recipient));
    const totalEarned = rows.reduce((acc, r) => acc + r.amount, 0);
    return {
      players: String(playersSet.size),
      games: String(rows.length),
      totalEarned: `$${totalEarned.toFixed(2)}`,
    };
  }, [referralRows]);

  const handleCopyReferral = useCallback(() => {
    if (!account?.address) return;
    const link = `${window.location.origin}/?ref=${account.address}`;
    navigator.clipboard?.writeText(link).catch(() => undefined);
  }, [account?.address]);

  const onProfileClick = useCallback(() => {
    const controller = (connector as never as ControllerConnector)?.controller;
    if (isMobile) {
      controller?.openSettings();
    } else {
      controller?.openProfile("inventory");
    }
  }, [connector]);

  const toggleLeaderboard = useCallback(
    () => toggleModal("leaderboard"),
    [toggleModal],
  );
  const toggleQuests = useCallback(() => toggleModal("quests"), [toggleModal]);
  const toggleAchievements = useCallback(
    () => toggleModal("achievements"),
    [toggleModal],
  );
  const toggleSettings = useCallback(
    () => toggleModal("settings"),
    [toggleModal],
  );

  return (
    <div className="relative h-full w-screen flex flex-col overflow-hidden items-stretch bg-gradient-to-t from-black to-[#0C1806]">
      <Header
        tokenBalance={tokenBalance}
        faucetBalance={isMainnet ? undefined : faucetBalance}
        onBalance={onProfileClick}
        onFaucet={isMainnet ? undefined : () => mint(faucetAddress)}
        onConnect={isLoggedIn ? undefined : onConnect}
        onLeaderboard={toggleLeaderboard}
        onQuests={toggleQuests}
        onAchievements={toggleAchievements}
        onSettings={toggleSettings}
        className="relative w-full top-0 md:relative"
      />
      {showLeaderboard && (
        <div className="absolute inset-0 z-50 flex-1 bg-black/70 backdrop-blur-[4px]">
          <div className="absolute inset-0 z-50 m-2 md:m-6 flex-1 flex items-center justify-center">
            <LeaderboardScene
              rows={leaderboardData}
              onClose={closeModal}
              className="w-full md:max-w-[784px] h-full md:max-h-[560px]"
            />
          </div>
        </div>
      )}

      {showQuests && (
        <div className="absolute inset-0 z-50 flex-1 bg-black/70 backdrop-blur-[4px]">
          <div className="absolute inset-0 z-50 m-2 md:m-6 flex-1 flex items-center justify-center">
            <QuestScene
              questsProps={questsProps}
              onClose={closeModal}
              className="w-full md:max-w-[784px] h-full md:max-h-[560px]"
            />
          </div>
        </div>
      )}

      {showAchievements && (
        <div className="absolute inset-0 z-50 flex-1 bg-black/70 backdrop-blur-[4px]">
          <div className="absolute inset-0 z-50 m-2 md:m-6 flex-1 flex items-center justify-center">
            <AchievementScene
              achievements={achievementRows}
              onClose={closeModal}
              className="w-full md:max-w-[784px] h-full md:max-h-[560px]"
            />
          </div>
        </div>
      )}

      {showReferrals && (
        <div className="absolute inset-0 z-50 flex-1 bg-black/70 backdrop-blur-[4px]">
          <div className="absolute inset-0 z-50 m-2 md:m-6 flex-1 flex items-center justify-center">
            <ReferralScene
              players={referralTotals.players}
              games={referralTotals.games}
              totalEarned={referralTotals.totalEarned}
              payments={referralPayments}
              onCopy={handleCopyReferral}
              onClose={closeModal}
              className="w-full md:max-w-[784px] h-full md:max-h-[560px]"
            />
          </div>
        </div>
      )}

      {showSettings && (
        <div className="absolute inset-0 z-50 flex-1 bg-black/70 backdrop-blur-[4px]">
          <div className="absolute inset-0 z-50 m-2 md:m-6 flex-1 flex items-center justify-center">
            <Settings
              onClose={closeModal}
              musicVolume={musicVolume}
              musicMuted={musicMuted}
              onMusicChange={setMusicVolume}
              onMusicMute={toggleMusicMute}
              sfxVolume={sfxVolume}
              sfxMuted={sfxMuted}
              onSfxChange={setSfxVolume}
              onSfxMute={toggleSfxMute}
              onLeaderboard={() => openModal("leaderboard")}
              onReferrals={() => openModal("referrals")}
              onAchievements={() => openModal("achievements")}
              onQuests={() => openModal("quests")}
              onTutorial={() => {
                closeModal();
                tutorial.startTutorial();
              }}
              onLogOut={() => {
                closeModal();
                disconnect();
              }}
              onConnect={onConnect}
              username={isLoggedIn ? username : undefined}
              onProfile={isLoggedIn ? onProfileClick : undefined}
              className="w-full md:max-w-[736px]"
            />
          </div>
        </div>
      )}

      {!isMobile && showPurchase && (
        <div className="absolute inset-0 z-50 flex-1 bg-black/70 backdrop-blur-[4px]">
          <div className="absolute inset-0 z-50 m-2 md:m-6 flex-1 flex items-center justify-center">
            <PurchaseScene
              slotCount={MAX_SCORE}
              basePrice={basePriceUsd}
              playPrice={playPriceUsd}
              tokenPrice={tokenPrice ?? 0}
              multiplier={stake}
              loading={!tokenPrice || !bundle}
              targetSupply={target}
              currentSupply={supply}
              stakesProps={{
                total: bundles.length,
                index: bundleIndex,
                setIndex: setBundleIndex,
              }}
              onClose={closeModal}
              onConnect={isLoggedIn ? undefined : onConnect}
              onPurchase={isLoggedIn ? handleBuyGame : undefined}
              className="w-full md:max-w-[784px] h-full md:h-auto"
            />
          </div>
        </div>
      )}

      <PurchaseModalProvider
        openPurchaseScene={openPurchaseScene}
        handleBuyGame={handleBuyGame}
      >
        <div className="relative flex-1 min-h-0 flex flex-col justify-between">
          {children}
          <TutorialOverlay />
        </div>
      </PurchaseModalProvider>
    </div>
  );
};
