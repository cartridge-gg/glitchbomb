import {
  ClauseBuilder,
  OrComposeClause,
  type SubscriptionCallbackArgs,
  ToriiQueryBuilder,
} from "@dojoengine/sdk";
import type * as torii from "@dojoengine/torii-wasm";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NAMESPACE } from "@/constants";
import { useEntitiesContext } from "@/contexts/use-entities-context";
import { Game, type RawGame } from "@/models";
import { useOfflineMode } from "@/offline/mode";
import { selectGame, useOfflineStore } from "@/offline/store";

const ENTITIES_LIMIT = 10_000;

const getGamesQuery = (gameIds: number[]) => {
  const modelName: `${string}-${string}` = `${NAMESPACE}-${Game.getModelName()}`;
  const clauses = OrComposeClause(
    gameIds.map((id) =>
      new ClauseBuilder().keys(
        [modelName],
        [`0x${id.toString(16).padStart(16, "0")}`],
        "FixedLen"
      )
    )
  );
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys()
    .withLimit(ENTITIES_LIMIT);
};

export function useGames(gameIds: number[]) {
  const { client } = useEntitiesContext();
  const offlineState = useOfflineStore();
  const offline = useOfflineMode();
  const [games, setGames] = useState<Game[]>([]);
  const subscriptionRef = useRef<torii.Subscription | null>(null);
  const cancelSubscription = useCallback(() => {
    if (!subscriptionRef.current) return;
    try {
      subscriptionRef.current.cancel();
    } catch (error) {
      console.warn("[useGames] cancel failed", error);
    } finally {
      subscriptionRef.current = null;
    }
  }, []);

  // Create a stable key string for dependency comparison
  const keysString = useMemo(
    () => JSON.stringify([...gameIds].sort()),
    [gameIds]
  );

  const onUpdate = useCallback(
    (data: SubscriptionCallbackArgs<torii.Entity[], Error>) => {
      if (!data || data.error) return;
      (data.data || [data] || []).forEach((entity) => {
        if (entity.models[`${NAMESPACE}-${Game.getModelName()}`]) {
          const model = entity.models[
            `${NAMESPACE}-${Game.getModelName()}`
          ] as unknown as RawGame;
          const newGame = Game.parse(model);
          setGames((prev: Game[]) => {
            const deduped = prev.filter((game) => game.id !== newGame.id);
            return [...deduped, newGame];
          });
        }
      });
    },
    []
  );

  // Refresh function to fetch and subscribe to data
  const refresh = useCallback(async () => {
    if (offline) return;
    if (!client || !gameIds.length) return;

    // Cancel existing subscriptions
    subscriptionRef.current = null;

    // Fetch initial data
    const query = getGamesQuery(gameIds).build();
    const result = await client.getEntities(query);
    onUpdate({ data: result.items, error: undefined });

    // Subscribe to entity and event updates
    client.onEntityUpdated(query.clause, [], onUpdate).then((response) => {
      subscriptionRef.current = response;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, keysString, onUpdate, offline]);

  useEffect(() => {
    refresh();

    return () => {
      cancelSubscription();
    };
  }, [refresh, offline, cancelSubscription]);

  // Helper to get game by ID
  const getGame = useCallback(
    (gameId: number): Game | undefined => {
      if (offline) return selectGame(offlineState, gameId);
      return games.find((game) => game.id === gameId);
    },
    [games, offline, offlineState]
  );

  return {
    games: offline
      ? gameIds
          .map((id) => selectGame(offlineState, id))
          .filter((game): game is Game => !!game)
      : games,
    getGame,
  };
}
