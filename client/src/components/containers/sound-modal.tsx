import * as Popover from "@radix-ui/react-popover";
import {
  ControllerIcon,
  SpeakerIcon,
  SpeakerMutedIcon,
} from "@/components/icons";
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

const VolumeSlider = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) => (
  <div className="relative flex-1 h-6 flex items-center">
    <div
      className="absolute inset-y-0 left-0 right-0 flex items-center pointer-events-none"
      aria-hidden="true"
    >
      {/* Track background */}
      <div
        className="w-full h-1.5 rounded-full overflow-hidden"
        style={{ backgroundColor: "rgba(54, 248, 24, 0.1)" }}
      >
        {/* Fill */}
        <div
          className="h-full rounded-full"
          style={{
            width: `${value * 100}%`,
            background:
              "linear-gradient(90deg, rgba(54, 248, 24, 0.3) 0%, #36F818 100%)",
          }}
        />
      </div>
    </div>
    <input
      type="range"
      min={0}
      max={1}
      step={0.01}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="relative w-full h-6 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(54,248,24,0.5)]"
      style={
        {
          "--thumb-bg": "#36F818",
          WebkitAppearance: "none",
        } as React.CSSProperties
      }
    />
    <style>{`
      input[type="range"]::-webkit-slider-thumb {
        background: #36F818;
      }
    `}</style>
  </div>
);

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
          className="z-50 w-60 rounded-lg p-[1px] shadow-[0_4px_24px_rgba(0,0,0,0.5)] animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
          style={{
            background:
              "linear-gradient(180deg, rgba(54, 248, 24, 0.25) 0%, rgba(54, 248, 24, 0) 100%)",
          }}
        >
          <div
            className="rounded-[7px] px-4 py-3.5 flex flex-col gap-3"
            style={{ backgroundColor: "#0A0A0A" }}
          >
            {/* Music row */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="shrink-0 w-7 h-7 flex items-center justify-center rounded transition-colors"
                style={{ backgroundColor: "rgba(54, 248, 24, 0.06)" }}
                onClick={() => onMusicMutedChange(!settings.musicMuted)}
              >
                {settings.musicMuted ? (
                  <SpeakerMutedIcon
                    size="xs"
                    style={{ color: "rgba(54, 248, 24, 0.3)" }}
                  />
                ) : (
                  <SpeakerIcon size="xs" style={{ color: "#36F818" }} />
                )}
              </button>
              <span
                className="font-secondary text-[10px] tracking-[0.15em] uppercase w-[46px] shrink-0"
                style={{ color: "rgba(54, 248, 24, 0.6)" }}
              >
                Music
              </span>
              <VolumeSlider
                value={settings.musicVolume}
                onChange={onMusicVolumeChange}
              />
            </div>

            {/* SFX row */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="shrink-0 w-7 h-7 flex items-center justify-center rounded transition-colors"
                style={{ backgroundColor: "rgba(54, 248, 24, 0.06)" }}
                onClick={() => onSfxMutedChange(!settings.sfxMuted)}
              >
                {settings.sfxMuted ? (
                  <SpeakerMutedIcon
                    size="xs"
                    style={{ color: "rgba(54, 248, 24, 0.3)" }}
                  />
                ) : (
                  <SpeakerIcon size="xs" style={{ color: "#36F818" }} />
                )}
              </button>
              <span
                className="font-secondary text-[10px] tracking-[0.15em] uppercase w-[46px] shrink-0"
                style={{ color: "rgba(54, 248, 24, 0.6)" }}
              >
                Effects
              </span>
              <VolumeSlider
                value={settings.sfxVolume}
                onChange={onSfxVolumeChange}
              />
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  audioSettings: AudioSettings;
  onMusicMutedChange: (muted: boolean) => void;
  onSfxMutedChange: (muted: boolean) => void;
  onMusicVolumeChange: (vol: number) => void;
  onSfxVolumeChange: (vol: number) => void;
  showDistributionPercent?: boolean;
  onShowDistributionPercentChange?: (show: boolean) => void;
  username?: string;
  onProfileClick?: () => void;
}

const ToggleSwitch = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="flex shrink-0 rounded-md overflow-hidden border border-green-900">
    <button
      type="button"
      className={`px-2.5 py-1 font-secondary text-[10px] tracking-widest uppercase transition-colors ${
        !checked
          ? "bg-green-950 text-green-400"
          : "bg-green-1000 text-green-600"
      }`}
      onClick={() => onChange(false)}
    >
      Off
    </button>
    <button
      type="button"
      className={`px-2.5 py-1 font-secondary text-[10px] tracking-widest uppercase transition-colors ${
        checked ? "bg-green-950 text-green-400" : "bg-green-1000 text-green-600"
      }`}
      onClick={() => onChange(true)}
    >
      On
    </button>
  </div>
);

