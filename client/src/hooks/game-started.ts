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

const OWNER_RETRY_DELAY = 2000;
const OWNER_MAX_RETRIES = 3;

async function lookupOwner(
  client: torii.ToriiClient,
  gameId: number,
  chainId: bigint,
): Promise<string | null> {
  const collectionAddress = getCollectionAddress(chainId);
  const paddedContract = addAddressPadding(num.toHex64(collectionAddress));
  const gameIdHex = `0x${gameId.toString(16)}`;
  console.log("[useGameStarted] lookupOwner", {
    collectionAddress,
    paddedContract,
    gameIdHex,
  });

  for (let attempt = 0; attempt < OWNER_MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      console.log(`[useGameStarted] retry ${attempt}/${OWNER_MAX_RETRIES}...`);
      await new Promise((r) => setTimeout(r, OWNER_RETRY_DELAY));
    }
    const balances = await client.getTokenBalances({
      contract_addresses: [paddedContract],
      account_addresses: [],
      token_ids: [gameIdHex],
      pagination: {
        cursor: undefined,
        direction: "Backward",
        limit: 10,
        order_by: [],
      },
    });
    console.log("[useGameStarted] token balances:", balances.items);
    const balance = balances.items.find((b) => BigInt(b.balance || "0") > 0n);
    if (balance) return balance.account_address;
  }
  return null;
}

async function lookupUsername(address: string): Promise<string> {
  try {
    const res = await fetch("https://api.cartridge.gg/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addresses: [address] }),
    });
    if (!res.ok) {
      console.warn("[useGameStarted] lookup API returned", res.status);
      return shortenAddress(address);
    }
    const data = await res.json();
    console.log("[useGameStarted] lookup response:", data);
    const results = data?.results ?? data;
    if (Array.isArray(results) && results.length > 0) {
      return results[0].name ?? results[0].username ?? shortenAddress(address);
    }
    return shortenAddress(address);
  } catch (err) {
    console.warn("[useGameStarted] lookup failed:", err);
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
  console.log("[useGameStarted] game entity:", result.items);
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

    console.log("[useGameStarted] subscribing...", { accountAddress });
    const query = getSubscriptionQuery().build();

    const onUpdate = async (
      data: SubscriptionCallbackArgs<torii.Entity[], Error>,
    ) => {
      if (!data || data.error) {
        console.warn("[useGameStarted] subscription error", data?.error);
        return;
      }
      console.log("[useGameStarted] event received:", data);
      const entities = data.data || [data] || [];
      for (const entity of entities) {
        if (!entity.models[EVENT_MODEL]) {
          console.log(
            "[useGameStarted] no matching model in entity, models:",
            Object.keys(entity.models),
          );
          continue;
        }
        const raw = entity.models[EVENT_MODEL] as unknown as RawGameStarted;
        const gameId = Number(raw.game_id.value);
        console.log("[useGameStarted] GameStarted event, gameId:", gameId);
        if (gameId === 0 || seenRef.current.has(gameId)) {
          console.log("[useGameStarted] skipping (zero or seen)");
          continue;
        }
        seenRef.current.add(gameId);

        try {
          const ownerAddress = await lookupOwner(client, gameId, chainId);
          console.log("[useGameStarted] owner:", ownerAddress);
          if (!ownerAddress) {
            console.log("[useGameStarted] no owner found, skipping");
            continue;
          }

          // Skip own games
          if (
            BigInt(addAddressPadding(ownerAddress)) ===
            BigInt(addAddressPadding(accountAddress))
          ) {
            console.log("[useGameStarted] own game, skipping");
            continue;
          }

          const [username, stake] = await Promise.all([
            lookupUsername(ownerAddress),
            lookupStake(client, gameId),
          ]);

          console.log("[useGameStarted] firing toast:", {
            gameId,
            username,
            stake,
          });
          callbackRef.current({ gameId, username, stake });
        } catch (err) {
          console.warn("[useGameStarted] lookup failed", err);
        }
      }
    };

    client
      .onEventMessageUpdated(query.clause, [], onUpdate)
      .then((sub) => {
        console.log("[useGameStarted] subscribed successfully");
        subscriptionRef.current = sub;
      })
      .catch((err) => console.error("[useGameStarted] subscribe error:", err));

    return () => {
      cancelSubscription();
    };
  }, [client, accountAddress, chainId, cancelSubscription]);
}
