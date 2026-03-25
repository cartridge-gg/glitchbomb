import { useNetwork } from "@starknet-react/core";
import type { ReactNode } from "react";
import { getTokenAddress } from "@/config";
import { useTokenPrice } from "@/hooks/token-price";
import { useTokenContracts } from "@/hooks/tokens";
import { AppDataContext } from "./app-data-context";
import { useEntitiesContext } from "./use-entities-context";

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { config } = useEntitiesContext();
  const { chain } = useNetwork();

  const tokenAddress = config?.token || getTokenAddress(chain.id);
  const { contracts: tokenContracts } = useTokenContracts({
    contractAddresses: [tokenAddress],
  });

  const glitchAddress = getTokenAddress(chain.id);
  const { price: tokenPrice } = useTokenPrice(
    glitchAddress,
    config?.quote,
    chain.id.toString(),
  );

  return (
    <AppDataContext.Provider
      value={{
        tokenContracts,
        tokenPrice,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}
