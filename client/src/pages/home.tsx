import type ControllerConnector from "@cartridge/connector/controller";
import { useAccount, useNetwork } from "@starknet-react/core";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Balance } from "@/components/elements";
import { BombIcon, GlitchBombIcon } from "@/components/icons";
import { Connection } from "@/components/modules";
import { Button } from "@/components/ui/button";
import { getTokenAddress } from "@/config";
import { useEntitiesContext } from "@/contexts";
import { useActions } from "@/hooks/actions";
import { useGames } from "@/hooks/games";
import { usePacks } from "@/hooks/packs";
import { toDecimal, useTokens } from "@/hooks/tokens";
import { cn } from "@/lib/utils";
import type { Pack } from "@/models";

export const Home = () => {
  const { mint, start } = useActions();
  const { chain } = useNetwork();
  const { account, connector } = useAccount();
  const { starterpack, config } = useEntitiesContext();

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
    console.log("[Balance Debug]", {
      tokenAddress,
      tokenContracts,
      tokenBalances,
      configToken: config?.token,
    });
    if (!tokenAddress) return 0;
    const tokenContract = tokenContracts.find(
      (contract) => BigInt(contract.contract_address) === BigInt(tokenAddress),
    );
    if (!tokenContract) {
      console.log("[Balance Debug] No token contract found for", tokenAddress);
      return 0;
    }
    const tokenBalance = tokenBalances.find(
      (balance) => BigInt(balance.contract_address) === BigInt(tokenAddress),
    );
    if (!tokenBalance) {
      console.log("[Balance Debug] No token balance found");
      return 0;
    }
    const calculatedBalance = toDecimal(tokenContract, tokenBalance);
    console.log("[Balance Debug] Found balance:", {
      tokenContract,
      tokenBalance,
      decimals: tokenContract.decimals,
      rawBalance: tokenBalance.balance,
      calculated: calculatedBalance,
    });
    return calculatedBalance;
  }, [tokenContracts, tokenBalances, tokenAddress, config?.token]);

  const purchase = useCallback(async () => {
    console.log("[Purchase Debug]", { starterpack, connector });
    if (!starterpack) {
      console.log("[Purchase Debug] No starterpack available");
      return;
    }
    (connector as ControllerConnector)?.controller.openStarterPack(
      starterpack.id.toString(),
    );
  }, [connector, starterpack]);

  // Set initial selected pack
  useEffect(() => {
    if (packs.length > 0 && pack === null) {
      setPack(packs[0]);
    }
  }, [packs, pack]);

  return (
    <div className="absolute inset-0 flex flex-col items-center max-w-[420px] m-auto">
      <GlitchBombIcon
        size="xl"
        className="absolute top-9 left-1/2 -translate-x-1/2 text-white"
      />
      <div className="w-[188px] md:w-[300px] flex flex-col gap-12 items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <h1 className="uppercase text-center">
          <strong className="text-green-400 text-5xl md:text-7xl font-glitch font-thin">
            Glitch
          </strong>
          <br />
          <span className="text-white text-6xl md:text-8xl">Bomb</span>
        </h1>
        <div className="flex flex-col items-center justify-center gap-3 w-[124px]">
          <Connection />
          <Button
            variant={account && !pack ? "default" : "secondary"}
            className="h-12 w-full font-secondary uppercase text-sm tracking-widest font-normal"
            onClick={purchase}
          >
            Buy Packs
          </Button>
          {packs.slice(0, 3).map((p) => {
            const gameId = Math.max(p.game_count, 1);
            const game = getGameForPack(p.id, gameId);
            const isGameOver = game?.over ?? false;
            const hasNoGame = p.game_count === 0;

            // Game over state - show score and disabled button
            if (isGameOver) {
              return (
                <div key={p.id} className="w-full">
                  <Button
                    variant="secondary"
                    className="h-12 w-full font-secondary uppercase text-sm tracking-widest font-normal opacity-60"
                    disabled
                  >
                    <BombIcon size="sm" className="mr-2" />
                    Game Over
                  </Button>
                  <p className="text-center text-xs text-white/50 mt-1">
                    Pack #{p.id} • Score: {game?.points ?? 0}
                  </p>
                </div>
              );
            }

            // Active or new game - show continue/start button
            return (
              <Link
                key={p.id}
                to={
                  account && p
                    ? `/play?pack=${p.id}&game=${gameId}`
                    : "/"
                }
                className={cn(
                  "w-full",
                  !account || !p ? "cursor-default" : "",
                )}
              >
                <Button
                  variant={account && p ? "default" : "secondary"}
                  className="h-12 w-full font-secondary uppercase text-sm tracking-widest font-normal"
                  disabled={!account || !p}
                  onClick={() => (hasNoGame ? start(p.id) : undefined)}
                >
                  {hasNoGame ? "Start" : "Continue"} #{p.id}
                </Button>
              </Link>
            );
          })}
          <Balance
            highlight={!!account && !pack && balance < 10}
            balance={balance}
            onClick={() => mint(tokenAddress)}
          />
        </div>
      </div>
    </div>
  );
};
