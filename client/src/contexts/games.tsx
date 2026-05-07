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
 *    `gameIds` (derived from ERC721 balances). The result is cached in
 *    TanStack Query under a stable key (`["games"]`) so the cache is never
 *    discarded when ownership changes — when `gameIds` evolves we manually
 *    prune + refetch into the same key, avoiding a loading-state flash.
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

  // Stable string key for dependency comparisons (drives the manual
  // refetch effect when ownership changes).
  const gameIdsKey = useMemo(
    () =>
      gameIds
        .slice()
        .sort((a, b) => a - b)
        .join(","),
    [gameIds],
  );

  // Read the latest `gameIds` from refs inside async callbacks — neither
  // the query function, the subscription callback, nor the cache write
  // should be invalidated/recreated when ownership changes.
  const gameIdsRef = useRef<number[]>(gameIds);
  gameIdsRef.current = gameIds;

  const queryClient = useQueryClient();
  // IMPORTANT: keep the cache key stable across ownership changes. If the
  // key included `gameIdsKey`, every mint/transfer would create a brand
  // new query without cached data, briefly flipping `isLoading` back to
  // true and producing a loading flash on the home screen.
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
      const ids = gameIdsRef.current;
      if (ids.length === 0) return [];
      const result = await client.getEntities(GameApi.byIdsQuery(ids).build());
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

  // When ownership changes (mint/transfer), refetch entities so any newly
  // owned game appears immediately, and prune cached entities that are no
  // longer owned. The cached data stays populated during the refetch — no
  // loading flash. Skip the very first run because the initial query already
  // covers it.
  const prevGameIdsKeyRef = useRef<string | null>(null);
  useEffect(() => {
    if (prevGameIdsKeyRef.current === gameIdsKey) return;
    const isFirstRun = prevGameIdsKeyRef.current === null;
    prevGameIdsKeyRef.current = gameIdsKey;
    if (isFirstRun) return;

    // Prune any cached entries the player no longer owns.
    const ownedSet = new Set(gameIds);
    queryClient.setQueryData<GameModel[]>(
      queryKey,
      (prev) => prev?.filter((g) => ownedSet.has(g.id)) ?? [],
    );
    // Pull fresh state for the (possibly extended) owned set.
    refresh();
  }, [gameIdsKey, gameIds, queryClient, queryKey, refresh]);

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
