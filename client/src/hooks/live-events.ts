import type * as torii from "@dojoengine/torii-wasm";
import { useAtomValue } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";
import { Event } from "@/api/torii/event";
import { subscribeEvents } from "@/api/torii/subscribe";
import { toriiClientAtom } from "@/atoms";
import { Claimed, Started } from "@/models";

/**
 * Fetches and subscribes to live game events (Started/Claimed) emitted by the
 * contract. Used to power the live ticker on the home page.
 *
 * Mirrors the approach used by the `nums` repo: keep up to 10 most recent
 * events of each kind and merge/sort them at render time.
 */
export function useLiveEvents() {
  const client = useAtomValue(toriiClientAtom);
  const subscriptionRef = useRef<torii.Subscription | null>(null);
  const subscriptionKeyRef = useRef<string>();

  const [starteds, setStarteds] = useState<Started[]>([]);
  const [claimeds, setClaimeds] = useState<Claimed[]>([]);

  const handleUpdate = useCallback((entities: torii.Entity[]) => {
    const parsedStarteds = Event.parseStarteds(entities);
    const parsedClaimeds = Event.parseClaimeds(entities);

    if (parsedStarteds.length > 0) {
      setStarteds((prev) =>
        Started.dedupe(
          [...parsedStarteds, ...(prev || [])].sort((a, b) => b.time - a.time),
        ).slice(0, 10),
      );
    }
    if (parsedClaimeds.length > 0) {
      setClaimeds((prev) =>
        Claimed.dedupe(
          [...parsedClaimeds, ...(prev || [])].sort((a, b) => b.time - a.time),
        ).slice(0, 10),
      );
    }
  }, []);

  useEffect(() => {
    if (!client) return;
    let cancelled = false;

    const run = async () => {
      const query = Event.query().build();

      // Initial fetch. Event messages can fail on some browsers (Safari/WebKit
      // gRPC quirks); fail silently so the rest of the app keeps working.
      try {
        const result = await client.getEventMessages(query);
        if (!cancelled) handleUpdate(result.items);
      } catch (error) {
        console.error("[useLiveEvents] failed to get event messages:", error);
      }

      const eventKey = JSON.stringify(query.clause);
      if (subscriptionKeyRef.current === eventKey && subscriptionRef.current) {
        return;
      }
      if (subscriptionRef.current) {
        subscriptionRef.current.cancel();
        subscriptionRef.current = null;
      }
      try {
        const sub = await subscribeEvents(client, query.clause, handleUpdate);
        if (cancelled) {
          sub.cancel();
          return;
        }
        subscriptionRef.current = sub;
        subscriptionKeyRef.current = eventKey;
      } catch (error) {
        console.error("[useLiveEvents] failed to subscribe:", error);
      }
    };

    run();

    return () => {
      cancelled = true;
      if (subscriptionRef.current) {
        subscriptionRef.current.cancel();
        subscriptionRef.current = null;
      }
      subscriptionKeyRef.current = undefined;
    };
  }, [client, handleUpdate]);

  return { starteds, claimeds };
}
