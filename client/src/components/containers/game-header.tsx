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
    <div className="grid grid-cols-[1fr_minmax(0,400px)_1fr] items-center gap-[clamp(4px,1.2svh,8px)] pt-[clamp(8px,2.5svh,16px)] pb-0 px-4">
      {/* Left column - back button aligned left */}
      <div className="flex justify-start">
        <Button
          variant="secondary"
          gradient="green"
          className="h-[clamp(36px,6svh,48px)] w-[clamp(36px,6svh,48px)] p-0"
          onClick={() => navigate("/games")}
        >
          <ArrowLeftIcon size="sm" />
        </Button>
      </div>

      {/* Center column - Moonrocks + Chips (max 420px, shrinks on mobile) */}
      <div className="flex items-stretch gap-2 min-w-0">
        {/* Moonrocks (yellow) with gradient border */}
        <GradientBorder color="yellow" className="flex-1 min-w-0 rounded-full">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 min-h-[clamp(36px,5.5svh,48px)] min-w-0 px-[clamp(10px,2.5svh,16px)] rounded-full transition-all duration-200 hover:brightness-110 bg-[#302A10]"
          >
            <MoonrockIcon className="w-5 h-5 text-yellow-400 shrink-0" />
            <span className="font-secondary text-[clamp(0.65rem,1.6svh,0.875rem)] tracking-widest text-yellow-400 truncate">
              {Math.floor(moonrocks).toLocaleString()}
            </span>
          </button>
        </GradientBorder>
        {/* Chips (orange) with gradient border */}
        <GradientBorder color="orange" className="flex-1 min-w-0 rounded-full">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 min-h-[clamp(36px,5.5svh,48px)] min-w-0 px-[clamp(10px,2.5svh,16px)] rounded-full transition-all duration-200 hover:brightness-110 bg-[#302510]"
          >
            <ChipIcon className="w-5 h-5 text-orange-400 shrink-0" />
            <span className="font-secondary text-[clamp(0.65rem,1.6svh,0.875rem)] tracking-widest text-orange-400 truncate">
              {chips.toLocaleString()}
            </span>
          </button>
        </GradientBorder>
      </div>

      {/* Right column - profile aligned right */}
      <div className="flex justify-end">
        <GradientBorder color="green">
          <Profile
            username={username || "..."}
            className="w-auto px-4 h-[clamp(36px,5.5svh,48px)]"
          />
        </GradientBorder>
      </div>
    </div>
  );
};
