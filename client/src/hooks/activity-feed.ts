import {
  ClauseBuilder,
  type SubscriptionCallbackArgs,
  ToriiQueryBuilder,
} from "@dojoengine/sdk";
import type * as torii from "@dojoengine/torii-wasm";
import type { TokenBalance } from "@dojoengine/torii-wasm";
import { useAccount } from "@starknet-react/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { addAddressPadding, num } from "starknet";
import { getCollectionAddress } from "@/config";
import { NAMESPACE } from "@/constants";
import { useEntitiesContext } from "@/contexts/use-entities-context";

const MAX_ITEMS = 20;
const GAME_OVER_MODEL: `${string}-${string}` = `${NAMESPACE}-GameOver`;
const GAME_MODEL: `${string}-${string}` = `${NAMESPACE}-Game`;

export type ActivityType = "game_started" | "cash_out";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  username: string;
  stake?: number;
  moonrocks?: number;
  timestamp: number;
}

async function lookupUsername(address: string): Promise<string> {
  try {
    const res = await fetch("https://api.cartridge.gg/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addresses: [address] }),
    });
    if (!res.ok) return shortenAddress(address);
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
  const clauses = new ClauseBuilder().keys(
    [GAME_MODEL],
    [`0x${gameId.toString(16).padStart(16, "0")}`],
    "FixedLen",
  );
  const query = new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys()
    .build();
  const result = await client.getEntities(query);
  for (const entity of result.items) {
    const model = entity.models[GAME_MODEL] as
      | { stake: { value: string }; points: { value: string } }
      | undefined;
    if (model) {
      return Number(model.stake.value);
    }
  }
  return 1;
}

interface RawGameOver {
  game_id: { value: string };
  reason: { value: string };
  points: { value: string };
}

export function useActivityFeed(chainId: bigint) {
  const { client } = useEntitiesContext();
  const { address: accountAddress } = useAccount();
  const [items, setItems] = useState<ActivityItem[]>([]);
  const balanceSubRef = useRef<torii.Subscription | null>(null);
  const eventSubRef = useRef<torii.Subscription | null>(null);
  const seenRef = useRef<Set<string>>(new Set());
  const ownerMapRef = useRef<Map<number, string>>(new Map());

  const addItem = useCallback((item: ActivityItem) => {
    if (seenRef.current.has(item.id)) return;
    seenRef.current.add(item.id);
    setItems((prev) => [item, ...prev].slice(0, MAX_ITEMS));
  }, []);

  const cancelSubscriptions = useCallback(() => {
    for (const ref of [balanceSubRef, eventSubRef]) {
      if (ref.current) {
        try {
          ref.current.cancel();
        } catch {
          // ignore
        }
        ref.current = null;
      }
    }
  }, []);

  useEffect(() => {
    if (!client || !accountAddress) return;

    const collectionAddress = getCollectionAddress(chainId);
    const paddedContract = addAddressPadding(num.toHex64(collectionAddress));

    // 1. Subscribe to token balance updates (game starts)
    const onBalanceUpdate = async (balance: TokenBalance) => {
      const rawBalance = BigInt(balance.balance || "0");
      if (rawBalance === 0n) return;

      const tokenId = balance.token_id || "0x0";
      const gameId = Number.parseInt(tokenId, 16);
      if (gameId === 0) return;

      const ownerAddress = balance.account_address;
      ownerMapRef.current.set(gameId, ownerAddress);

      // Skip own games
      if (
        BigInt(addAddressPadding(ownerAddress)) ===
        BigInt(addAddressPadding(accountAddress))
      )
        return;

      const itemId = `start-${gameId}`;
      if (seenRef.current.has(itemId)) return;

      try {
        const [username, stake] = await Promise.all([
          lookupUsername(ownerAddress),
          lookupStake(client, gameId),
        ]);
        addItem({
          id: itemId,
          type: "game_started",
          username,
          stake,
          timestamp: Date.now(),
        });
      } catch {
        // ignore lookup failures
      }
    };

    client
      .onTokenBalanceUpdated([paddedContract], [], [], onBalanceUpdate)
      .then((sub) => {
        balanceSubRef.current = sub;
      })
      .catch((err) =>
        console.warn("[useActivityFeed] balance sub error:", err),
      );

    // 2. Subscribe to GameOver events (cash outs)
    const clauses = new ClauseBuilder().keys(
      [GAME_OVER_MODEL],
      [],
      "VariableLen",
    );
    const query = new ToriiQueryBuilder()
      .withClause(clauses.build())
      .includeHashedKeys()
      .build();

    const onGameOver = async (
      data: SubscriptionCallbackArgs<torii.Entity[], Error>,
    ) => {
      if (!data || data.error) return;
      const entities = data.data || [];
      for (const entity of entities) {
        const model = entity.models[GAME_OVER_MODEL] as unknown as
          | RawGameOver
          | undefined;
        if (!model) continue;

        const reason = Number(model.reason.value);
        if (reason !== 1) continue; // Only cash_out

        const gameId = Number(model.game_id.value);
        const moonrocks = Number(model.points.value);
        const itemId = `cashout-${gameId}`;
        if (seenRef.current.has(itemId)) continue;

        const ownerAddress = ownerMapRef.current.get(gameId);
        if (!ownerAddress) continue;

        // Skip own games
        if (
          BigInt(addAddressPadding(ownerAddress)) ===
          BigInt(addAddressPadding(accountAddress))
        )
          continue;

        try {
          const username = await lookupUsername(ownerAddress);
          addItem({
            id: itemId,
            type: "cash_out",
            username,
            moonrocks,
            timestamp: Date.now(),
          });
        } catch {
          // ignore lookup failures
        }
      }
    };

    client
      .onEventMessageUpdated(query.clause, [], onGameOver)
      .then((sub) => {
        eventSubRef.current = sub;
      })
      .catch((err) => console.warn("[useActivityFeed] event sub error:", err));

    return () => cancelSubscriptions();
  }, [client, accountAddress, chainId, cancelSubscriptions, addItem]);

  return items;
}
