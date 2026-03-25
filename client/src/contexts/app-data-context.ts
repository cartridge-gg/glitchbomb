import type { TokenBalance, TokenContract } from "@dojoengine/torii-wasm";
import { createContext } from "react";
import type { ActivityItem } from "@/hooks/activity-feed";
import type { Game } from "@/models";

export interface AppDataContextType {
  /** On-chain owned games */
  onchainGames: Game[];
  gamesLoading: boolean;
  /** Activity feed items (game starts + cash outs) */
  activityItems: ActivityItem[];
  /** ERC20 token balances for the connected account */
  tokenBalances: TokenBalance[];
  /** ERC20 token contract metadata */
  tokenContracts: TokenContract[];
  tokensLoading: boolean;
  /** Token price in USD (from Ekubo) */
  tokenPrice: number | null;
  /** Refetch all app data (games, tokens, price) */
  refresh: () => void;
}

export const AppDataContext = createContext<AppDataContextType | undefined>(
  undefined,
);
