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
    <div className="absolute top-0 left-0 right-0 py-4 px-4">
      {/* Back button (left) */}
      <Button
        variant="secondary"
        className="h-12 w-12 p-0 absolute left-4 top-4"
        onClick={() => navigate("/games")}
      >
        <ArrowLeftIcon size="sm" />
      </Button>

      {/* Center: Moonrocks + Chips - aligned with game content */}
      <div className="flex items-stretch gap-3 max-w-[420px] mx-auto px-4">
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

      {/* Profile (right) */}
      <Profile
        username={username || "..."}
        className="w-auto px-4 absolute right-4 top-4"
      />
    </div>
  );
};
