import {
  ClauseBuilder,
  type SubscriptionCallbackArgs,
  ToriiQueryBuilder,
} from "@dojoengine/sdk";
import type * as torii from "@dojoengine/torii-wasm";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GameChartDataPoint } from "@/components/elements";
import { DEFAULT_MOONROCKS, NAMESPACE } from "@/constants";
import { useEntitiesContext } from "@/contexts/use-entities-context";
import { ExtendedOrb, Marker, Orb, OrbPulled, type RawMarker } from "@/models";
import { milestoneCost } from "@/offline/milestone";
import { selectMarkers, useOfflineStore } from "@/offline/store";

const ENTITIES_LIMIT = 10_000;

// Marker id layout (mirrors `contracts/src/models/game.cairo`): every
// level owns a band of `MARKER_LEVEL_BAND` ids, so a marker's level can
// be read straight from its id. Used to derive the milestone cost for
// level-transition tooltips.
const MARKER_LEVEL_BAND = 1024;
const markerLevel = (markerId: number): number =>
  Math.floor(markerId / MARKER_LEVEL_BAND);

const getMarkersQuery = (gameId: number) => {
  const modelName: `${string}-${string}` = `${NAMESPACE}-${Marker.getModelName()}`;
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

// Subscription query - broader to catch all events, filter client-side
const getSubscriptionQuery = () => {
  const modelName: `${string}-${string}` = `${NAMESPACE}-${Marker.getModelName()}`;
  const clauses = new ClauseBuilder().keys([modelName], [], "VariableLen");
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys()
    .withLimit(ENTITIES_LIMIT);
};

/**
 * Build the chart-ready (`plData`, `chartPulls`) representation from a
 * Marker stream. The contract emits one Marker per orb pull, per level
 * transition, and once for the baseline. Marker ids follow a
 * level-banded layout (1024 ids per level, lower half pulls / upper
 * half level markers) which makes sorting by id strictly chronological
 * and guarantees there are no collisions — no need for cursor matching
 * or reordering.
 *
 * Each plotted point is paired 1:1 with an `OrbPulled` so the chart's
 * tooltip can read `orb.color()` / `logCategory()` / `logEffect()`.
 * Pull markers wrap `Orb.from(marker.orb)` while level markers and the
 * baseline get an `ExtendedOrb` with dedicated text.
 */
function buildChartFromMarkers(
  markers: Marker[],
  gameId: number,
): { plData: GameChartDataPoint[]; chartPulls: OrbPulled[] } {
  if (markers.length === 0) return { plData: [], chartPulls: [] };

  const sorted = [...markers].sort((a, b) => a.id - b.id);
  const chartPulls: OrbPulled[] = [];
  const plData: GameChartDataPoint[] = [];

  // Track previous potential to flip the dot color to red on negative
  // pulls (mirrors the legacy chart behaviour).
  let prevPotential = DEFAULT_MOONROCKS;

  for (const marker of sorted) {
    const isPull = marker.isPullMarker();

    let orb: Orb;
    if (marker.isBaseline()) {
      orb = new ExtendedOrb("New Game", `+${DEFAULT_MOONROCKS} Moonrocks`);
    } else if (marker.isLevelMarker()) {
      // Marker id encodes the level the player just finished; the
      // milestone cost is for the level they're entering (level + 1).
      const enteredLevel = markerLevel(marker.id) + 1;
      const cost = milestoneCost(enteredLevel);
      orb = new ExtendedOrb("Enter level", `-${cost} Moonrocks`);
    } else {
      orb = Orb.from(marker.orb);
    }

    chartPulls.push(
      new OrbPulled(gameId, marker.id, orb, marker.potentialMoonrocks),
    );

    // Color: the marker's natural variant, overridden to red on pull
    // markers when the potential dropped (curse, missed marker, or any
    // regression in the cumulative value).
    let variant: GameChartDataPoint["variant"] = marker.variant();
    if (isPull && marker.potentialMoonrocks < prevPotential) {
      variant = "red";
    }

    plData.push({
      value: marker.potentialMoonrocks,
      variant,
      id: marker.id,
      pullId: marker.id,
    });
    prevPotential = marker.potentialMoonrocks;
  }

  return { plData, chartPulls };
}

export function useMarkers({ gameId }: { gameId: number }) {
  const { client } = useEntitiesContext();
  const offlineState = useOfflineStore();
  const isPractice = !!offlineState.games[gameId];
  const offlineMarkers = useMemo(
    () => selectMarkers(offlineState, gameId),
    [offlineState, gameId],
  );
  const [markers, setMarkers] = useState<Marker[]>([]);
  const subscriptionRef = useRef<torii.Subscription | null>(null);
  const currentKeyRef = useRef<string | null>(null);
  const cancelSubscription = useCallback(() => {
    if (!subscriptionRef.current) return;
    try {
      subscriptionRef.current.cancel();
    } catch (error) {
      console.warn("[useMarkers] cancel failed", error);
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
      filterGameId?: number,
    ) => {
      if (!data || data.error) {
        return;
      }
      const entities = data.data || [data] || [];
      entities.forEach((entity) => {
        if (entity.models[`${NAMESPACE}-${Marker.getModelName()}`]) {
          const model = entity.models[
            `${NAMESPACE}-${Marker.getModelName()}`
          ] as unknown as RawMarker;
          const newMarker = Marker.parse(model);

          // Filter by gameId if provided
          if (filterGameId !== undefined) {
            if (Number(newMarker.gameId) !== filterGameId) {
              return;
            }
          }

          setMarkers((prev: Marker[]) =>
            Marker.deduplicate([...prev, newMarker]),
          );
        }
      });
    },
    [],
  );

  useEffect(() => {
    if (isPractice || !client || !fetchKey) return;

    // Check if we're switching to a different game
    const isNewGame = currentKeyRef.current !== fetchKey;
    if (isNewGame) {
      // Cancel existing subscription
      cancelSubscription();
      // Reset markers when switching to a new game
      setMarkers([]);
      currentKeyRef.current = fetchKey;
    }

    const fetchQuery = getMarkersQuery(gameId).build();

    // Function to fetch data
    const fetchData = () => {
      client
        .getEventMessages(fetchQuery)
        .then((result) => {
          if (result.items.length > 0) {
            onUpdate({ data: result.items, error: undefined });
          }
        })
        .catch((err) => console.error("[useMarkers] Fetch error:", err));
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
      onUpdate(data, gameId);
    };

    // Only set up subscription once per game
    if (!subscriptionRef.current) {
      client
        .onEventMessageUpdated(subscribeQuery.clause, [], filteredOnUpdate)
        .then((response) => {
          subscriptionRef.current = response;
        })
        .catch((err) => console.error("[useMarkers] Subscribe error:", err));
    }

    return () => {
      clearTimeout(retryTimeout);
      clearTimeout(retryTimeout2);
      cancelSubscription();
    };
  }, [client, fetchKey, gameId, onUpdate, isPractice, cancelSubscription]);

  const activeMarkers = isPractice ? offlineMarkers : markers;
  const { plData, chartPulls } = useMemo(
    () => buildChartFromMarkers(activeMarkers, gameId),
    [activeMarkers, gameId],
  );

  return {
    markers: activeMarkers,
    plData,
    chartPulls,
    isReady,
    isPractice,
  };
}
