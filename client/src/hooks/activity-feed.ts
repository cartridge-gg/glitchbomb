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
const INITIAL_FETCH_LIMIT = 20;
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

async function lookupUsernames(
  addresses: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (addresses.length === 0) return map;
  try {
    const res = await fetch("https://api.cartridge.gg/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addresses }),
    });
    if (!res.ok) {
      for (const a of addresses) map.set(a, shortenAddress(a));
      return map;
    }
    const data = await res.json();
    const results = data?.results ?? data;
    if (Array.isArray(results)) {
      for (const r of results) {
        const addr = r.address ?? r.addresses?.[0];
        const name = r.name ?? r.username ?? shortenAddress(addr ?? "");
        if (addr) map.set(addr, name);
      }
    }
    // Fill any missing
    for (const a of addresses) {
      if (!map.has(a)) map.set(a, shortenAddress(a));
    }
  } catch {
    for (const a of addresses) map.set(a, shortenAddress(a));
  }
  return map;
}

async function lookupUsername(address: string): Promise<string> {
  const map = await lookupUsernames([address]);
  return map.get(address) ?? shortenAddress(address);
}

function shortenAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

async function lookupGameInfo(
  client: torii.ToriiClient,
  gameId: number,
): Promise<{ stake: number; points: number } | null> {
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
      | {
          stake: { value: string };
          points: { value: string };
          over: { value: boolean };
        }
      | undefined;
    if (model) {
      return {
        stake: Number(model.stake.value),
        points: Number(model.points.value),
      };
    }
  }
  return null;
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
  const initialFetchDone = useRef(false);

  const addItem = useCallback((item: ActivityItem) => {
    if (seenRef.current.has(item.id)) return;
    seenRef.current.add(item.id);
    setItems((prev) => [item, ...prev].slice(0, MAX_ITEMS));
  }, []);

  const addItems = useCallback((newItems: ActivityItem[]) => {
    const unseen = newItems.filter((item) => !seenRef.current.has(item.id));
    if (unseen.length === 0) return;
    for (const item of unseen) seenRef.current.add(item.id);
    setItems((prev) => [...unseen, ...prev].slice(0, MAX_ITEMS));
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
    const paddedAccount = addAddressPadding(accountAddress);

    // --- Initial fetch of historical data ---
    const fetchInitialData = async () => {
      if (initialFetchDone.current) return;
      initialFetchDone.current = true;

      try {
        // Fetch recent token balances (game starts)
        const balances = await client.getTokenBalances({
          contract_addresses: [paddedContract],
          account_addresses: [],
          token_ids: [],
          pagination: {
            cursor: undefined,
            direction: "Backward",
            limit: INITIAL_FETCH_LIMIT,
            order_by: [],
          },
        });

        // Build owner map and collect game starts
        const gameStartEntries: {
          gameId: number;
          owner: string;
        }[] = [];

        for (const balance of balances.items) {
          const rawBalance = BigInt(balance.balance || "0");
          if (rawBalance === 0n) continue;
          const tokenId = balance.token_id || "0x0";
          const gameId = Number.parseInt(tokenId, 16);
          if (gameId === 0) continue;

          const ownerAddress = balance.account_address;
          ownerMapRef.current.set(gameId, ownerAddress);

          // Skip own games
          if (BigInt(addAddressPadding(ownerAddress)) === BigInt(paddedAccount))
            continue;

          gameStartEntries.push({ gameId, owner: ownerAddress });
        }

        // Fetch GameOver events (cash outs)
        const gameOverClauses = new ClauseBuilder().keys(
          [GAME_OVER_MODEL],
          [],
          "VariableLen",
        );
        const gameOverQuery = new ToriiQueryBuilder()
          .withClause(gameOverClauses.build())
          .includeHashedKeys()
          .withLimit(INITIAL_FETCH_LIMIT)
          .build();

        const gameOverResult = await client.getEventMessages(gameOverQuery);

        const cashOutEntries: {
          gameId: number;
          moonrocks: number;
          owner: string;
        }[] = [];

        for (const entity of gameOverResult.items) {
          const model = entity.models[GAME_OVER_MODEL] as unknown as
            | RawGameOver
            | undefined;
          if (!model) continue;
          const reason = Number(model.reason.value);
          if (reason !== 1) continue;

          const gameId = Number(model.game_id.value);
          const moonrocks = Number(model.points.value);
          const ownerAddress = ownerMapRef.current.get(gameId);
          if (!ownerAddress) continue;
          if (BigInt(addAddressPadding(ownerAddress)) === BigInt(paddedAccount))
            continue;

          cashOutEntries.push({ gameId, moonrocks, owner: ownerAddress });
        }

        // Batch lookup all usernames
        const allAddresses = [
          ...new Set([
            ...gameStartEntries.map((e) => e.owner),
            ...cashOutEntries.map((e) => e.owner),
          ]),
        ];
        const usernameMap = await lookupUsernames(allAddresses);

        // Batch lookup game info for stakes
        const gameInfoMap = new Map<
          number,
          { stake: number; points: number }
        >();
        await Promise.all(
          gameStartEntries.map(async (entry) => {
            const info = await lookupGameInfo(client, entry.gameId);
            if (info) gameInfoMap.set(entry.gameId, info);
          }),
        );

        // Build activity items
        const historicalItems: ActivityItem[] = [];

        for (const entry of gameStartEntries) {
          const username =
            usernameMap.get(entry.owner) ?? shortenAddress(entry.owner);
          const info = gameInfoMap.get(entry.gameId);
          historicalItems.push({
            id: `start-${entry.gameId}`,
            type: "game_started",
            username,
            stake: info?.stake ?? 1,
            timestamp: 0,
          });
        }

        for (const entry of cashOutEntries) {
          const username =
            usernameMap.get(entry.owner) ?? shortenAddress(entry.owner);
          historicalItems.push({
            id: `cashout-${entry.gameId}`,
            type: "cash_out",
            username,
            moonrocks: entry.moonrocks,
            timestamp: 0,
          });
        }

        if (historicalItems.length > 0) {
          addItems(historicalItems);
        }
      } catch (err) {
        console.warn("[useActivityFeed] initial fetch error:", err);
      }
    };

    fetchInitialData();

    // --- Live subscriptions ---

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
      if (BigInt(addAddressPadding(ownerAddress)) === BigInt(paddedAccount))
        return;

      const itemId = `start-${gameId}`;
      if (seenRef.current.has(itemId)) return;

      try {
        const [username, info] = await Promise.all([
          lookupUsername(ownerAddress),
          lookupGameInfo(client, gameId),
        ]);
        addItem({
          id: itemId,
          type: "game_started",
          username,
          stake: info?.stake ?? 1,
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
        if (BigInt(addAddressPadding(ownerAddress)) === BigInt(paddedAccount))
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
  }, [client, accountAddress, chainId, cancelSubscriptions, addItem, addItems]);

  return items;
}
