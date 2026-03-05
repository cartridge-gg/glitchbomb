import { useNavigate } from "react-router-dom";
import { EyeIcon } from "@/components/icons";

interface GameStartedToastProps {
  gameId: number;
  username: string;
  stake: number;
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
}: GameStartedToastProps) {
  const navigate = useNavigate();
  const stakeColor = getStakeColor(stake);

  return (
    <>
      <div className="flex items-center gap-3 w-full">
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <span className="font-primary text-green-400 text-base truncate">
            {username}
          </span>
          <div className="flex items-center gap-2">
            <span className="font-secondary text-white text-sm tracking-wide">
              is playing a
            </span>
            <span
              className="font-secondary text-sm font-bold tracking-wide"
              style={{ color: stakeColor }}
            >
              {stake}X
            </span>
            <span className="font-secondary text-white text-sm tracking-wide">
              game
            </span>
          </div>
        </div>
        <button
          type="button"
          className="shrink-0 h-11 w-11 flex items-center justify-center rounded-lg border border-green-400/30 bg-green-400/10 hover:bg-green-400/20 transition-colors text-green-400"
          onClick={() => navigate(`/play?game=${gameId}&view=true`)}
          aria-label="Watch game"
        >
          <EyeIcon size="sm" />
        </button>
      </div>
      {/* Bottom gradient bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[3px]"
        style={{
          background:
            "linear-gradient(90deg, #6366F1 0%, #818CF8 50%, #6366F1 100%)",
        }}
      />
    </>
  );
}
