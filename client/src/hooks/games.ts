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
import { selectGame, useOfflineStore } from "@/offline/store";

const ENTITIES_LIMIT = 10_000;

const getGamesQuery = (gameIds: number[]) => {
  const modelName: `${string}-${string}` = `${NAMESPACE}-${Game.getModelName()}`;
  const clauses = OrComposeClause(
    gameIds.map((id) =>
      new ClauseBuilder().keys(
        [modelName],
        [`0x${id.toString(16).padStart(16, "0")}`],
        "FixedLen",
      ),
    ),
  );
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys()
    .withLimit(ENTITIES_LIMIT);
};

export function useGames(gameIds: number[]) {
  const { client } = useEntitiesContext();
  const offlineState = useOfflineStore();
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

  // Split game IDs into practice (in offline store) and on-chain
  const { practiceIds, onchainIds } = useMemo(() => {
    const practice: number[] = [];
    const onchain: number[] = [];
    for (const id of gameIds) {
      if (offlineState.games[id]) {
        practice.push(id);
      } else {
        onchain.push(id);
      }
    }
    return { practiceIds: practice, onchainIds: onchain };
  }, [gameIds, offlineState]);

  // Create a stable key string for dependency comparison
  const keysString = useMemo(
    () => JSON.stringify([...onchainIds].sort()),
    [onchainIds],
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
    [],
  );

  // Refresh function to fetch and subscribe to data
  const refresh = useCallback(async () => {
    if (!client || !onchainIds.length) return;

    // Cancel existing subscriptions
    subscriptionRef.current = null;

    // Fetch initial data
    const query = getGamesQuery(onchainIds).build();
    const result = await client.getEntities(query);
    onUpdate({ data: result.items, error: undefined });

    // Subscribe to entity and event updates
    client.onEntityUpdated(query.clause, [], onUpdate).then((response) => {
      subscriptionRef.current = response;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, keysString, onUpdate]);

  useEffect(() => {
    refresh();

    return () => {
      cancelSubscription();
    };
  }, [refresh, cancelSubscription]);

  // Helper to get game by ID
  const getGame = useCallback(
    (gameId: number): Game | undefined => {
      if (offlineState.games[gameId]) return selectGame(offlineState, gameId);
      return games.find((game) => game.id === gameId);
    },
    [games, offlineState],
  );

  // Combine practice games and on-chain games
  const allGames = useMemo(() => {
    const practiceGames = practiceIds
      .map((id) => selectGame(offlineState, id))
      .filter((game): game is Game => !!game);
    return [...practiceGames, ...games];
  }, [practiceIds, offlineState, games]);

  return {
    games: allGames,
    getGame,
  };
}
