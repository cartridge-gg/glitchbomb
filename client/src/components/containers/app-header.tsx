import { useNavigate } from "react-router-dom";
import { Profile } from "@/components/elements";
import {
  ArrowLeftIcon,
  GlitchBombIcon,
  MoonrockIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";

export interface AppHeaderProps {
  moonrocks: number;
  username?: string;
  showBack?: boolean;
  backPath?: string;
  onMint?: () => void;
  onProfileClick?: () => void;
}

export const AppHeader = ({
  moonrocks,
  username,
  showBack = true,
  backPath = "/",
  onMint,
  onProfileClick,
}: AppHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="relative flex items-center justify-between px-4 py-4">
      {/* Left: Back button */}
      {showBack ? (
        <Button
          variant="secondary"
          className="h-12 w-12 p-0"
          onClick={() => navigate(backPath)}
        >
          <ArrowLeftIcon size="sm" />
        </Button>
      ) : (
        <div className="w-12" /> // Spacer
      )}

      {/* Center: GlitchBomb icon - absolutely positioned for perfect centering */}
      <GlitchBombIcon
        size="xl"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white"
      />

      {/* Right: Moonrocks + Profile */}
      <div className="flex gap-2">
        {/* Moonrocks button */}
        <button
          type="button"
          className="flex items-center justify-center gap-2 h-12 px-4 rounded-lg transition-all duration-200 hover:brightness-110 bg-[#0D2530]"
          onClick={onMint}
        >
          <MoonrockIcon className="w-5 h-5 text-blue-400" />
          <span className="font-secondary text-sm tracking-widest text-blue-400">
            {Math.floor(moonrocks).toLocaleString()}
          </span>
        </button>
        {username && (
          <Profile
            username={username}
            onClick={onProfileClick}
            className="w-auto px-4"
          />
        )}
      </div>
    </div>
  );
};
