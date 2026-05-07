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
 *  - A scoped `client.getEntities(...)` initial fetch using an
 *    `OrCompose(MemberClause(id, Eq, ...))` clause built from the player's
 *    `gameIds` (derived from ERC721 balances). Cached in TanStack Query under
 *    `["games", "owned", <idsKey>]`.
 *  - A single long-lived wildcard `client.onEntityUpdated(...)` subscription
 *    on the Game model. Updates are filtered client-side against the current
 *    `gameIds` so we only persist the player's entities. Wildcard is required
 *    here because newly minted/transferred games would otherwise be missed
 *    (their id is unknown until the ERC721 balance subscription fires).
 *
 * This mirrors the architecture used in `nums/client/src/context/games.tsx`
 * but bounds the initial fetch to the player's inventory rather than loading
 * every game on the world.
 */
export function GamesProvider({ children }: { children: ReactNode }) {
  const { client } = useEntitiesContext();
  const { gameIds, isLoading: assetsLoading } = useAssets();

  // Stable string key for query cache + dependency comparisons.
  const gameIdsKey = useMemo(
    () =>
      gameIds
        .slice()
        .sort((a, b) => a - b)
        .join(","),
    [gameIds],
  );

  // Always read from the latest `gameIds` inside the long-lived subscription
  // callback — `gameIds` changes (mint/transfer) must not recreate the sub.
  const gameIdsRef = useRef<number[]>(gameIds);
  gameIdsRef.current = gameIds;

  const queryClient = useQueryClient();
  const queryKey = useMemo(() => GameApi.keys.byIds(gameIdsKey), [gameIdsKey]);
  const subscriptionRef = useRef<torii.Subscription | null>(null);

  const {
    data: games = [],
    isLoading: entitiesLoading,
    refetch: refresh,
  } = useQuery<GameModel[]>({
    queryKey,
    queryFn: async () => {
      if (!client) throw new Error("Torii client not available");
      if (gameIds.length === 0) return [];
      const result = await client.getEntities(
        GameApi.byIdsQuery(gameIds).build(),
      );
      return GameModel.deduplicate(GameApi.parse(result.items));
    },
    enabled: !!client && !assetsLoading,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  const onSubscriptionUpdate = useCallback(
    (data: SubscriptionCallbackArgs<torii.Entity[], Error>) => {
      if (!data || data.error) return;
      const ownedIds = gameIdsRef.current;
      if (ownedIds.length === 0) return;
      const ownedSet = new Set(ownedIds);
      const newGames: GameModel[] = [];
      (data.data || [data] || []).forEach((entity) => {
        const key = `${NAMESPACE}-${GameModel.getModelName()}`;
        if (!entity.models[key]) return;
        const parsed = GameModel.parse(
          entity.models[key] as unknown as RawGame,
        );
        // Drop updates for games the connected player does not own. The
        // wildcard subscription is required (we can't enumerate ids ahead
        // of mint), but we must not persist other players' state.
        if (parsed && ownedSet.has(parsed.id)) newGames.push(parsed);
      });
      if (newGames.length === 0) return;
      queryClient.setQueryData<GameModel[]>(queryKey, (prev) =>
        // New entries first so they win the dedupe (replaces older copy).
        GameModel.deduplicate([...newGames, ...(prev || [])]),
      );
    },
    [queryClient, queryKey],
  );

  // Long-lived wildcard subscription on the Game clause. Created once per
  // client and torn down on unmount; never recreated when gameIds change.
  // Filtering by ownership happens in the callback.
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

  const value = useMemo<GamesContextType>(
    () => ({
      games,
      isLoading: assetsLoading || (gameIds.length > 0 && entitiesLoading),
      refresh,
    }),
    [games, assetsLoading, entitiesLoading, gameIds.length, refresh],
  );

  return (
    <GamesContext.Provider value={value}>{children}</GamesContext.Provider>
  );
}
