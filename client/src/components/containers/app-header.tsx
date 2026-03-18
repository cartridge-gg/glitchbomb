import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Profile } from "@/components/elements";
import {
  ArrowLeftIcon,
  ControllerIcon,
  GearIcon,
  GlitchBombIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { GlitchText } from "@/components/ui/glitch-text";
import { GradientBorder } from "@/components/ui/gradient-border";
import type { AudioSettings } from "@/hooks/use-audio";
import { mobilePath } from "@/utils/mobile";
import { SettingsModal } from "./sound-modal";

export interface AppHeaderProps {
  moonrocks: number;
  hideBalance?: boolean;
  username?: string;
  showBack?: boolean;
  backPath?: string;
  onBack?: () => void;
  onMint?: () => void;
  onProfileClick?: () => void;
  onConnect?: () => void;
  audioSettings?: AudioSettings;
  onMusicMutedChange?: (muted: boolean) => void;
  onSfxMutedChange?: (muted: boolean) => void;
  onMusicVolumeChange?: (vol: number) => void;
  onSfxVolumeChange?: (vol: number) => void;
}

export const AppHeader = ({
  moonrocks,
  hideBalance,
  username,
  showBack = true,
  backPath = "/",
  onBack,
  onMint,
  onProfileClick,
  onConnect,
  audioSettings,
  onMusicMutedChange,
  onSfxMutedChange,
  onMusicVolumeChange,
  onSfxVolumeChange,
}: AppHeaderProps) => {
  const navigate = useNavigate();
  const canMint = Boolean(onMint);
  const handleBack = onBack ?? (() => navigate(mobilePath(backPath)));
  const [settingsOpen, setSettingsOpen] = useState(false);

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
        {/* Logo on mobile - clickable to navigate back */}
        {!onBack && (
          <button
            type="button"
            className="md:hidden h-12 w-12 p-0 flex items-center justify-center"
            onClick={handleBack}
          >
            <GlitchBombIcon size="xl" className="text-white glitch-icon" />
          </button>
        )}
      </div>

      {/* GlitchBomb text - only on md+ screens, hidden when onBack is set */}
      <h1
        className={`${onBack ? "hidden" : "hidden md:flex"} items-center gap-1 uppercase leading-none glitch-text cursor-pointer`}
        onClick={handleBack}
      >
        <span className="text-green-400 text-2xl font-glitch font-thin tracking-tight">
          Glitch
        </span>
        <span className="text-white text-2xl tracking-tight">Bomb</span>
      </h1>

      {/* Spacer to push right content */}
      <div className="flex-1" />

      {/* Right: Sound + Moonrocks + Profile */}
      <div className="flex gap-2 shrink-0">
        {/* Desktop: settings button */}
        {audioSettings && (
          <Button
            variant="secondary"
            gradient="green"
            wrapperClassName="hidden md:flex"
            className="h-12 w-12 p-0"
            onClick={() => setSettingsOpen(true)}
          >
            <GearIcon size="sm" />
          </Button>
        )}
        {/* Moonrocks display */}
        {!hideBalance && (
          <GradientBorder color="pink">
            <button
              type="button"
              className="flex items-center justify-center gap-2 h-12 px-3 md:px-4 rounded-lg bg-[#2B052E] transition-all duration-200 hover:brightness-110 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
              onClick={onMint}
              disabled={!canMint}
              aria-label="Mint moonrocks"
            >
              <GlitchBombIcon className="w-4 h-4 text-[#F09]" />
              <GlitchText
                className="font-secondary text-sm tracking-widest text-[#F09]"
                text={Math.floor(moonrocks).toLocaleString()}
              />
            </button>
          </GradientBorder>
        )}
        {/* Profile / login */}
        {username ? (
          <>
            <div className="hidden md:flex">
              <GradientBorder color="green">
                <Profile
                  username={username}
                  onClick={onProfileClick}
                  className="w-auto px-3 md:px-4"
                />
              </GradientBorder>
            </div>
            {/* Mobile: settings button (only when logged in) */}
            <Button
              variant="secondary"
              gradient="green"
              wrapperClassName="md:hidden"
              className="h-12 w-12 p-0"
              onClick={() => setSettingsOpen(true)}
            >
              <ControllerIcon size="sm" />
            </Button>
          </>
        ) : (
          onConnect && (
            <Button
              variant="secondary"
              gradient="green"
              className="h-12 px-4 font-secondary uppercase text-sm tracking-widest"
              onClick={onConnect}
            >
              LOG IN
            </Button>
          )
        )}
        {audioSettings &&
          onMusicMutedChange &&
          onSfxMutedChange &&
          onMusicVolumeChange &&
          onSfxVolumeChange && (
            <SettingsModal
              open={settingsOpen}
              onClose={() => setSettingsOpen(false)}
              audioSettings={audioSettings}
              onMusicMutedChange={onMusicMutedChange}
              onSfxMutedChange={onSfxMutedChange}
              onMusicVolumeChange={onMusicVolumeChange}
              onSfxVolumeChange={onSfxVolumeChange}
              username={username}
              onProfileClick={onProfileClick}
            />
          )}
      </div>
    </div>
  );
};
