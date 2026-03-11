import { type RefObject, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Profile } from "@/components/elements";
import {
  ArrowLeftIcon,
  ChipIcon,
  ControllerIcon,
  MoonrockIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { GlitchText } from "@/components/ui/glitch-text";
import { GradientBorder } from "@/components/ui/gradient-border";
import type { AudioSettings } from "@/hooks/use-audio";
import { SettingsModal, SoundPopover } from "./sound-modal";

export interface GameHeaderProps {
  moonrocks: number;
  chips: number;
  username?: string;
  moonrocksRef?: RefObject<HTMLDivElement | null>;
  animateCount?: boolean;
  rewardOverlayOpen?: boolean;
  audioSettings?: AudioSettings;
  onMusicMutedChange?: (muted: boolean) => void;
  onSfxMutedChange?: (muted: boolean) => void;
  onMusicVolumeChange?: (vol: number) => void;
  onSfxVolumeChange?: (vol: number) => void;
  onProfileClick?: () => void;
}

const COUNT_UP_DURATION_MS = 600;

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

export const GameHeader = ({
  moonrocks,
  chips,
  username,
  moonrocksRef,
  animateCount,
  rewardOverlayOpen,
  audioSettings,
  onMusicMutedChange,
  onSfxMutedChange,
  onMusicVolumeChange,
  onSfxVolumeChange,
  onProfileClick,
}: GameHeaderProps) => {
  const navigate = useNavigate();
  const [displayCount, setDisplayCount] = useState<number | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!animateCount) {
      setDisplayCount(null);
      return;
    }

    const target = Math.floor(moonrocks);
    const start = performance.now();
    setDisplayCount(0);

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / COUNT_UP_DURATION_MS, 1);
      const eased = easeOutCubic(progress);
      setDisplayCount(Math.round(eased * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplayCount(null); // Done — show real value
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animateCount, moonrocks]);

  const shownMoonrocks =
    displayCount !== null
      ? displayCount
      : rewardOverlayOpen
        ? 0
        : Math.floor(moonrocks);

  return (
    <div className="grid grid-cols-[1fr_minmax(0,400px)_1fr] items-center gap-[clamp(6px,2svh,16px)] pt-[clamp(8px,2.5svh,16px)] pb-0 px-4">
      {/* Left column - back button aligned left */}
      <div className="flex justify-start">
        <Button
          variant="secondary"
          gradient="green"
          className="h-[clamp(36px,6svh,48px)] w-[clamp(36px,6svh,48px)] p-0"
          onClick={() => navigate("/")}
        >
          <ArrowLeftIcon size="sm" />
        </Button>
      </div>

      {/* Center column - Moonrocks + Chips (max 420px, shrinks on mobile) */}
      <div className="flex items-center gap-2 min-w-0">
        {/* Moonrocks (yellow) */}
        <div
          className={`flex-1 min-w-0 ${rewardOverlayOpen ? "relative z-[51]" : ""}`}
        >
          <div
            ref={moonrocksRef}
            className="w-full flex items-center justify-center gap-2 min-h-[clamp(32px,4.8svh,42px)] min-w-0 px-[clamp(10px,2.5svh,16px)] rounded-full bg-[#302A10]"
          >
            <MoonrockIcon className="w-5 h-5 text-yellow-400 shrink-0" />
            <GlitchText
              className="font-secondary text-[clamp(0.65rem,1.6svh,0.875rem)] tracking-widest text-yellow-400 truncate"
              text={shownMoonrocks.toLocaleString()}
            />
          </div>
        </div>
        {/* Chips (orange) */}
        <div className="flex-1 min-w-0">
          <div className="w-full flex items-center justify-center gap-2 min-h-[clamp(32px,4.8svh,42px)] min-w-0 px-[clamp(10px,2.5svh,16px)] rounded-full bg-[#302510]">
            <ChipIcon className="w-5 h-5 text-orange-400 shrink-0" />
            <GlitchText
              className="font-secondary text-[clamp(0.65rem,1.6svh,0.875rem)] tracking-widest text-orange-400 truncate"
              text={chips.toLocaleString()}
            />
          </div>
        </div>
      </div>

      {/* Right column - sound button + profile aligned right */}
      <div className="flex justify-end gap-2">
        {/* Desktop: sound popover + profile */}
        {audioSettings &&
          onMusicMutedChange &&
          onSfxMutedChange &&
          onMusicVolumeChange &&
          onSfxVolumeChange && (
            <div className="hidden md:flex">
              <SoundPopover
                settings={audioSettings}
                onMusicMutedChange={onMusicMutedChange}
                onSfxMutedChange={onSfxMutedChange}
                onMusicVolumeChange={onMusicVolumeChange}
                onSfxVolumeChange={onSfxVolumeChange}
                buttonClassName="h-[clamp(36px,6svh,48px)] w-[clamp(36px,6svh,48px)] p-0"
              />
            </div>
          )}
        <div className="hidden md:flex">
          <GradientBorder color="green">
            <Profile
              username={username || "..."}
              onClick={onProfileClick}
              className="w-auto px-4 h-[clamp(36px,5.5svh,48px)]"
            />
          </GradientBorder>
        </div>
        {/* Mobile: single controller settings button */}
        <Button
          variant="secondary"
          gradient="green"
          wrapperClassName="md:hidden"
          className="h-[clamp(36px,6svh,48px)] w-[clamp(36px,6svh,48px)] p-0"
          onClick={() => setSettingsOpen(true)}
        >
          <ControllerIcon size="sm" />
        </Button>
        {audioSettings && onMusicMutedChange && onSfxMutedChange && (
          <SettingsModal
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            audioSettings={audioSettings}
            onMusicMutedChange={onMusicMutedChange}
            onSfxMutedChange={onSfxMutedChange}
            username={username}
            onProfileClick={onProfileClick}
          />
        )}
      </div>
    </div>
  );
};
