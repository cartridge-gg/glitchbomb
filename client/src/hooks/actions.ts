import { useAccount, useNetwork } from "@starknet-react/core";
import { useCallback } from "react";
import { CallData, uint256 } from "starknet";
import { getGameAddress, getTokenAddress, getVrfAddress } from "@/config";
import {
  isPracticeGame,
  burn as offlineBurn,
  buy as offlineBuy,
  buyAndExit as offlineBuyAndExit,
  cashOutAction as offlineCashOut,
  enter as offlineEnter,
  exit as offlineExit,
  pull as offlinePull,
  refresh as offlineRefresh,
} from "@/offline/store";

export const useActions = () => {
  const { account } = useAccount();
  const { chain } = useNetwork();

  const pull = useCallback(
    async (gameId: number, forcedOrbId?: number) => {
      try {
        if (isPracticeGame(gameId)) return offlinePull(gameId, forcedOrbId);
        if (!account?.address) return false;
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
              gameId: gameId,
            }),
          },
        ]);
        return true;
      } catch (e) {
        console.log({ e });
        return false;
      }
    },
    [account, chain.id],
  );

  const cashOut = useCallback(
    async (gameId: number) => {
      try {
        if (isPracticeGame(gameId)) return offlineCashOut(gameId);
        if (!account?.address) return false;
        const gameAddress = getGameAddress(chain.id);
        await account.execute([
          {
            contractAddress: gameAddress,
            entrypoint: "cash_out",
            calldata: CallData.compile({
              gameId: gameId,
            }),
          },
        ]);
        return true;
      } catch (e) {
        console.log({ e });
        return false;
      }
    },
    [account, chain.id],
  );

  const enter = useCallback(
    async (gameId: number) => {
      try {
        if (isPracticeGame(gameId)) return offlineEnter(gameId);
        if (!account?.address) return false;
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
              gameId: gameId,
            }),
          },
        ]);
        return true;
      } catch (e) {
        console.log({ e });
        return false;
      }
    },
    [account, chain.id],
  );

  const buy = useCallback(
    async (gameId: number, indices: number[]) => {
      try {
        if (isPracticeGame(gameId)) return offlineBuy(gameId, indices);
        if (!account?.address) return false;
        const gameAddress = getGameAddress(chain.id);
        await account.execute([
          {
            contractAddress: gameAddress,
            entrypoint: "buy",
            calldata: CallData.compile({
              gameId: gameId,
              indices: indices,
            }),
          },
        ]);
        return true;
      } catch (e) {
        console.log({ e });
        return false;
      }
    },
    [account, chain.id],
  );

  const exit = useCallback(
    async (gameId: number) => {
      try {
        if (isPracticeGame(gameId)) return offlineExit(gameId);
        if (!account?.address) return false;
        const gameAddress = getGameAddress(chain.id);
        await account.execute([
          {
            contractAddress: gameAddress,
            entrypoint: "exit",
            calldata: CallData.compile({
              gameId: gameId,
            }),
          },
        ]);
        return true;
      } catch (e) {
        console.log({ e });
        return false;
      }
    },
    [account, chain.id],
  );

  const buyAndExit = useCallback(
    async (gameId: number, indices: number[]) => {
      try {
        if (isPracticeGame(gameId)) return offlineBuyAndExit(gameId, indices);
        if (!account?.address) return false;
        const gameAddress = getGameAddress(chain.id);
        const calls = [];

        // Add buy calls if there are items to purchase
        if (indices.length > 0) {
          calls.push({
            contractAddress: gameAddress,
            entrypoint: "buy",
            calldata: CallData.compile({
              gameId: gameId,
              indices: indices,
            }),
          });
        }

        // Always add exit call
        calls.push({
          contractAddress: gameAddress,
          entrypoint: "exit",
          calldata: CallData.compile({
            gameId: gameId,
          }),
        });

        await account.execute(calls);
        return true;
      } catch (e) {
        console.log({ e });
        return false;
      }
    },
    [account, chain.id],
  );

  const refresh = useCallback(
    async (gameId: number) => {
      try {
        if (isPracticeGame(gameId)) return offlineRefresh();
        if (!account?.address) return false;
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
              gameId: gameId,
            }),
          },
        ]);
        return true;
      } catch (e) {
        console.log({ e });
        return false;
      }
    },
    [account, chain.id],
  );

  const burn = useCallback(
    async (gameId: number, bagIndex: number) => {
      try {
        if (isPracticeGame(gameId)) return offlineBurn();
        if (!account?.address) return false;
        const gameAddress = getGameAddress(chain.id);
        await account.execute([
          {
            contractAddress: gameAddress,
            entrypoint: "burn",
            calldata: CallData.compile({
              gameId: gameId,
              bagIndex: bagIndex,
            }),
          },
        ]);
        return true;
      } catch (e) {
        console.log({ e });
        return false;
      }
    },
    [account, chain.id],
  );

  const mint = useCallback(
    async (tokenAddress?: string) => {
      try {
        if (!account?.address) return false;
        const address = tokenAddress || getTokenAddress(chain.id);
        await account.execute([
          {
            contractAddress: address,
            entrypoint: "mint",
            calldata: CallData.compile({
              recipient: account?.address,
              amount: uint256.bnToUint256(1_000n * 10n ** 6n), // 1000 tokens with 6 decimals
            }),
          },
        ]);
        return true;
      } catch (e) {
        console.log({ e });
        return false;
      }
    },
    [account, chain.id],
  );

  return {
    pull,
    cashOut,
    enter,
    buy,
    exit,
    buyAndExit,
    refresh,
    burn,
    mint,
  };
};
