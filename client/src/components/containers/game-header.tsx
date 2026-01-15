import { useNavigate } from "react-router-dom";
import { Profile } from "@/components/elements";
import { ArrowLeftIcon, ChipIcon, MoonrockIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { GradientBorder } from "@/components/ui/gradient-border";

export interface GameHeaderProps {
  moonrocks: number;
  chips: number;
  username?: string;
}

export const GameHeader = ({ moonrocks, chips, username }: GameHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-[1fr_minmax(0,420px)_1fr] items-center gap-2 py-4 px-4">
      {/* Left column - back button aligned left */}
      <div className="flex justify-start">
        <Button
          variant="secondary"
          gradient="green"
          className="h-12 w-12 p-0"
          onClick={() => navigate("/games")}
        >
          <ArrowLeftIcon size="sm" />
        </Button>
      </div>

      {/* Center column - Moonrocks + Chips (max 420px, shrinks on mobile) */}
      <div className="flex items-stretch gap-2 min-w-0">
        {/* Moonrocks (blue) with gradient border */}
        <GradientBorder color="blue" className="flex-1 min-w-0">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 min-h-12 min-w-0 px-3 rounded-lg transition-all duration-200 hover:brightness-110 bg-[#0D2530]"
          >
            <MoonrockIcon className="w-5 h-5 text-blue-400 shrink-0" />
            <span className="font-secondary text-sm tracking-widest text-blue-400 truncate">
              {Math.floor(moonrocks).toLocaleString()}
            </span>
          </button>
        </GradientBorder>
        {/* Chips (orange) with gradient border */}
        <GradientBorder color="orange" className="flex-1 min-w-0">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 min-h-12 min-w-0 px-3 rounded-lg transition-all duration-200 hover:brightness-110 bg-[#302510]"
          >
            <ChipIcon className="w-5 h-5 text-orange-400 shrink-0" />
            <span className="font-secondary text-sm tracking-widest text-orange-400 truncate">
              {chips.toLocaleString()}
            </span>
          </button>
        </GradientBorder>
      </div>

      {/* Right column - profile aligned right */}
      <div className="flex justify-end">
        <GradientBorder color="green">
          <Profile username={username || "..."} className="w-auto px-4" />
        </GradientBorder>
      </div>
    </div>
  );
};
