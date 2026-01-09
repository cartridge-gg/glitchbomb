import type ControllerConnector from "@cartridge/connector/controller";
import { useAccount, useNetwork } from "@starknet-react/core";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Balance } from "@/components/elements";
import { GlitchBombIcon } from "@/components/icons";
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
  const { mint, start, isLoading } = useActions();
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

  const purchase = useCallback(async () => {
    if (!starterpack) return;
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
            disabled={isLoading}
            onClick={purchase}
          >
            Buy Packs
          </Button>
          {packs
            .filter((p) => {
              const gameId = Math.max(p.game_count, 1);
              const game = getGameForPack(p.id, gameId);
              // Only show packs with active games (not over)
              return !(game?.over ?? false);
            })
            .slice(0, 3)
            .map((p) => {
              const gameId = Math.max(p.game_count, 1);
              const hasNoGame = p.game_count === 0;

              return (
                <Link
                  key={p.id}
                  to={account && p ? `/play?pack=${p.id}&game=${gameId}` : "/"}
                  className={cn(
                    "w-full",
                    !account || !p ? "cursor-default" : "",
                  )}
                >
                  <Button
                    variant={account && p ? "default" : "secondary"}
                    className="h-12 w-full font-secondary uppercase text-sm tracking-widest font-normal"
                    disabled={!account || !p || isLoading}
                    onClick={() => (hasNoGame ? start(p.id) : undefined)}
                  >
                    {isLoading ? "..." : hasNoGame ? "Start" : "Continue"} #
                    {p.id}
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