const SETTINGS_ROW =
  "h-14 w-full flex items-center gap-3 px-5 bg-green-950 rounded-lg";

export const SettingsModal = ({
  open,
  onClose,
  audioSettings,
  onMusicMutedChange,
  onSfxMutedChange,
  onMusicVolumeChange,
  onSfxVolumeChange,
  showDistributionPercent,
  onShowDistributionPercentChange,
  username,
  onProfileClick,
}: SettingsModalProps) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
    >
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
        aria-label="Close settings"
      />
      {/* Content — centered */}
      <div className="relative flex flex-col gap-3 px-6 w-full max-w-sm">
        <span className="font-secondary text-xs tracking-[0.2em] uppercase text-green-400 mb-1">
          Settings
        </span>

        {/* Music row */}
        <Button
          variant="secondary"
          gradient="green"
          className={SETTINGS_ROW}
          asChild
        >
          <div>
            <button
              type="button"
              className="shrink-0"
              onClick={() => onMusicMutedChange(!audioSettings.musicMuted)}
            >
              {audioSettings.musicMuted ? (
                <SpeakerMutedIcon size="sm" />
              ) : (
                <SpeakerIcon size="sm" />
              )}
            </button>
            <span className="font-secondary text-sm tracking-widest uppercase w-[60px] shrink-0">
              Music
            </span>
            <VolumeSlider
              value={audioSettings.musicVolume}
              onChange={onMusicVolumeChange}
            />
          </div>
        </Button>

        {/* Effects row */}
        <Button
          variant="secondary"
          gradient="green"
          className={SETTINGS_ROW}
          asChild
        >
          <div>
            <button
              type="button"
              className="shrink-0"
              onClick={() => onSfxMutedChange(!audioSettings.sfxMuted)}
            >
              {audioSettings.sfxMuted ? (
                <SpeakerMutedIcon size="sm" />
              ) : (
                <SpeakerIcon size="sm" />
              )}
            </button>
            <span className="font-secondary text-sm tracking-widest uppercase w-[60px] shrink-0">
              Effects
            </span>
            <VolumeSlider
              value={audioSettings.sfxVolume}
              onChange={onSfxVolumeChange}
            />
          </div>
        </Button>

        {/* Distribution % toggle */}
        {onShowDistributionPercentChange != null && (
          <Button
            variant="secondary"
            gradient="green"
            className="h-14 w-full justify-between px-5 font-secondary text-sm tracking-widest uppercase"
            onClick={() =>
              onShowDistributionPercentChange(!showDistributionPercent)
            }
          >
            Show Distribution %
            <ToggleSwitch
              checked={!!showDistributionPercent}
              onChange={onShowDistributionPercentChange}
            />
          </Button>
        )}

        {/* Profile button */}
        {username && (
          <Button
            variant="secondary"
            gradient="green"
            className="h-14 w-full justify-start gap-3 px-5 font-secondary text-sm tracking-widest uppercase"
            onClick={() => {
              onClose();
              onProfileClick?.();
            }}
          >
            <ControllerIcon size="sm" />
            {username}
          </Button>
        )}
      </div>
    </div>
  );
};
