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
import { selectPulls, useOfflineStore } from "@/offline/store";
import { OrbPulled, type RawOrbPulled } from "@/models";

const ENTITIES_LIMIT = 10_000;

const getPullsQuery = (packId: number, gameId: number) => {
  const modelName: `${string}-${string}` = `${NAMESPACE}-${OrbPulled.getModelName()}`;
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

export function usePulls({
  packId,
  gameId,
}: {
  packId: number;
  gameId: number;
}) {
  const { client } = useEntitiesContext();
  const offlineState = useOfflineStore();
  const offline = useOfflineMode();
  const offlinePulls = useMemo(
    () => selectPulls(offlineState, packId, gameId),
    [offlineState, packId, gameId],
  );
  const [pulls, setPulls] = useState<OrbPulled[]>([]);
  const [initialFetchComplete, setInitialFetchComplete] = useState(false);
  const subscriptionRef = useRef<torii.Subscription | null>(null);
  const currentKeyRef = useRef<string | null>(null);

  // Skip if invalid IDs (not yet loaded)
  const isReady = packId > 0 && gameId > 0;
  const fetchKey = isReady ? `${packId}-${gameId}` : null;

  // Create onUpdate that filters by packId/gameId
  const onUpdate = useCallback(
    (
      data: SubscriptionCallbackArgs<torii.Entity[], Error>,
      filterPackId: number,
      filterGameId: number,
    ) => {
      if (!data || data.error) {
        return;
      }
      (data.data || [data] || []).forEach((entity) => {
        if (entity.models[`${NAMESPACE}-${OrbPulled.getModelName()}`]) {
          const model = entity.models[
            `${NAMESPACE}-${OrbPulled.getModelName()}`
          ] as unknown as RawOrbPulled;
          const newPull = OrbPulled.parse(model);

          // Filter by packId/gameId to prevent cross-game contamination
          if (
            Number(newPull.pack_id) !== filterPackId ||
            newPull.game_id !== filterGameId
          ) {
            return;
          }

          setPulls((prev: OrbPulled[]) =>
            OrbPulled.deduplicate([...prev, newPull]),
          );
        }
      });
    },
    [],
  );

  useEffect(() => {
    if (!client || !fetchKey) return;

    // Check if we're switching to a different game
    const isNewGame = currentKeyRef.current !== fetchKey;
    if (isNewGame) {
      // Cancel existing subscription
      if (subscriptionRef.current) {
        subscriptionRef.current.cancel();
        subscriptionRef.current = null;
      }
      // Reset pulls when switching to a new game
      setPulls([]);
      setInitialFetchComplete(false);
      currentKeyRef.current = fetchKey;
    }

    // Fetch and subscribe
    const query = getPullsQuery(packId, gameId).build();

    // Create a wrapped callback that includes the filter
    const filteredOnUpdate = (
      data: SubscriptionCallbackArgs<torii.Entity[], Error>,
    ) => {
      onUpdate(data, packId, gameId);
    };

    client
      .getEventMessages(query)
      .then((result) => {
        filteredOnUpdate({ data: result.items, error: undefined });
        // Mark initial fetch as complete - new pulls after this should animate
        setInitialFetchComplete(true);
      })
      .catch((err) => console.error("[usePulls] Fetch error:", err));

    // Only set up subscription once per game
    if (!subscriptionRef.current) {
      client
        .onEventMessageUpdated(query.clause, [], filteredOnUpdate)
        .then((response) => {
          subscriptionRef.current = response;
        })
        .catch((err) => console.error("[usePulls] Subscribe error:", err));
    }

    return () => {
      // Cleanup handled in separate effect
    };
  }, [client, fetchKey, packId, gameId, onUpdate]);

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.cancel();
        subscriptionRef.current = null;
      }
    };
  }, []);

  return {
    pulls: offline ? offlinePulls : pulls,
    isReady,
    initialFetchComplete: offline ? true : initialFetchComplete,
  };
}
