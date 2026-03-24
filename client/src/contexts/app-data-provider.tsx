import { useAccount, useNetwork } from "@starknet-react/core";
import type { ReactNode } from "react";
import { DEFAULT_CHAIN_ID, getTokenAddress } from "@/config";
import { useActivityFeed } from "@/hooks/activity-feed";
import { useOwnedGames } from "@/hooks/packs";
import { useTokenPrice } from "@/hooks/token-price";
import { useTokens } from "@/hooks/tokens";
import { AppDataContext } from "./app-data-context";
import { useEntitiesContext } from "./use-entities-context";
import { useLoadingSignal } from "./use-loading";

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { config } = useEntitiesContext();
  const { account } = useAccount();
  const { chain } = useNetwork();

  const { games: onchainGames, isLoading: gamesLoading } = useOwnedGames();
  const activityItems = useActivityFeed(BigInt(DEFAULT_CHAIN_ID));

  const tokenAddress = config?.token || getTokenAddress(chain.id);
  const {
    tokenBalances,
    tokenContracts,
    isLoading: tokensLoading,
  } = useTokens({
    accountAddresses: account?.address ? [account.address] : [],
    contractAddresses: [tokenAddress],
  });

  const glitchAddress = getTokenAddress(chain.id);
  const { price: tokenPrice } = useTokenPrice(
    glitchAddress,
    config?.quote,
    chain.id.toString(),
  );

  // Report loading signals to the app-wide loading screen
  useLoadingSignal("games", !gamesLoading);
  useLoadingSignal("tokens", !tokensLoading);

  return (
    <AppDataContext.Provider
      value={{
        onchainGames,
        gamesLoading,
        activityItems,
        tokenBalances,
        tokenContracts,
        tokensLoading,
        tokenPrice,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}
