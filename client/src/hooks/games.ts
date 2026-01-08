import {
  ClauseBuilder,
  OrComposeClause,
  type SubscriptionCallbackArgs,
  ToriiQueryBuilder,
} from "@dojoengine/sdk";
import type * as torii from "@dojoengine/torii-wasm";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NAMESPACE } from "@/constants";
import { useEntitiesContext } from "@/contexts";
import { Game, type RawGame } from "@/models";

const ENTITIES_LIMIT = 10_000;

interface PackGameKey {
  packId: number;
  gameId: number;
}

const getGamesQuery = (keys: PackGameKey[]) => {
  const modelName: `${string}-${string}` = `${NAMESPACE}-${Game.getModelName()}`;
  const clauses = OrComposeClause(
    keys.map(({ packId, gameId }) =>
      new ClauseBuilder().keys(
        [modelName],
        [`0x${packId.toString(16).padStart(16, "0")}`, `${gameId.toString()}`],
        "FixedLen",
      ),
    ),
  );
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys()
    .withLimit(ENTITIES_LIMIT);
};

export function useGames(keys: PackGameKey[]) {
  const { client } = useEntitiesContext();
  const [games, setGames] = useState<Game[]>([]);
  const subscriptionRef = useRef<torii.Subscription | null>(null);

  // Create a stable key string for dependency comparison
  const keysString = useMemo(
    () => JSON.stringify(keys.map((k) => `${k.packId}-${k.gameId}`).sort()),
    [keys],
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
            const deduped = prev.filter(
              (game) =>
                !(game.pack_id === newGame.pack_id && game.id === newGame.id),
            );
            return [...deduped, newGame];
          });
        }
      });
    },
    [],
  );

  // Refresh function to fetch and subscribe to data
  const refresh = useCallback(async () => {
    if (!client || !keys.length) return;

    // Cancel existing subscriptions
    subscriptionRef.current = null;

    // Fetch initial data
    const query = getGamesQuery(keys).build();
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
      if (subscriptionRef.current) {
        subscriptionRef.current.cancel();
      }
    };
  }, [refresh]);

  // Helper to get game by pack ID
  const getGameForPack = useCallback(
    (packId: number, gameId: number): Game | undefined => {
      return games.find(
        (game) => game.pack_id === packId && game.id === gameId,
      );
    },
    [games],
  );

  return {
    games,
    getGameForPack,
  };
}

