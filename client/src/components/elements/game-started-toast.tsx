import { useNavigate } from "react-router-dom";
import { EyeIcon } from "@/components/icons";

interface GameStartedToastProps {
  gameId: number;
  username: string;
  stake: number;
}

export function GameStartedToast({
  gameId,
  username,
  stake,
}: GameStartedToastProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-3 w-full">
      <div className="flex-1 min-w-0 flex items-center gap-1.5 flex-wrap">
        <span className="font-primary text-green-400 text-sm truncate">
          {username}
        </span>
        <span className="font-secondary text-white/60 text-xs tracking-wide">
          is playing a
        </span>
        <span className="inline-flex items-center gap-0.5 bg-yellow-400/20 text-yellow-400 rounded-full px-2 py-0.5 text-xs font-bold font-secondary">
          <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" fill="currentColor">
            <path d="M5 2L8 7H2L5 2Z" />
          </svg>
          {stake}X
        </span>
        <span className="font-secondary text-white/60 text-xs tracking-wide">
          game
        </span>
      </div>
      <button
        type="button"
        className="shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-green-400"
        onClick={() => navigate(`/play?game=${gameId}&view=true`)}
        aria-label="Watch game"
      >
        <EyeIcon size="sm" />
      </button>
    </div>
  );
}
