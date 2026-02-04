import {
  ClauseBuilder,
  type SubscriptionCallbackArgs,
  ToriiQueryBuilder,
} from "@dojoengine/sdk";
import type * as torii from "@dojoengine/torii-wasm";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NAMESPACE } from "@/constants";
import { useEntitiesContext } from "@/contexts";
import { useOfflineMode } from "@/offline/mode";
import { selectPLDataPoints, useOfflineStore } from "@/offline/store";
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
  const offlineState = useOfflineStore();
  const offline = useOfflineMode();
  const offlinePoints = useMemo(
    () => selectPLDataPoints(offlineState, packId, gameId),
    [offlineState, packId, gameId],
  );
  const [dataPoints, setDataPoints] = useState<PLDataPoint[]>([]);
  const subscriptionRef = useRef<torii.Subscription | null>(null);
  const currentKeyRef = useRef<string | null>(null);

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
      if (!data || data.error) {
        return;
      }
      const entities = data.data || [data] || [];
      entities.forEach((entity) => {
        if (entity.models[`${NAMESPACE}-${PLDataPoint.getModelName()}`]) {
          const model = entity.models[
            `${NAMESPACE}-${PLDataPoint.getModelName()}`
          ] as unknown as RawPLDataPoint;
          const newPoint = PLDataPoint.parse(model);

          // Filter by packId/gameId if provided
          if (filterPackId !== undefined && filterGameId !== undefined) {
            if (
              Number(newPoint.packId) !== filterPackId ||
              newPoint.gameId !== filterGameId
            ) {
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
    if (offline || !client || !fetchKey) return;

    // Check if we're switching to a different game
    const isNewGame = currentKeyRef.current !== fetchKey;
    if (isNewGame) {
      // Cancel existing subscription
      if (subscriptionRef.current) {
        subscriptionRef.current.cancel();
        subscriptionRef.current = null;
      }
      // Reset data points when switching to a new game
      setDataPoints([]);
      currentKeyRef.current = fetchKey;
    }

    const fetchQuery = getPLDataPointsQuery(packId, gameId).build();

    // Function to fetch data
    const fetchData = () => {
      client
        .getEventMessages(fetchQuery)
        .then((result) => {
          if (result.items.length > 0) {
            onUpdate({ data: result.items, error: undefined });
          }
        })
        .catch((err) => console.error("[usePLDataPoints] Fetch error:", err));
    };

    // Initial fetch
    fetchData();

    // Retry fetch after a short delay (events may not be indexed yet)
    const retryTimeout = setTimeout(fetchData, 1000);
    const retryTimeout2 = setTimeout(fetchData, 3000);

    // Subscribe with broader query, filter client-side
    const subscribeQuery = getSubscriptionQuery().build();

    // Create a wrapped callback that includes the filter
    const filteredOnUpdate = (
      data: SubscriptionCallbackArgs<torii.Entity[], Error>,
    ) => {
      onUpdate(data, packId, gameId);
    };

    // Only set up subscription once per game
    if (!subscriptionRef.current) {
      client
        .onEventMessageUpdated(subscribeQuery.clause, [], filteredOnUpdate)
        .then((response) => {
          subscriptionRef.current = response;
        })
        .catch((err) =>
          console.error("[usePLDataPoints] Subscribe error:", err),
        );
    }

    return () => {
      clearTimeout(retryTimeout);
      clearTimeout(retryTimeout2);
      if (subscriptionRef.current) {
        subscriptionRef.current.cancel();
        subscriptionRef.current = null;
      }
    };
  }, [client, fetchKey, packId, gameId, onUpdate, offline]);

  return {
    dataPoints: offline ? offlinePoints : dataPoints,
    isReady,
  };
}
