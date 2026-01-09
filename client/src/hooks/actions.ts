import { useAccount, useNetwork } from "@starknet-react/core";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { CallData, uint256 } from "starknet";
import { getGameAddress, getTokenAddress, getVrfAddress } from "@/config";

// Helper to extract error message from various error formats
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    // Check for common Starknet error patterns
    const message = error.message;
    if (message.includes("User abort")) return "Transaction cancelled";
    if (message.includes("insufficient funds"))
      return "Insufficient funds for transaction";
    if (message.includes("rejected")) return "Transaction rejected";
    return message;
  }
  return "An unexpected error occurred";
};

export const useActions = () => {
  const { account } = useAccount();
  const { chain } = useNetwork();
  const [isLoading, setIsLoading] = useState(false);

  const start = useCallback(
    async (packId: number) => {
      if (isLoading) return false;
      try {
        if (!account?.address) return false;
        setIsLoading(true);
        const gameAddress = getGameAddress(chain.id);
        await account.execute([
          {
            contractAddress: gameAddress,
            entrypoint: "start",
            calldata: CallData.compile({
              packId: packId,
            }),
          },
        ]);
        toast.success("Game started!");
        return true;
      } catch (e) {
        toast.error(getErrorMessage(e));
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [account, chain.id, isLoading],
  );

  const pull = useCallback(
    async (packId: number, gameId: number) => {
      if (isLoading) return false;
      try {
        if (!account?.address) return false;
        setIsLoading(true);
        const vrfAddress = getVrfAddress(chain.id);
        const gameAddress = getGameAddress(chain.id);
        await account.execute([
          {
            contractAddress: vrfAddress,
            entrypoint: "request_random",
            calldata: CallData.compile({
              caller: gameAddress,
              source: { type: 0, address: gameAddress },
            }),
          },
          {
            contractAddress: gameAddress,
            entrypoint: "pull",
            calldata: CallData.compile({
              packId: packId,
              gameId: gameId,
            }),
          },
        ]);
        return true;
      } catch (e) {
        toast.error(getErrorMessage(e));
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [account, chain.id, isLoading],
  );

  const cashOut = useCallback(
    async (packId: number, gameId: number) => {
      if (isLoading) return false;
      try {
        if (!account?.address) return false;
        setIsLoading(true);
        const gameAddress = getGameAddress(chain.id);
        await account.execute([
          {
            contractAddress: gameAddress,
            entrypoint: "cash_out",
            calldata: CallData.compile({
              packId: packId,
              gameId: gameId,
            }),
          },
        ]);
        toast.success("Cashed out successfully!");
        return true;
      } catch (e) {
        toast.error(getErrorMessage(e));
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [account, chain.id, isLoading],
  );

  const enter = useCallback(
    async (packId: number, gameId: number) => {
      if (isLoading) return false;
      try {
        if (!account?.address) return false;
        setIsLoading(true);
        const vrfAddress = getVrfAddress(chain.id);
        const gameAddress = getGameAddress(chain.id);
        await account.execute([
          {
            contractAddress: vrfAddress,
            entrypoint: "request_random",
            calldata: CallData.compile({
              caller: gameAddress,
              source: { type: 0, address: gameAddress },
            }),
          },
          {
            contractAddress: gameAddress,
            entrypoint: "enter",
            calldata: CallData.compile({
              packId: packId,
              gameId: gameId,
            }),
          },
        ]);
        toast.success("Entered the shop!");
        return true;
      } catch (e) {
        toast.error(getErrorMessage(e));
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [account, chain.id, isLoading],
  );

  const buy = useCallback(
    async (packId: number, gameId: number, indices: number[]) => {
      if (isLoading) return false;
      try {
        if (!account?.address) return false;
        setIsLoading(true);
        const gameAddress = getGameAddress(chain.id);
        await account.execute([
          {
            contractAddress: gameAddress,
            entrypoint: "buy",
            calldata: CallData.compile({
              packId: packId,
              gameId: gameId,
              indices: indices,
            }),
          },
        ]);
        toast.success(
          `Purchased ${indices.length} orb${indices.length > 1 ? "s" : ""}!`,
        );
        return true;
      } catch (e) {
        toast.error(getErrorMessage(e));
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [account, chain.id, isLoading],
  );

  const exit = useCallback(
    async (packId: number, gameId: number) => {
      if (isLoading) return false;
      try {
        if (!account?.address) return false;
        setIsLoading(true);
        const gameAddress = getGameAddress(chain.id);
        await account.execute([
          {
            contractAddress: gameAddress,
            entrypoint: "exit",
            calldata: CallData.compile({
              packId: packId,
              gameId: gameId,
            }),
          },
        ]);
        return true;
      } catch (e) {
        toast.error(getErrorMessage(e));
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [account, chain.id, isLoading],
  );

  const refresh = useCallback(
    async (packId: number, gameId: number) => {
      if (isLoading) return false;
      try {
        if (!account?.address) return false;
        setIsLoading(true);
        const vrfAddress = getVrfAddress(chain.id);
        const gameAddress = getGameAddress(chain.id);
        await account.execute([
          {
            contractAddress: vrfAddress,
            entrypoint: "request_random",
            calldata: CallData.compile({
              caller: gameAddress,
              source: { type: 0, address: gameAddress },
            }),
          },
          {
            contractAddress: gameAddress,
            entrypoint: "refresh",
            calldata: CallData.compile({
              packId: packId,
              gameId: gameId,
            }),
          },
        ]);
        toast.success("Shop refreshed!");
        return true;
      } catch (e) {
        toast.error(getErrorMessage(e));
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [account, chain.id, isLoading],
  );

  const burn = useCallback(
    async (packId: number, gameId: number, bagIndex: number) => {
      if (isLoading) return false;
      try {
        if (!account?.address) return false;
        setIsLoading(true);
        const gameAddress = getGameAddress(chain.id);
        await account.execute([
          {
            contractAddress: gameAddress,
            entrypoint: "burn",
            calldata: CallData.compile({
              packId: packId,
              gameId: gameId,
              bagIndex: bagIndex,
            }),
          },
        ]);
        toast.success("Orb burned!");
        return true;
      } catch (e) {
        toast.error(getErrorMessage(e));
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [account, chain.id, isLoading],
  );

  const mint = useCallback(
    async (tokenAddress?: string) => {
      if (isLoading) return false;
      try {
        if (!account?.address) return false;
        setIsLoading(true);
        const address = tokenAddress || getTokenAddress(chain.id);
        await account.execute([
          {
            contractAddress: address,
            entrypoint: "mint",
            calldata: CallData.compile({
              recipient: account?.address,
              amount: uint256.bnToUint256(1_000n * 10n ** 18n), // 1000 tokens with 18 decimals
            }),
          },
        ]);
        toast.success("Minted 1,000 tokens!");
        return true;
      } catch (e) {
        toast.error(getErrorMessage(e));
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [account, chain.id, isLoading],
  );

  return {
    isLoading,
    start,
    pull,
    cashOut,
    enter,
    buy,
    exit,
    refresh,
    burn,
    mint,
  };
};
