import {
  MemberClause,
  OrComposeClause,
  type SubscriptionCallbackArgs,
  ToriiQueryBuilder,
} from "@dojoengine/sdk";
import type * as torii from "@dojoengine/torii-wasm";
import { useAccount, useNetwork } from "@starknet-react/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { addAddressPadding } from "starknet";
import { getCollectionAddress } from "@/config";
import { NAMESPACE } from "@/constants";
import { useEntitiesContext } from "@/contexts";
import { isOfflineMode } from "@/offline/mode";
import { selectPacks, useOfflineStore } from "@/offline/store";
import { Pack, type RawPack } from "@/models";
import { useTokens } from "./tokens";

const ENTITIES_LIMIT = 10_000;

const getPackQuery = (packIds: number[]) => {
  const clauses = OrComposeClause(
    packIds.map((id) =>
      MemberClause(
        `${NAMESPACE}-${Pack.getModelName()}`,
        "id",
        "Eq",
        `0x${id.toString(16).padStart(16, "0")}`,
      ),
    ),
  );
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys()
    .withLimit(ENTITIES_LIMIT);
};

export function usePacks() {
  const { client } = useEntitiesContext();
  const { address } = useAccount();
  const { chain } = useNetwork();
  const offlineState = useOfflineStore();
  const offline = isOfflineMode();
  const offlinePacks = useMemo(
    () => selectPacks(offlineState),
    [offlineState],
  );
  const [packs, setPacks] = useState<Pack[]>([]);
  const subscriptionRef = useRef<torii.Subscription | null>(null);

  const { tokenBalances: balances } = useTokens({
    accountAddresses: address ? [addAddressPadding(address)] : [],
    contractAddresses: [getCollectionAddress(chain.id)],
    tokenIds: [], // Empty to get all token IDs
    contractType: "ERC721",
  });

  const packIds = useMemo(() => {
    return balances
      .filter((balance) => {
        const balanceValue = BigInt(balance.balance || "0x0");
        return balanceValue > 0n;
      })
      .map((balance) => {
        const tokenId = balance.token_id || "0x0";
        return parseInt(tokenId, 16);
      })
      .filter((id) => id > 0);
  }, [balances]);

  const onUpdate = useCallback(
    (data: SubscriptionCallbackArgs<torii.Entity[], Error>) => {
      if (!data || data.error) return;
      (data.data || [data] || []).forEach((entity) => {
        if (entity.models[`${NAMESPACE}-${Pack.getModelName()}`]) {
          const model = entity.models[
            `${NAMESPACE}-${Pack.getModelName()}`
          ] as unknown as RawPack;
          const newPack = Pack.parse(model);
          setPacks((prev: Pack[]) => {
            const deduped = prev.filter((pack) => pack.id !== newPack.id);
            return [...deduped, newPack];
          });
        }
      });
    },
    [],
  );

  // Refresh function to fetch and subscribe to data
  const refresh = useCallback(async () => {
    if (!client || !packIds.length) return;

    // Cancel existing subscriptions
    subscriptionRef.current = null;

    // Fetch initial data
    const query = getPackQuery(packIds).build();
    await client
      .getEntities(query)
      .then((result) => onUpdate({ data: result.items, error: undefined }));

    // Subscribe to entity and event updates
    client.onEntityUpdated(query.clause, [], onUpdate).then((response) => {
      subscriptionRef.current = response;
    });
  }, [client, packIds, onUpdate]);

  useEffect(() => {
    refresh();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.cancel();
      }
    };
  }, [refresh]);

  return {
    packs: offline ? offlinePacks : packs,
  };
}
