import { createContext } from "react";
import type { Game as GameModel } from "@/models";

export interface GamesContextType {
  /** Games owned by the connected player (intersection of all games and ERC721 balances). */
  games: GameModel[];
  /** True while either the initial entity fetch or the asset (ERC721) fetch is in flight. */
  isLoading: boolean;
  /** Force a refetch of all Game entities. */
  refresh: () => Promise<unknown>;
}

export const GamesContext = createContext<GamesContextType | undefined>(
  undefined,
);
