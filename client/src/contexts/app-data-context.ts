import type { TokenContract } from "@dojoengine/torii-wasm";
import { createContext } from "react";

export interface AppDataContextType {
  tokenContracts: TokenContract[];
}

export const AppDataContext = createContext<AppDataContextType | undefined>(
  undefined,
);
