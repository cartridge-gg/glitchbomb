import { useNavigate } from "react-router-dom";
import { Profile } from "@/components/elements";
import {
  ArrowLeftIcon,
  GlitchBombIcon,
  MoonrockIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { GradientBorder } from "@/components/ui/gradient-border";

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
  onProfileClick,
}: AppHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="relative flex items-center gap-2 px-4 py-4">
      {/* Left: Back button (desktop only) + Logo on mobile */}
      <div className="flex items-center gap-2 shrink-0">
        {showBack && (
          <Button
            variant="secondary"
            gradient="green"
            className="hidden md:flex h-12 w-12 p-0"
            onClick={() => navigate(backPath)}
          >
            <ArrowLeftIcon size="sm" />
          </Button>
        )}
        {/* Logo on mobile - clickable to go back if showBack is true */}
        <button
          type="button"
          className="md:hidden"
          onClick={showBack ? () => navigate(backPath) : undefined}
        >
          <GlitchBombIcon size="xl" className="text-white" />
        </button>
      </div>

      {/* Center: GlitchBomb icon - only on md+ screens */}
      <GlitchBombIcon
        size="xl"
        className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white"
      />

      {/* Spacer to push right content */}
      <div className="flex-1" />

      {/* Right: Moonrocks + Profile */}
      <div className="flex gap-2 shrink-0">
        {/* Moonrocks display */}
        <div className="flex items-center justify-center gap-2 h-12 px-3 md:px-4 rounded-lg bg-[#302A10]">
          <MoonrockIcon className="w-5 h-5 text-yellow-400" />
          <span className="font-secondary text-sm tracking-widest text-yellow-400">
            {Math.floor(moonrocks).toLocaleString()}
          </span>
        </div>
        {username && (
          <GradientBorder color="green">
            <Profile
              username={username}
              onClick={onProfileClick}
              className="w-auto px-3 md:px-4"
            />
          </GradientBorder>
        )}
      </div>
    </div>
  );
};
