import { EyeIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { usePreserveSearchNavigate } from "@/lib/router";

interface GameStartedToastProps {
  gameId: number;
  username: string;
  stake: number;
  duration?: number;
}

const stakeColors: Record<number, string> = {
  1: "#60A5FA", // blue
  2: "#A78BFA", // purple
  3: "#F472B6", // pink
  4: "#FB923C", // orange
  5: "#FACC15", // yellow
  6: "#F87171", // red-light
  7: "#EF4444", // red
  8: "#DC2626", // red-dark
  9: "#B91C1C", // red-darker
  10: "#EF4444", // red
};

function getStakeColor(stake: number): string {
  return stakeColors[stake] ?? "#FACC15";
}

export function GameStartedToast({
  gameId,
  username,
  stake,
  duration = 3000,
}: GameStartedToastProps) {
  const stakeColor = getStakeColor(stake);
  const navigate = usePreserveSearchNavigate();

  return (
    <>
      <div className="flex items-center gap-2 w-full">
        <div className="flex-1 min-w-0 flex flex-col">
          <span className="font-primary text-green-400 text-xs truncate">
            {username}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="font-secondary text-white text-xs tracking-wide">
              is playing a
            </span>
            <span
              className="font-secondary text-xs font-bold tracking-wide"
              style={{ color: stakeColor }}
            >
              {stake}X
            </span>
            <span className="font-secondary text-white text-xs tracking-wide">
              game
            </span>
          </div>
        </div>
        <Button
          variant="secondary"
          gradient="green"
          className="shrink-0 h-9 w-9 p-0"
          onClick={() => {
            navigate(`/game/${gameId}`);
          }}
          aria-label="Watch game"
        >
          <EyeIcon size="xs" />
        </Button>
      </div>
      {/* Progress bar */}
      <div
        className="absolute bottom-0 left-0 h-[3px]"
        style={{
          background:
            "linear-gradient(90deg, #6366F1 0%, #818CF8 50%, #6366F1 100%)",
          animation: `toast-progress ${duration}ms linear forwards`,
        }}
      />
      <style>
        {`@keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }`}
      </style>
    </>
  );
}
