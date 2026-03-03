import * as Popover from "@radix-ui/react-popover";
import { SpeakerIcon, SpeakerMutedIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import type { AudioSettings } from "@/hooks/use-audio";

export interface SoundPopoverProps {
  settings: AudioSettings;
  onMusicMutedChange: (muted: boolean) => void;
  onSfxMutedChange: (muted: boolean) => void;
  onMusicVolumeChange: (vol: number) => void;
  onSfxVolumeChange: (vol: number) => void;
  buttonClassName?: string;
}

export const SoundPopover = ({
  settings,
  onMusicMutedChange,
  onSfxMutedChange,
  onMusicVolumeChange,
  onSfxVolumeChange,
  buttonClassName = "h-12 w-12 p-0",
}: SoundPopoverProps) => {
  const isMuted = settings.musicMuted && settings.sfxMuted;

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button
          variant="secondary"
          gradient="green"
          className={buttonClassName}
        >
          {isMuted ? <SpeakerMutedIcon size="sm" /> : <SpeakerIcon size="sm" />}
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="end"
          sideOffset={8}
          className="z-50 w-64 rounded-xl border-2 border-[rgba(29,58,41,0.8)] bg-black p-4 flex flex-col gap-4 shadow-lg animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
        >
          {/* Music row */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              className="shrink-0 p-1 rounded-md hover:bg-green-900/30 transition-colors"
              onClick={() => onMusicMutedChange(!settings.musicMuted)}
            >
              {settings.musicMuted ? (
                <SpeakerMutedIcon
                  size="sm"
                  style={{ color: "rgba(54, 248, 24, 0.5)" }}
                />
              ) : (
                <SpeakerIcon size="sm" style={{ color: "#36F818" }} />
              )}
            </button>
            <span
              className="font-secondary text-[10px] tracking-widest w-12 shrink-0"
              style={{ color: "rgba(54, 248, 24, 0.8)" }}
            >
              Music
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={settings.musicVolume}
              onChange={(e) => onMusicVolumeChange(Number(e.target.value))}
              className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full"
              style={{
                accentColor: "#36F818",
                backgroundColor: "rgba(54, 248, 24, 0.15)",
              }}
            />
          </div>

          {/* SFX row */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              className="shrink-0 p-1 rounded-md hover:bg-green-900/30 transition-colors"
              onClick={() => onSfxMutedChange(!settings.sfxMuted)}
            >
              {settings.sfxMuted ? (
                <SpeakerMutedIcon
                  size="sm"
                  style={{ color: "rgba(54, 248, 24, 0.5)" }}
                />
              ) : (
                <SpeakerIcon size="sm" style={{ color: "#36F818" }} />
              )}
            </button>
            <span
              className="font-secondary text-[10px] tracking-widest w-12 shrink-0"
              style={{ color: "rgba(54, 248, 24, 0.8)" }}
            >
              Effects
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={settings.sfxVolume}
              onChange={(e) => onSfxVolumeChange(Number(e.target.value))}
              className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full"
              style={{
                accentColor: "#36F818",
                backgroundColor: "rgba(54, 248, 24, 0.15)",
              }}
            />
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
