import {
  ClauseBuilder,
  type SubscriptionCallbackArgs,
  ToriiQueryBuilder,
} from "@dojoengine/sdk";
import type * as torii from "@dojoengine/torii-wasm";
import { useCallback, useEffect, useRef, useState } from "react";
import { NAMESPACE } from "@/constants";
import { useEntitiesContext } from "@/contexts";
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
  const [pulls, setPulls] = useState<OrbPulled[]>([]);
  const subscriptionRef = useRef<torii.Subscription | null>(null);
  const lastFetchedRef = useRef<string | null>(null);

  // Skip if invalid IDs (not yet loaded)
  const isReady = packId > 0 && gameId > 0;
  const fetchKey = isReady ? `${packId}-${gameId}` : null;

  const onUpdate = useCallback(
    (data: SubscriptionCallbackArgs<torii.Entity[], Error>) => {
      if (!data || data.error) {
        return;
      }
      (data.data || [data] || []).forEach((entity) => {
        if (entity.models[`${NAMESPACE}-${OrbPulled.getModelName()}`]) {
          const model = entity.models[
            `${NAMESPACE}-${OrbPulled.getModelName()}`
          ] as unknown as RawOrbPulled;
          const newPull = OrbPulled.parse(model);
          setPulls((prev: OrbPulled[]) =>
            OrbPulled.deduplicate([...prev, newPull]),
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

    // Reset pulls when switching to a new game
    setPulls([]);
    lastFetchedRef.current = fetchKey;

    // Fetch and subscribe
    const query = getPullsQuery(packId, gameId).build();

    client
      .getEventMessages(query)
      .then((result) => {
        onUpdate({ data: result.items, error: undefined });
      })
      .catch((err) => console.error("[usePulls] Fetch error:", err));

    client
      .onEventMessageUpdated(query.clause, [], onUpdate)
      .then((response) => {
        subscriptionRef.current = response;
      })
      .catch((err) => console.error("[usePulls] Subscribe error:", err));

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.cancel();
        subscriptionRef.current = null;
      }
    };
  }, [client, fetchKey, packId, gameId, onUpdate]);

  return {
    pulls,
    isReady,
  };
}
