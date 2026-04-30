import { useNetwork } from "@starknet-react/core";
import type { ReactNode } from "react";
import { getTokenAddress } from "@/config";
import { useTokenContracts } from "@/hooks/tokens";
import { AppDataContext } from "./app-data-context";

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { chain } = useNetwork();

  const tokenAddress = getTokenAddress(chain.id);
  const { contracts: tokenContracts } = useTokenContracts({
    contractAddresses: [tokenAddress],
  });

  return (
    <AppDataContext.Provider value={{ tokenContracts }}>
      {children}
    </AppDataContext.Provider>
  );
}
