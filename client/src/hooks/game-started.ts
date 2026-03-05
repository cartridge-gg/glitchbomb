import { ClauseBuilder, ToriiQueryBuilder } from "@dojoengine/sdk";
import type * as torii from "@dojoengine/torii-wasm";
import type { TokenBalance } from "@dojoengine/torii-wasm";
import { useAccount } from "@starknet-react/core";
import { useCallback, useEffect, useRef } from "react";
import { addAddressPadding, num } from "starknet";
import { getCollectionAddress } from "@/config";
import { NAMESPACE } from "@/constants";
import { useEntitiesContext } from "@/contexts/use-entities-context";

interface GameStartedInfo {
  gameId: number;
  username: string;
  stake: number;
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

    const collectionAddress = getCollectionAddress(chainId);
    const paddedContract = addAddressPadding(num.toHex64(collectionAddress));

    const onBalanceUpdate = async (balance: TokenBalance) => {
      const rawBalance = BigInt(balance.balance || "0");
      if (rawBalance === 0n) return;

      const tokenId = balance.token_id || "0x0";
      const gameId = Number.parseInt(tokenId, 16);
      if (gameId === 0 || seenRef.current.has(gameId)) return;
      seenRef.current.add(gameId);

      const ownerAddress = balance.account_address;

      // Skip own games
      if (
        BigInt(addAddressPadding(ownerAddress)) ===
        BigInt(addAddressPadding(accountAddress))
      )
        return;

      try {
        const [username, stake] = await Promise.all([
          lookupUsername(ownerAddress),
          lookupStake(client, gameId),
        ]);

        callbackRef.current({ gameId, username, stake });
      } catch (err) {
        console.warn("[useGameStarted] lookup failed", err);
      }
    };

    client
      .onTokenBalanceUpdated(
        [paddedContract],
        [], // all accounts
        [], // all token ids
        onBalanceUpdate,
      )
      .then((sub) => {
        subscriptionRef.current = sub;
      })
      .catch((err) => console.warn("[useGameStarted] subscribe error:", err));

    return () => {
      cancelSubscription();
    };
  }, [client, accountAddress, chainId, cancelSubscription]);
}
