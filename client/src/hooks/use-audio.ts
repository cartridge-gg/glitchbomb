import { useCallback, useEffect, useRef, useState } from "react";
import type { Orb } from "@/models/orb";
import { OrbType } from "@/models/orb";

export interface AudioSettings {
  musicMuted: boolean;
  sfxMuted: boolean;
  musicVolume: number;
  sfxVolume: number;
}

export type MusicTrack = "normal" | "glitched";

const MUSIC_FILES: Record<MusicTrack, string> = {
  normal: "/assets/sounds/music.wav",
  glitched: "/assets/sounds/music-glitched.wav",
};

const STORAGE_KEY = "glitchbomb-audio";

const DEFAULT_SETTINGS: AudioSettings = {
  musicMuted: false,
  sfxMuted: false,
  musicVolume: 0.8,
  sfxVolume: 0.8,
};

function loadSettings(): AudioSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch {
    // ignore
  }
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: AudioSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

function getOrbSoundFile(orb: Orb): string | null {
  if (orb.isBomb()) {
    if (orb.value === OrbType.Bomb1 || orb.value === OrbType.StickyBomb) {
      return "/assets/sounds/bomb-1.wav";
    }
    if (orb.value === OrbType.Bomb2) {
      return "/assets/sounds/bomb-2.wav";
    }
    if (orb.value === OrbType.Bomb3) {
      return "/assets/sounds/bomb-3.wav";
    }
  }
  if (orb.isPoint()) return "/assets/sounds/points.wav";
  if (orb.isHealth()) return "/assets/sounds/health.wav";
  if (orb.isMultiplier()) return "/assets/sounds/multiplier.wav";
  if (orb.isMoonrock() || orb.isChips()) return "/assets/sounds/moonrock.wav";
  return null;
}

// Returns 0 (base), 1 (mid), or 2 (high) for point orb impact scaling
function getPointImpactTier(orb: Orb): number {
  switch (orb.value) {
    case OrbType.Point5:
    case OrbType.Point6:
      return 0;
    case OrbType.Point7:
    case OrbType.Point8:
      return 1;
    case OrbType.Point9:
    case OrbType.PointOrb1:
    case OrbType.PointBomb4:
      return 2;
    default:
      return 0;
  }
}

function playSfx(file: string, volume: number) {
  const audio = new Audio(file);
  audio.volume = volume;
  audio.play().catch(() => {});
  audio.addEventListener("ended", () => {
    audio.src = "";
  });
}

function playSfxLayered(file: string, baseVolume: number, tier: number) {
  // Primary layer — always plays at full volume
  playSfx(file, baseVolume);

  if (tier >= 1) {
    // Echo layer — slightly quieter, delayed
    setTimeout(() => playSfx(file, baseVolume * 0.45), 60);
  }
  if (tier >= 2) {
    // Third layer — wider delay, softer
    setTimeout(() => playSfx(file, baseVolume * 0.3), 130);
  }
}

export function useAudio() {
  const [settings, setSettings] = useState<AudioSettings>(loadSettings);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const currentTrackRef = useRef<MusicTrack | null>(null);

  // Persist settings whenever they change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Sync music volume/mute with the audio element
  useEffect(() => {
    const music = musicRef.current;
    if (!music) return;
    music.volume = settings.musicMuted ? 0 : settings.musicVolume;
  }, [settings.musicMuted, settings.musicVolume]);

  const startMusic = useCallback(
    (track: MusicTrack = "normal") => {
      const vol = settings.musicMuted ? 0 : settings.musicVolume;

      // If same track is already playing, just resume
      if (musicRef.current && currentTrackRef.current === track) {
        musicRef.current.volume = vol;
        musicRef.current.play().catch(() => {});
        setIsMusicPlaying(true);
        return;
      }

      // Capture current position before switching, for time-synced crossfade
      let seekPosition: number | null = null;
      if (musicRef.current) {
        seekPosition = musicRef.current.currentTime;
        musicRef.current.pause();
        musicRef.current.src = "";
      }

      const audio = new Audio(MUSIC_FILES[track]);
      audio.loop = true;
      audio.volume = vol;

      // Seek to the same position as previous track, or random if fresh start
      audio.addEventListener(
        "loadedmetadata",
        () => {
          if (audio.duration > 0) {
            audio.currentTime =
              seekPosition !== null
                ? seekPosition % audio.duration
                : Math.random() * audio.duration;
          }
        },
        { once: true },
      );

      musicRef.current = audio;
      currentTrackRef.current = track;
      audio.play().catch(() => {});
      setIsMusicPlaying(true);
    },
    [settings.musicMuted, settings.musicVolume],
  );

  const stopMusic = useCallback(() => {
    const music = musicRef.current;
    if (music) {
      music.pause();
      music.currentTime = 0;
    }
    setIsMusicPlaying(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const music = musicRef.current;
      if (music) {
        music.pause();
        music.src = "";
        musicRef.current = null;
      }
    };
  }, []);

  const playOrbSound = useCallback(
    (orb: Orb) => {
      if (settings.sfxMuted) return;
      const file = getOrbSoundFile(orb);
      if (!file) return;

      if (orb.isPoint()) {
        const tier = getPointImpactTier(orb);
        playSfxLayered(file, settings.sfxVolume, tier);
      } else {
        playSfx(file, settings.sfxVolume);
      }
    },
    [settings.sfxMuted, settings.sfxVolume],
  );

  const setMusicMuted = useCallback((muted: boolean) => {
    setSettings((prev) => ({ ...prev, musicMuted: muted }));
  }, []);

  const setSfxMuted = useCallback((muted: boolean) => {
    setSettings((prev) => ({ ...prev, sfxMuted: muted }));
  }, []);

  const setMusicVolume = useCallback((vol: number) => {
    setSettings((prev) => ({ ...prev, musicVolume: vol }));
  }, []);

  const setSfxVolume = useCallback((vol: number) => {
    setSettings((prev) => ({ ...prev, sfxVolume: vol }));
  }, []);

  return {
    settings,
    setMusicMuted,
    setSfxMuted,
    setMusicVolume,
    setSfxVolume,
    playOrbSound,
    startMusic,
    stopMusic,
    isMusicPlaying,
  };
}
