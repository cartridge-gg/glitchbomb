import { useAccount, useNetwork } from "@starknet-react/core";
import { useMemo } from "react";
import { addAddressPadding, num } from "starknet";
import { getCollectionAddress } from "@/config";
import { useTokens } from "@/hooks/tokens";

/**
 * Hook to derive the connected player's owned game IDs from the ERC721
 * collection token balances. Wraps `useTokens` so the underlying balance
 * subscription is shared and gameIds are recomputed reactively when balances
 * change (mint, transfer, burn).
 *
 * Mirrors the pattern in `nums/client/src/hooks/assets.ts`.
 */
export function useAssets() {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const collectionAddress = getCollectionAddress(chain.id);

  const { tokenBalances, isLoading } = useTokens({
    accountAddresses: address ? [addAddressPadding(address)] : [],
    contractAddresses: [addAddressPadding(num.toHex64(collectionAddress))],
    tokenIds: [],
    contractType: "ERC721",
  });

  const gameIds = useMemo(() => {
    return tokenBalances
      .filter((balance) => BigInt(balance.balance || "0x0") > 0n)
      .map((balance) => parseInt(balance.token_id || "0x0", 16))
      .filter((id) => id > 0);
  }, [tokenBalances]);

  return {
    gameIds,
    isLoading,
  };
}
