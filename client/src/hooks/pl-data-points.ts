import {
  ClauseBuilder,
  type SubscriptionCallbackArgs,
  ToriiQueryBuilder,
} from "@dojoengine/sdk";
import type * as torii from "@dojoengine/torii-wasm";
import { useCallback, useEffect, useRef, useState } from "react";
import { NAMESPACE } from "@/constants";
import { useEntitiesContext } from "@/contexts";
import { PLDataPoint, type RawPLDataPoint } from "@/models";

const ENTITIES_LIMIT = 10_000;

const getPLDataPointsQuery = (packId: number, gameId: number) => {
  const modelName: `${string}-${string}` = `${NAMESPACE}-${PLDataPoint.getModelName()}`;
  // Use keys() to match BOTH pack_id AND game_id (composite key)
  const clauses = new ClauseBuilder().keys(
    [modelName],
    [`0x${packId.toString(16).padStart(16, "0")}`, `${gameId.toString()}`],
    "VariableLen",
  );
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys()
    .withLimit(ENTITIES_LIMIT);
};

// Subscription query - broader to catch all events, filter client-side
const getSubscriptionQuery = () => {
  const modelName: `${string}-${string}` = `${NAMESPACE}-${PLDataPoint.getModelName()}`;
  const clauses = new ClauseBuilder().keys([modelName], [], "VariableLen");
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys()
    .withLimit(ENTITIES_LIMIT);
};

export function usePLDataPoints({
  packId,
  gameId,
}: {
  packId: number;
  gameId: number;
}) {
  const { client } = useEntitiesContext();
  const [dataPoints, setDataPoints] = useState<PLDataPoint[]>([]);
  const subscriptionRef = useRef<torii.Subscription | null>(null);
  const lastFetchedRef = useRef<string | null>(null);

  // Skip if invalid IDs (not yet loaded)
  const isReady = packId > 0 && gameId > 0;
  const fetchKey = isReady ? `${packId}-${gameId}` : null;

  // Create onUpdate that filters by packId/gameId
  const onUpdate = useCallback(
    (
      data: SubscriptionCallbackArgs<torii.Entity[], Error>,
      filterPackId?: number,
      filterGameId?: number,
    ) => {
      console.log("[usePLDataPoints] onUpdate called:", data);
      if (!data || data.error) {
        console.log("[usePLDataPoints] No data or error:", data?.error);
        return;
      }
      const entities = data.data || [data] || [];
      console.log("[usePLDataPoints] Processing entities:", entities.length);
      entities.forEach((entity) => {
        console.log(
          "[usePLDataPoints] Entity models:",
          Object.keys(entity.models || {}),
        );
        if (entity.models[`${NAMESPACE}-${PLDataPoint.getModelName()}`]) {
          const model = entity.models[
            `${NAMESPACE}-${PLDataPoint.getModelName()}`
          ] as unknown as RawPLDataPoint;
          console.log("[usePLDataPoints] Raw PLDataPoint:", model);
          const newPoint = PLDataPoint.parse(model);
          console.log("[usePLDataPoints] Parsed PLDataPoint:", newPoint);

          // Filter by packId/gameId if provided
          if (filterPackId !== undefined && filterGameId !== undefined) {
            if (
              Number(newPoint.packId) !== filterPackId ||
              newPoint.gameId !== filterGameId
            ) {
              console.log(
                "[usePLDataPoints] Skipping - wrong pack/game:",
                newPoint.packId,
                newPoint.gameId,
                "expected:",
                filterPackId,
                filterGameId,
              );
              return;
            }
          }

          setDataPoints((prev: PLDataPoint[]) =>
            PLDataPoint.deduplicate([...prev, newPoint]),
          );
        }
      });
    },
    [],
  );

  useEffect(() => {
    // Skip if not ready or already fetched for this key
    if (!client || !fetchKey || lastFetchedRef.current === fetchKey) return;

    // Cancel existing subscription
    if (subscriptionRef.current) {
      subscriptionRef.current.cancel();
      subscriptionRef.current = null;
    }

    // Reset data points when switching to a new game
    setDataPoints([]);
    lastFetchedRef.current = fetchKey;

    // Fetch with specific pack/game filter
    const fetchQuery = getPLDataPointsQuery(packId, gameId).build();
    console.log(
      "[usePLDataPoints] Fetch query clause:",
      JSON.stringify(fetchQuery.clause, null, 2),
    );

    client
      .getEventMessages(fetchQuery)
      .then((result) => {
        console.log(
          "[usePLDataPoints] Initial fetch result:",
          result.items.length,
          "items",
        );
        onUpdate({ data: result.items, error: undefined });
      })
      .catch((err) => console.error("[usePLDataPoints] Fetch error:", err));

    // Subscribe with broader query, filter client-side
    const subscribeQuery = getSubscriptionQuery().build();
    console.log(
      "[usePLDataPoints] Subscribe query clause:",
      JSON.stringify(subscribeQuery.clause, null, 2),
    );

    // Create a wrapped callback that includes the filter
    const filteredOnUpdate = (
      data: SubscriptionCallbackArgs<torii.Entity[], Error>,
    ) => {
      onUpdate(data, packId, gameId);
    };

    client
      .onEventMessageUpdated(subscribeQuery.clause, [], filteredOnUpdate)
      .then((response) => {
        console.log("[usePLDataPoints] Subscription established");
        subscriptionRef.current = response;
      })
      .catch((err) => console.error("[usePLDataPoints] Subscribe error:", err));

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.cancel();
        subscriptionRef.current = null;
      }
    };
  }, [client, fetchKey, packId, gameId, onUpdate]);

  return {
    dataPoints,
    isReady,
  };
}
