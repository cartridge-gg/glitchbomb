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
          style: {
            background: "#0a0a0a",
            border: "1px solid #22c55e40",
            borderRadius: "0.75rem",
            padding: "0.75rem 1rem",
          },
        },
      );
    },
    [],
  );

  useGameStarted(onGameStarted, chainId);

  return null;
}
