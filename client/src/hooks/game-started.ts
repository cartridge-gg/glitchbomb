import {
  ClauseBuilder,
  type SubscriptionCallbackArgs,
  ToriiQueryBuilder,
} from "@dojoengine/sdk";
import type * as torii from "@dojoengine/torii-wasm";
import { useAccount } from "@starknet-react/core";
import { useCallback, useEffect, useRef } from "react";
import { addAddressPadding, num } from "starknet";
import { getCollectionAddress } from "@/config";
import { NAMESPACE } from "@/constants";
import { useEntitiesContext } from "@/contexts/use-entities-context";

const EVENT_MODEL = `${NAMESPACE}-GameStarted`;

interface GameStartedInfo {
  gameId: number;
  username: string;
  stake: number;
}

interface RawGameStarted {
  game_id: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
  level: {
    type: "primitive";
    type_name: "u8";
    value: string;
    key: boolean;
  };
  health: {
    type: "primitive";
    type_name: "u8";
    value: string;
    key: boolean;
  };
  milestone: {
    type: "primitive";
    type_name: "u16";
    value: string;
    key: boolean;
  };
}

const getSubscriptionQuery = () => {
  const clauses = new ClauseBuilder().keys(
    [EVENT_MODEL],
    [undefined],
    "VariableLen",
  );
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys();
};

async function lookupOwner(
  client: torii.ToriiClient,
  gameId: number,
  chainId: bigint,
): Promise<string | null> {
  const collectionAddress = getCollectionAddress(chainId);
  const gameIdHex = `0x${gameId.toString(16)}`;
  const balances = await client.getTokenBalances({
    contract_addresses: [addAddressPadding(num.toHex64(collectionAddress))],
    account_addresses: [],
    token_ids: [gameIdHex],
    pagination: {
      cursor: undefined,
      direction: "Backward",
      limit: 1,
      order_by: [],
    },
  });
  const balance = balances.items.find((b) => BigInt(b.balance || "0") > 0n);
  return balance ? balance.account_address : null;
}

async function lookupUsername(address: string): Promise<string> {
  try {
    const res = await fetch("https://api.cartridge.gg/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addresses: [address] }),
    });
    const data = await res.json();
    const results = data?.results ?? data;
    if (Array.isArray(results) && results.length > 0) {
      return results[0].name ?? results[0].username ?? shortenAddress(address);
    }
    return shortenAddress(address);
  } catch {
    return shortenAddress(address);
  }
}

function shortenAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

async function lookupStake(
  client: torii.ToriiClient,
  gameId: number,
): Promise<number> {
  const gameModel: `${string}-${string}` = `${NAMESPACE}-Game`;
  const clauses = new ClauseBuilder().keys(
    [gameModel],
    [`0x${gameId.toString(16).padStart(16, "0")}`],
    "FixedLen",
  );
  const query = new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys()
    .build();
  const result = await client.getEntities(query);
  for (const entity of result.items) {
    const model = entity.models[gameModel] as
      | { stake: { value: string } }
      | undefined;
    if (model) {
      return Number(model.stake.value);
    }
  }
  return 1;
}

export function useGameStarted(
  onGameStarted: (info: GameStartedInfo) => void,
  chainId: bigint,
) {
  const { client } = useEntitiesContext();
  const { address: accountAddress } = useAccount();
  const subscriptionRef = useRef<torii.Subscription | null>(null);
  const seenRef = useRef<Set<number>>(new Set());
  const callbackRef = useRef(onGameStarted);
  callbackRef.current = onGameStarted;

  const cancelSubscription = useCallback(() => {
    if (!subscriptionRef.current) return;
    try {
      subscriptionRef.current.cancel();
    } catch (error) {
      console.warn("[useGameStarted] cancel failed", error);
    } finally {
      subscriptionRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!client || !accountAddress) return;

    const query = getSubscriptionQuery().build();

    const onUpdate = async (
      data: SubscriptionCallbackArgs<torii.Entity[], Error>,
    ) => {
      if (!data || data.error) return;
      for (const entity of data.data || [data] || []) {
        if (!entity.models[EVENT_MODEL]) continue;
        const raw = entity.models[EVENT_MODEL] as unknown as RawGameStarted;
        const gameId = Number(raw.game_id.value);
        if (gameId === 0 || seenRef.current.has(gameId)) continue;
        seenRef.current.add(gameId);

        try {
          const ownerAddress = await lookupOwner(client, gameId, chainId);
          if (!ownerAddress) continue;

          // Skip own games
          if (
            BigInt(addAddressPadding(ownerAddress)) ===
            BigInt(addAddressPadding(accountAddress))
          )
            continue;

          const [username, stake] = await Promise.all([
            lookupUsername(ownerAddress),
            lookupStake(client, gameId),
          ]);

          callbackRef.current({ gameId, username, stake });
        } catch (err) {
          console.warn("[useGameStarted] lookup failed", err);
        }
      }
    };

    client
      .onEventMessageUpdated(query.clause, [], onUpdate)
      .then((sub) => {
        subscriptionRef.current = sub;
      })
      .catch((err) => console.error("[useGameStarted] subscribe error:", err));

    return () => {
      cancelSubscription();
    };
  }, [client, accountAddress, chainId, cancelSubscription]);
}
