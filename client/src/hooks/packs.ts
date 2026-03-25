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
import { useEntitiesContext } from "@/contexts/use-entities-context";
import { Game, type RawGame } from "@/models";
import { useTokens } from "./tokens";

const ENTITIES_LIMIT = 10_000;

const getOwnedGamesQuery = (gameIds: number[]) => {
  const clauses = OrComposeClause(
    gameIds.map((id) =>
      MemberClause(
        `${NAMESPACE}-${Game.getModelName()}`,
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

export function useOwnedGames() {
  const { client } = useEntitiesContext();
  const { address } = useAccount();
  const { chain } = useNetwork();
  const [games, setGames] = useState<Game[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const subscriptionRef = useRef<torii.Subscription | null>(null);
  const cancelSubscription = useCallback(() => {
    if (!subscriptionRef.current) return;
    try {
      subscriptionRef.current.cancel();
    } catch (error) {
      console.warn("[useOwnedGames] cancel failed", error);
    } finally {
      subscriptionRef.current = null;
    }
  }, []);

  const { tokenBalances: balances, isLoading: tokensLoading } = useTokens({
    accountAddresses: address ? [addAddressPadding(address)] : [],
    contractAddresses: [getCollectionAddress(chain.id)],
    tokenIds: [], // Empty to get all token IDs
    contractType: "ERC721",
  });

  const gameIds = useMemo(() => {
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
        if (entity.models[`${NAMESPACE}-${Game.getModelName()}`]) {
          const model = entity.models[
            `${NAMESPACE}-${Game.getModelName()}`
          ] as unknown as RawGame;
          const newGame = Game.parse(model);
          setGames((prev: Game[]) => {
            const deduped = prev.filter((game) => game.id !== newGame.id);
            return [...deduped, newGame];
          });
        }
      });
    },
    [],
  );

  // Refresh function to fetch and subscribe to data
  const refresh = useCallback(async () => {
    if (!client || !gameIds.length) {
      setIsFetching(false);
      return;
    }

    // Cancel existing subscriptions
    cancelSubscription();

    // Fetch initial data
    setIsFetching(true);
    const query = getOwnedGamesQuery(gameIds).build();
    await client
      .getEntities(query)
      .then((result) => onUpdate({ data: result.items, error: undefined }));

    setIsFetching(false);

    // Subscribe to entity and event updates
    client.onEntityUpdated(query.clause, [], onUpdate).then((response) => {
      subscriptionRef.current = response;
    });
  }, [client, gameIds, onUpdate, cancelSubscription]);

  useEffect(() => {
    refresh();

    return () => {
      cancelSubscription();
    };
  }, [refresh, cancelSubscription]);

  const isLoading = tokensLoading || isFetching;

  return {
    games,
    isLoading,
    refresh,
  };
}
