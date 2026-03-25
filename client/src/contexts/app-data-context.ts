import type { TokenContract } from "@dojoengine/torii-wasm";
import { createContext } from "react";

export interface AppDataContextType {
  /** ERC20 token contract metadata (shared: home + game) */
  tokenContracts: TokenContract[];
  /** Token price in USD from Ekubo (shared: home + game) */
  tokenPrice: number | null;
}

export const AppDataContext = createContext<AppDataContextType | undefined>(
  undefined,
);
