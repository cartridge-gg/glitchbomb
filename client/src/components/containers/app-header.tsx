import { useNavigate } from "react-router-dom";
import { Profile } from "@/components/elements";
import { ArrowLeftIcon, GlitchBombIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { GradientBorder } from "@/components/ui/gradient-border";

export interface AppHeaderProps {
  moonrocks: number;
  username?: string;
  showBack?: boolean;
  backPath?: string;
  onBack?: () => void;
  onMint?: () => void;
  onProfileClick?: () => void;
  onConnect?: () => void;
}

export const AppHeader = ({
  moonrocks,
  username,
  showBack = true,
  backPath = "/",
  onBack,
  onMint,
  onProfileClick,
  onConnect,
}: AppHeaderProps) => {
  const navigate = useNavigate();
  const canMint = Boolean(onMint);
  const handleBack = onBack ?? (() => navigate(backPath));

  return (
    <div className="relative flex items-center gap-2 px-4 py-4">
      {/* Left: Back button (desktop only) + Logo on mobile */}
      <div className="flex items-center gap-2 shrink-0">
        {showBack && (
          <div className={onBack ? "flex" : "hidden md:flex"}>
            <Button
              variant="secondary"
              gradient="green"
              className="h-12 w-12 p-0"
              onClick={handleBack}
            >
              <ArrowLeftIcon size="sm" />
            </Button>
          </div>
        )}
        {/* Logo on mobile - clickable to go back if showBack is true */}
        {!onBack && (
          <button
            type="button"
            className="md:hidden h-12 w-12 p-0 flex items-center justify-center"
            onClick={showBack ? handleBack : undefined}
          >
            <GlitchBombIcon size="xl" className="text-white glitch-icon" />
          </button>
        )}
      </div>

      {/* GlitchBomb text - only on md+ screens, hidden when onBack is set */}
      <h1
        className={`${onBack ? "hidden" : "hidden md:flex"} items-center gap-1 uppercase leading-none glitch-text`}
      >
        <span className="text-green-400 text-2xl font-glitch font-thin tracking-tight">
          Glitch
        </span>
        <span className="text-white text-2xl tracking-tight">Bomb</span>
      </h1>

      {/* Spacer to push right content */}
      <div className="flex-1" />

      {/* Right: Moonrocks + Profile */}
      <div className="flex gap-2 shrink-0">
        {/* Moonrocks display */}
        <button
          type="button"
          className="flex items-center justify-center gap-2 h-12 px-3 md:px-4 rounded-lg bg-[#302A10] transition-all duration-200 hover:brightness-110 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
          onClick={onMint}
          disabled={!canMint}
          aria-label="Mint moonrocks"
        >
          <GlitchBombIcon className="w-5 h-5 text-yellow-400" />
          <span className="font-secondary text-sm tracking-widest text-yellow-400">
            {Math.floor(moonrocks).toLocaleString()}
          </span>
        </button>
        {username ? (
          <GradientBorder color="green">
            <Profile
              username={username}
              onClick={onProfileClick}
              className="w-auto px-3 md:px-4"
            />
          </GradientBorder>
        ) : (
          onConnect && (
            <Button
              variant="default"
              className="h-12 px-4 font-secondary uppercase text-sm tracking-widest"
              onClick={onConnect}
            >
              LOG IN
            </Button>
          )
        )}
      </div>
    </div>
  );
};
