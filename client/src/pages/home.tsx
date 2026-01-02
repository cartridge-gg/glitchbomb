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
import { usePacks } from "@/hooks/packs";
import { toDecimal, useTokens } from "@/hooks/tokens";
import { cn } from "@/lib/utils";
import type { Pack } from "@/models";

export const Home = () => {
  const { mint, start } = useActions();
  const { chain } = useNetwork();
  const { account, connector } = useAccount();
  const { tokenBalances, tokenContracts } = useTokens({
    accountAddresses: account?.address ? [account?.address] : [],
    contractAddresses: [getTokenAddress(chain.id)],
  });
  const { starterpack } = useEntitiesContext();

  const { packs } = usePacks();
  const [pack, setPack] = useState<Pack | null>(null);

  const balance = useMemo(() => {
    const tokenAddress = getTokenAddress(chain.id);
    if (!tokenAddress) return 0;
    const tokenContract = tokenContracts.find(
      (contract) => BigInt(contract.contract_address) === BigInt(tokenAddress),
    );
    if (!tokenContract) return 0;
    const tokenBalance = tokenBalances.find(
      (balance) => BigInt(balance.contract_address) === BigInt(tokenAddress),
    );
    if (!tokenBalance) return 0;
    return Number(toDecimal(tokenContract, tokenBalance));
  }, [tokenContracts, tokenBalances, chain.id]);

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
            onClick={purchase}
          >
            Buy Packs
          </Button>
          {packs.slice(0, 3).map((pack) => {
            return (
              <Link
                key={pack.id}
                to={
                  account && pack
                    ? `/play?pack=${pack.id}&game=${Math.max(pack.game_count, 1)}`
                    : "/"
                }
                className={cn(
                  "w-full",
                  !account || !pack ? "cursor-default" : "",
                )}
              >
                <Button
                  variant={account && pack ? "default" : "secondary"}
                  className="h-12 w-full font-secondary uppercase text-sm tracking-widest font-normal"
                  disabled={!account || !pack}
                  onClick={() =>
                    pack.game_count === 0 ? start(pack.id) : undefined
                  }
                >
                  Continue {pack.id}
                </Button>
              </Link>
            );
          })}
          <Balance
            highlight={!!account && !pack && balance < 10}
            balance={balance}
            onClick={mint}
          />
        </div>
      </div>
    </div>
  );
};
