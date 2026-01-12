import type ControllerConnector from "@cartridge/connector/controller";
import { useAccount, useConnect, useNetwork } from "@starknet-react/core";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Balance, Connect, Profile } from "@/components/elements";
import { GearIcon, GlitchBombIcon, ListIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { getTokenAddress } from "@/config";
import { useEntitiesContext } from "@/contexts";
import { useActions } from "@/hooks/actions";
import { useGames } from "@/hooks/games";
import { usePacks } from "@/hooks/packs";
import { toDecimal, useTokens } from "@/hooks/tokens";
import type { Pack } from "@/models";

export const Home = () => {
  const { mint, start } = useActions();
  const { chain } = useNetwork();
  const { account, connector } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { config, starterpack } = useEntitiesContext();
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>();

  // Use token address from Config (blockchain state) if available, fallback to manifest
  const tokenAddress = config?.token || getTokenAddress(chain.id);

  const { tokenBalances, tokenContracts } = useTokens({
    accountAddresses: account?.address ? [account?.address] : [],
    contractAddresses: [tokenAddress],
  });

  const { packs } = usePacks();
  const [pack, setPack] = useState<Pack | null>(null);

  // Build game keys from packs to fetch their current games
  const gameKeys = useMemo(() => {
    return packs.map((p) => ({
      packId: p.id,
      gameId: Math.max(p.game_count, 1),
    }));
  }, [packs]);

  const { getGameForPack } = useGames(gameKeys);

  const balance = useMemo(() => {
    if (!tokenAddress) return 0;
    const tokenContract = tokenContracts.find(
      (contract) => BigInt(contract.contract_address) === BigInt(tokenAddress),
    );
    if (!tokenContract) return 0;
    const tokenBalance = tokenBalances.find(
      (balance) => BigInt(balance.contract_address) === BigInt(tokenAddress),
    );
    if (!tokenBalance) return 0;
    return toDecimal(tokenContract, tokenBalance);
  }, [tokenContracts, tokenBalances, tokenAddress]);

  // Get the active pack to play
  const activePack = useMemo(() => {
    const active = packs.find((p) => {
      const gameId = Math.max(p.game_count, 1);
      const game = getGameForPack(p.id, gameId);
      return !(game?.over ?? false);
    });
    return active;
  }, [packs, getGameForPack]);

  const onProfileClick = useCallback(() => {
    (connector as never as ControllerConnector)?.controller.openProfile(
      "inventory",
    );
  }, [connector]);

  const onConnectClick = useCallback(async () => {
    await connectAsync({ connector: connectors[0] });
  }, [connectAsync, connectors]);

  const onSettingsClick = useCallback(() => {
    (connector as never as ControllerConnector)?.controller.openSettings();
  }, [connector]);

  const onPlayClick = useCallback(async () => {
    // If no active pack, open purchase flow
    if (!activePack) {
      if (starterpack) {
        (connector as ControllerConnector)?.controller.openStarterPack(
          starterpack.id.toString(),
        );
      }
      return;
    }
    // Otherwise, start/continue the game
    const gameId = Math.max(activePack.game_count, 1);
    const hasNoGame = activePack.game_count === 0;
    if (hasNoGame) {
      await start(activePack.id);
    }
    navigate(`/play?pack=${activePack.id}&game=${gameId}`);
  }, [activePack, connector, navigate, start, starterpack]);

  // Fetch username
  useEffect(() => {
    if (!connector) return;
    (connector as never as ControllerConnector).controller
      .username()
      ?.then((name) => setUsername(name));
  }, [connector]);

  // Set initial selected pack
  useEffect(() => {
    if (packs.length > 0 && pack === null) {
      setPack(packs[0]);
    }
  }, [packs, pack]);

  const isLoggedIn = !!account && !!username;

  return (
    <div className="absolute inset-0 flex flex-col items-center max-w-[420px] m-auto">
      <GlitchBombIcon
        size="xl"
        className="absolute top-9 left-1/2 -translate-x-1/2 text-white"
      />
      <div className="w-[300px] flex flex-col gap-12 items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <h1 className="uppercase text-center">
          <strong className="text-green-400 text-5xl md:text-7xl font-glitch font-thin">
            Glitch
          </strong>
          <br />
          <span className="text-white text-6xl md:text-8xl">Bomb</span>
        </h1>

        {isLoggedIn ? (
          // Logged in layout
          <div className="flex flex-col gap-3 w-full">
            {/* Row 1: Profile + Play */}
            <div className="flex gap-3">
              <Profile
                username={username}
                onClick={onProfileClick}
                className="flex-1"
              />
              <Button
                variant="default"
                className="h-12 flex-1 font-secondary uppercase text-sm tracking-widest font-normal"
                onClick={onPlayClick}
              >
                Play
              </Button>
            </div>

            {/* Row 2: Games + Settings + Balance */}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1 h-12 gap-2 font-secondary uppercase text-sm tracking-widest font-normal"
                onClick={() => navigate("/games")}
              >
                <ListIcon size="sm" />
                Games
              </Button>
              <Button
                variant="secondary"
                className="h-12 w-12 p-0"
                onClick={onSettingsClick}
              >
                <GearIcon size="sm" />
              </Button>
              <Balance
                balance={balance}
                onClick={() => mint(tokenAddress)}
                className="flex-1"
              />
            </div>
          </div>
        ) : (
          // Not logged in layout
          <div className="flex flex-col items-center justify-center gap-3 w-[124px]">
            <Connect highlight onClick={onConnectClick} />
            <Button
              variant="secondary"
              className="h-12 w-full font-secondary uppercase text-sm tracking-widest font-normal"
              disabled
            >
              Play
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
