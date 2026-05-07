import { useContext } from "react";
import { GamesContext, type GamesContextType } from "./games-context";

/**
 * Returns the connected player's owned games, with real-time updates.
 * Must be used under a `GamesProvider`.
 */
export function useOwnedGames(): GamesContextType {
  const ctx = useContext(GamesContext);
  if (!ctx) {
    throw new Error("useOwnedGames must be used within a GamesProvider");
  }
  return ctx;
}
