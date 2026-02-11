import { useNavigate } from "react-router-dom";
import { Profile } from "@/components/elements";
import { ArrowLeftIcon, ChipIcon, MoonrockIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { GradientBorder } from "@/components/ui/gradient-border";

export interface GameHeaderProps {
  moonrocks: number;
  potentialMoonrocks?: number;
  chips: number;
  username?: string;
}

export const GameHeader = ({
  moonrocks,
  potentialMoonrocks,
  chips,
  username,
}: GameHeaderProps) => {
  const navigate = useNavigate();
  const displayedMoonrocks = Math.floor(
    potentialMoonrocks ?? moonrocks,
  ).toLocaleString();

  return (
    <div className="grid grid-cols-[1fr_minmax(0,400px)_1fr] items-center gap-[clamp(6px,2svh,16px)] pt-[clamp(8px,2.5svh,16px)] pb-0 px-4">
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
        {/* Moonrocks (yellow) */}
        <div className="flex-1 min-w-0">
          <div className="w-full flex items-center justify-center gap-2 min-h-[clamp(32px,4.8svh,42px)] min-w-0 px-[clamp(10px,2.5svh,16px)] rounded-full bg-[#302A10]">
            <MoonrockIcon className="w-5 h-5 text-yellow-400 shrink-0" />
            <span className="font-secondary text-[clamp(0.65rem,1.6svh,0.875rem)] tracking-widest text-yellow-400 truncate">
              {displayedMoonrocks}
            </span>
          </div>
        </div>
        {/* Chips (orange) */}
        <div className="flex-1 min-w-0">
          <div className="w-full flex items-center justify-center gap-2 min-h-[clamp(32px,4.8svh,42px)] min-w-0 px-[clamp(10px,2.5svh,16px)] rounded-full bg-[#302510]">
            <ChipIcon className="w-5 h-5 text-orange-400 shrink-0" />
            <span className="font-secondary text-[clamp(0.65rem,1.6svh,0.875rem)] tracking-widest text-orange-400 truncate">
              {chips.toLocaleString()}
            </span>
          </div>
        </div>
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
