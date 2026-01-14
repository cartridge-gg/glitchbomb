import { useNavigate } from "react-router-dom";
import { Profile } from "@/components/elements";
import { ArrowLeftIcon, ChipIcon, MoonrockIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

export interface GameHeaderProps {
  moonrocks: number;
  chips: number;
  username?: string;
}

export const GameHeader = ({ moonrocks, chips, username }: GameHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="relative flex items-center justify-between py-4 px-4">
      {/* Back button (full left) */}
      <Button
        variant="secondary"
        className="h-12 w-12 p-0 z-10"
        onClick={() => navigate("/games")}
      >
        <ArrowLeftIcon size="sm" />
      </Button>

      {/* Center: Moonrocks + Chips - matching game container width */}
      <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-[420px] px-4">
        <div className="flex items-stretch gap-3">
          {/* Moonrocks (blue) */}
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-2 min-h-12 rounded-lg transition-all duration-200 hover:brightness-110 bg-[#0D2530]"
          >
            <MoonrockIcon className="w-5 h-5 text-blue-400" />
            <span className="font-secondary text-sm tracking-widest text-blue-400">
              {Math.floor(moonrocks).toLocaleString()}
            </span>
          </button>
          {/* Chips (orange) */}
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-2 min-h-12 rounded-lg transition-all duration-200 hover:brightness-110 bg-[#302510]"
          >
            <ChipIcon className="w-5 h-5 text-orange-400" />
            <span className="font-secondary text-sm tracking-widest text-orange-400">
              {chips.toLocaleString()}
            </span>
          </button>
        </div>
      </div>

      {/* Profile (full right) */}
      <Profile username={username || "..."} className="w-auto px-4 z-10" />
    </div>
  );
};
