import type { SubscriptionCallbackArgs } from "@dojoengine/sdk";
import type * as torii from "@dojoengine/torii-wasm";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type ReactNode, useCallback, useEffect, useMemo, useRef } from "react";
import { Game as GameApi } from "@/api/torii/game";
import { NAMESPACE } from "@/constants";
import { useEntitiesContext } from "@/contexts/use-entities-context";
import { useAssets } from "@/hooks/assets";
import { Game as GameModel, type RawGame } from "@/models";
import { GamesContext, type GamesContextType } from "./games-context";

/**
 * Provides player-owned games via:
 *  - A single `client.getEntities(...)` initial fetch on the wildcard Game
 *    clause, cached in TanStack Query under `["games"]`.
 *  - A single `client.onEntityUpdated(...)` long-lived subscription on the
 *    same wildcard clause, that merges incoming entity updates into the cache.
 *  - An ERC721 token-balance subscription (`useAssets`) that yields the
 *    player's `gameIds`. The Game list is intersected with `gameIds` client
 *    side, so ownership is reactive without rebuilding the entity subscription.
 *
 * This mirrors the architecture used in `nums/client/src/context/games.tsx`.
 */
export function GamesProvider({ children }: { children: ReactNode }) {
  const { client } = useEntitiesContext();
  const { gameIds, isLoading: assetsLoading } = useAssets();

  const queryClient = useQueryClient();
  const queryKey = useMemo(() => GameApi.keys.all(), []);
  const subscriptionRef = useRef<torii.Subscription | null>(null);

  const {
    data: games = [],
    isLoading: entitiesLoading,
    refetch: refresh,
  } = useQuery<GameModel[]>({
    queryKey,
    queryFn: async () => {
      if (!client) throw new Error("Torii client not available");
      const result = await client.getEntities(GameApi.allQuery().build());
      return GameModel.deduplicate(GameApi.parse(result.items));
    },
    enabled: !!client,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  const onSubscriptionUpdate = useCallback(
    (data: SubscriptionCallbackArgs<torii.Entity[], Error>) => {
      if (!data || data.error) return;
      const newGames: GameModel[] = [];
      (data.data || [data] || []).forEach((entity) => {
        const key = `${NAMESPACE}-${GameModel.getModelName()}`;
        if (entity.models[key]) {
          const parsed = GameModel.parse(
            entity.models[key] as unknown as RawGame,
          );
          if (parsed) newGames.push(parsed);
        }
      });
      if (newGames.length === 0) return;
      queryClient.setQueryData<GameModel[]>(queryKey, (prev) =>
        // New entries first so they win the dedupe (replaces older copy).
        GameModel.deduplicate([...newGames, ...(prev || [])]),
      );
    },
    [queryClient, queryKey],
  );

  // Long-lived subscription on the wildcard Game clause. Created once per
  // client and torn down on unmount; never recreated when gameIds change.
  useEffect(() => {
    if (!client) return;

    const query = GameApi.allQuery();
    let cancelled = false;

    client
      .onEntityUpdated(query.build().clause, [], onSubscriptionUpdate)
      .then((sub) => {
        if (cancelled) {
          // Effect was already torn down before subscribe resolved.
          try {
            sub.cancel();
          } catch (error) {
            console.warn("[GamesProvider] late cancel failed", error);
          }
          return;
        }
        if (subscriptionRef.current) {
          try {
            subscriptionRef.current.cancel();
          } catch (error) {
            console.warn("[GamesProvider] previous cancel failed", error);
          }
        }
        subscriptionRef.current = sub;
      });

    return () => {
      cancelled = true;
      if (subscriptionRef.current) {
        try {
          subscriptionRef.current.cancel();
        } catch (error) {
          console.warn("[GamesProvider] cancel failed", error);
        }
        subscriptionRef.current = null;
      }
    };
  }, [client, onSubscriptionUpdate]);

  // When ownership changes (new mint, transfer), refetch entities so any
  // game that wasn't yet in the cache becomes visible immediately. The
  // existing subscription will keep them up-to-date afterwards.
  const gameIdsKey = useMemo(
    () =>
      gameIds
        .slice()
        .sort((a, b) => a - b)
        .join(","),
    [gameIds],
  );
  const prevGameIdsKeyRef = useRef(gameIdsKey);

  useEffect(() => {
    if (prevGameIdsKeyRef.current === gameIdsKey) return;
    prevGameIdsKeyRef.current = gameIdsKey;
    refresh();
  }, [gameIdsKey, refresh]);

  const playerGames = useMemo(
    () => games.filter((game) => gameIds.includes(game.id)),
    [games, gameIds],
  );

  const value = useMemo<GamesContextType>(
    () => ({
      games: playerGames,
      isLoading: entitiesLoading || assetsLoading,
      refresh,
    }),
    [playerGames, entitiesLoading, assetsLoading, refresh],
  );

  return (
    <GamesContext.Provider value={value}>{children}</GamesContext.Provider>
  );
}
