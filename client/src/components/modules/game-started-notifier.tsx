import { useCallback } from "react";
import { toast } from "sonner";
import { GameStartedToast } from "@/components/elements/game-started-toast";
import { DEFAULT_CHAIN_ID } from "@/config";
import { useGameStarted } from "@/hooks/game-started";

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
        {
          duration: 5000,
          unstyled: true,
          className:
            "w-full rounded-xl bg-[#051a02] px-4 py-3 relative overflow-hidden",
        },
      );
    },
    [],
  );

  useGameStarted(onGameStarted, chainId);

  return null;
}
