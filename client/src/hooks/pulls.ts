import {
  ClauseBuilder,
  type SubscriptionCallbackArgs,
  ToriiQueryBuilder,
} from "@dojoengine/sdk";
import type * as torii from "@dojoengine/torii-wasm";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NAMESPACE } from "@/constants";
import { useEntitiesContext } from "@/contexts/use-entities-context";
import { OrbPulled, type RawOrbPulled } from "@/models";
import { useOfflineMode } from "@/offline/mode";
import { selectPulls, useOfflineStore } from "@/offline/store";

const ENTITIES_LIMIT = 10_000;

const getPullsQuery = (gameId: number) => {
  const modelName: `${string}-${string}` = `${NAMESPACE}-${OrbPulled.getModelName()}`;
  const clauses = new ClauseBuilder().keys(
    [modelName],
    [`0x${gameId.toString(16).padStart(16, "0")}`],
    "VariableLen",
  );
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys()
    .withLimit(ENTITIES_LIMIT);
};

export function usePulls({ gameId }: { gameId: number }) {
  const { client } = useEntitiesContext();
  const offlineState = useOfflineStore();
  const offline = useOfflineMode();
  const offlinePulls = useMemo(
    () => selectPulls(offlineState, gameId),
    [offlineState, gameId],
  );
  const [pulls, setPulls] = useState<OrbPulled[]>([]);
  const [initialFetchComplete, setInitialFetchComplete] = useState(false);
  const subscriptionRef = useRef<torii.Subscription | null>(null);
  const currentKeyRef = useRef<string | null>(null);
  const cancelSubscription = useCallback(() => {
    if (!subscriptionRef.current) return;
    try {
      subscriptionRef.current.cancel();
    } catch (error) {
      console.warn("[usePulls] cancel failed", error);
    } finally {
      subscriptionRef.current = null;
    }
  }, []);

  // Skip if invalid IDs (not yet loaded)
  const isReady = gameId > 0;
  const fetchKey = isReady ? `${gameId}` : null;

  // Create onUpdate that filters by gameId
  const onUpdate = useCallback(
    (
      data: SubscriptionCallbackArgs<torii.Entity[], Error>,
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

          // Filter by gameId to prevent cross-game contamination
          if (newPull.game_id !== filterGameId) {
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
    if (offline || !client || !fetchKey) return;

    // Check if we're switching to a different game
    const isNewGame = currentKeyRef.current !== fetchKey;
    if (isNewGame) {
      // Cancel existing subscription
      cancelSubscription();
      // Reset pulls when switching to a new game
      setPulls([]);
      setInitialFetchComplete(false);
      currentKeyRef.current = fetchKey;
    }

    // Fetch and subscribe
    const query = getPullsQuery(gameId).build();

    // Create a wrapped callback that includes the filter
    const filteredOnUpdate = (
      data: SubscriptionCallbackArgs<torii.Entity[], Error>,
    ) => {
      onUpdate(data, gameId);
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
      cancelSubscription();
    };
  }, [client, fetchKey, gameId, onUpdate, offline, cancelSubscription]);

  return {
    pulls: offline ? offlinePulls : pulls,
    isReady,
    initialFetchComplete: offline ? true : initialFetchComplete,
  };
}
