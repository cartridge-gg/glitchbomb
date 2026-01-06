import {
  MemberClause,
  OrComposeClause,
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
  const clauses = OrComposeClause([
    MemberClause(
      `${NAMESPACE}-${OrbPulled.getModelName()}`,
      "pack_id",
      "Eq",
      `0x${packId.toString(16).padStart(16, "0")}`,
    ),
    MemberClause(
      `${NAMESPACE}-${OrbPulled.getModelName()}`,
      "game_id",
      "Eq",
      `${gameId.toString()}`,
    ),
  ]);
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

  const onUpdate = useCallback(
    (data: SubscriptionCallbackArgs<torii.Entity[], Error>) => {
      if (!data || data.error) return;
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

  // Refresh function to fetch and subscribe to data
  const refresh = useCallback(async () => {
    if (!client || !packId || !gameId) return;

    // Cancel existing subscriptions
    subscriptionRef.current = null;

    // Fetch initial data
    const query = getPullsQuery(packId, gameId).build();
    await client
      .getEventMessages(query)
      .then((result) => onUpdate({ data: result.items, error: undefined }));

    // Subscribe to entity and event updates
    client
      .onEventMessageUpdated(query.clause, [], onUpdate)
      .then((response) => {
        subscriptionRef.current = response;
      });
  }, [client, packId, gameId, onUpdate]);

  useEffect(() => {
    refresh();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.cancel();
      }
    };
  }, [refresh]);

  return {
    pulls,
  };
}
