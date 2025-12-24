import type { GetTokenBalanceRequest, GetTokenRequest } from "@dojoengine/sdk";
import type {
  ContractType,
  Subscription,
  TokenBalance,
  TokenContract,
} from "@dojoengine/torii-wasm";
import { useAccount, useNetwork } from "@starknet-react/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { addAddressPadding, num } from "starknet";
import { getTokenAddress } from "@/config";
import { useEntitiesContext } from "@/contexts";
import { equal } from "@/helpers";

const CONTRACT_LIMIT = 1_000;
const BALANCE_LIMIT = 1_000;

function toDecimal(
  token: TokenContract,
  balance: TokenBalance | undefined,
): bigint {
  return BigInt(balance?.balance ?? "0") / 10n ** BigInt(token.decimals);
}

export function useTokenContracts(
  request: GetTokenRequest & { contractType?: ContractType },
) {
  const { client } = useEntitiesContext();
  const [contracts, setContracts] = useState<TokenContract[]>([]);
  const requestRef = useRef<
    (GetTokenRequest & { contractType?: ContractType }) | null
  >(null);

  const fetchTokens = useCallback(async () => {
    if (!client) return;
    const contractType = request.contractType || "ERC20";
    const contractAddresses =
      request.contractAddresses?.map((i: string) => addAddressPadding(i)) || [];
    const tokens = await client.getTokenContracts({
      contract_addresses: contractAddresses,
      contract_types: [contractType],
      pagination: {
        cursor: undefined,
        direction: "Backward",
        limit: CONTRACT_LIMIT,
        order_by: [],
      },
    });
    setContracts(tokens.items);
  }, [client, request]);

  const refetch = useCallback(async () => {
    fetchTokens();
  }, [fetchTokens]);

  useEffect(() => {
    if ((request.contractAddresses || []).length === 0) return;
    if (!equal(request, requestRef.current)) {
      requestRef.current = request;
      refetch();
    }
  }, [request, refetch]);

  return {
    contracts,
    refetch,
  };
}

export function useTokens(
  request: GetTokenRequest &
    GetTokenBalanceRequest & { contractType?: ContractType },
) {
  const { account } = useAccount();
  const { chain } = useNetwork();
  const { client } = useEntitiesContext();
  const [balance, setBalance] = useState<number>(0);
  const requestRef = useRef<(GetTokenRequest & GetTokenBalanceRequest) | null>(
    null,
  );
  const subscriptionRef = useRef<Subscription | null>(null);

  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.cancel();
      }
    };
  }, []);

  const { contracts } = useTokenContracts(request);

  const fetchBalances = useCallback(async () => {
    if (!requestRef.current || !client || !contracts.length || !account) return;
    const tokenAddress = getTokenAddress(chain.id);
    const tokenContract = contracts.find(
      (c) => BigInt(c.contract_address) === BigInt(tokenAddress),
    );
    const contractAddresses =
      request.contractAddresses?.map((i: string) =>
        addAddressPadding(num.toHex64(i)),
      ) || [];
    const accountAddresses =
      request.accountAddresses?.map((i: string) =>
        addAddressPadding(num.toHex64(i)),
      ) || [];
    if (!tokenContract) return;
    // Fetch initial balance
    const balances = await client.getTokenBalances({
      contract_addresses: contractAddresses,
      account_addresses: accountAddresses,
      token_ids: [],
      pagination: {
        cursor: undefined,
        direction: "Backward",
        limit: BALANCE_LIMIT,
        order_by: [],
      },
    });
    // Subscribe to balance updates
    const subscription = await client.onTokenBalanceUpdated(
      contractAddresses,
      accountAddresses,
      [],
      async (data: TokenBalance) => {
        setBalance(Number(toDecimal(tokenContract, data)));
      },
    );

    if (subscriptionRef.current) {
      subscriptionRef.current.cancel();
    }
    subscriptionRef.current = subscription;
    const tokenBalance = balances.items.find(
      (b) => BigInt(b.contract_address) === BigInt(tokenAddress),
    );
    setBalance(Number(toDecimal(tokenContract, tokenBalance)));
  }, [
    client,
    contracts,
    chain.id,
    account,
    request.contractAddresses,
    request.accountAddresses,
  ]);

  useEffect(() => {
    if (
      (request?.accountAddresses || []).length === 0 ||
      (contracts || []).length === 0
    )
      return;
    if (!equal(request, requestRef.current)) {
      requestRef.current = request;
      fetchBalances();
    }
  }, [contracts, fetchBalances, request]);

  const refetch = useCallback(async () => {
    fetchBalances();
  }, [fetchBalances]);

  return {
    balance,
    refetch,
  };
}
