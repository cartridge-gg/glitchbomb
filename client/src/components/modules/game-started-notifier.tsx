import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { GameStartedToast } from "@/components/elements/game-started-toast";
import { DEFAULT_CHAIN_ID } from "@/config";
import { useGameStarted } from "@/hooks/game-started";

const TOAST_OPTIONS = {
  duration: 3000,
  unstyled: true,
  className:
    "w-full rounded-xl bg-[#051a02] px-4 py-3 relative overflow-hidden",
} as const;

export function GameStartedNotifier() {
  const chainId = BigInt(DEFAULT_CHAIN_ID);

  // DEBUG: spawn test toasts on mount
  useEffect(() => {
    const debugToasts = [
      { gameId: 1, username: "Clicksave", stake: 1 },
      { gameId: 2, username: "Nasr", stake: 5 },
      { gameId: 3, username: "Bal7hazar", stake: 3 },
    ];
    debugToasts.forEach((info, i) => {
      setTimeout(
        () => {
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
        500 * (i + 1),
      );
    });
  }, []);

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
