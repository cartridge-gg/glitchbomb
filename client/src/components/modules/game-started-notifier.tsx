import { useCallback } from "react";
import { toast } from "sonner";
import { GameStartedToast } from "@/components/elements/game-started-toast";
import { DEFAULT_CHAIN_ID } from "@/config";
import { useGameStarted } from "@/hooks/game-started";

const TOAST_OPTIONS = {
  duration: 3000,
  unstyled: true,
  className:
    "w-full rounded-lg bg-[#051a02] px-3 py-2 relative overflow-hidden",
} as const;

export function GameStartedNotifier() {
  const chainId = BigInt(DEFAULT_CHAIN_ID);

  const onGameStarted = useCallback(
    (info: { gameId: number; username: string; stake: number }) => {
      toast.custom(
        () => (
          <GameStartedToast
            gameId={info.gameId}
            username={info.username}
            stake={info.stake}
          />
        ),
        TOAST_OPTIONS,
      );
    },
    [],
  );

  useGameStarted(onGameStarted, chainId);

  return null;
}
