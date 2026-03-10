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
  normal: "/assets/sounds/music.ogg",
  glitched: "/assets/sounds/music-glitched.ogg",
};

const STORAGE_KEY = "glitchbomb-audio";

const DEFAULT_SETTINGS: AudioSettings = {
  musicMuted: false,
  sfxMuted: false,
  musicVolume: 0.4,
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

// Number of extra echo layers for each point orb (on top of the base play)
function getPointEchoLayers(orb: Orb): number {
  switch (orb.value) {
    case OrbType.Point5:
      return 0;
    case OrbType.Point6:
      return 1;
    case OrbType.Point7:
      return 2;
    case OrbType.Point8:
      return 3;
    case OrbType.Point9:
      return 4;
    case OrbType.PointOrb1:
    case OrbType.PointBomb4:
      return 5;
    default:
      return 0;
  }
}

const ECHO_OFFSET_MS = 40;
const ECHO_VOLUME_DECAY = 0.72; // each layer is 72% of the previous

function playSfx(file: string, volume: number) {
  const audio = new Audio(file);
  audio.volume = Math.min(volume, 1);
  audio.play().catch(() => {});
  audio.addEventListener("ended", () => {
    audio.src = "";
  });
}

function playSfxLayered(file: string, baseVolume: number, layers: number) {
  playSfx(file, baseVolume);
  let vol = baseVolume;
  for (let i = 1; i <= layers; i++) {
    vol *= ECHO_VOLUME_DECAY;
    const delay = i * ECHO_OFFSET_MS;
    const layerVol = vol;
    setTimeout(() => playSfx(file, layerVol), delay);
  }
}

export function useAudio() {
  const [settings, setSettings] = useState<AudioSettings>(loadSettings);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const currentTrackRef = useRef<MusicTrack | null>(null);
  const resumeListenerRef = useRef<(() => void) | null>(null);

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

      // Remove any previous autoplay-retry listener
      if (resumeListenerRef.current) {
        document.removeEventListener("click", resumeListenerRef.current);
        document.removeEventListener("touchstart", resumeListenerRef.current);
        resumeListenerRef.current = null;
      }

      audio.play().catch(() => {
        // Autoplay blocked — retry on first user interaction
        const resume = () => {
          audio.play().catch(() => {});
          document.removeEventListener("click", resume);
          document.removeEventListener("touchstart", resume);
          resumeListenerRef.current = null;
        };
        resumeListenerRef.current = resume;
        document.addEventListener("click", resume, { once: true });
        document.addEventListener("touchstart", resume, { once: true });
      });
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
      if (resumeListenerRef.current) {
        document.removeEventListener("click", resumeListenerRef.current);
        document.removeEventListener("touchstart", resumeListenerRef.current);
        resumeListenerRef.current = null;
      }
    };
  }, []);

  const playOrbSound = useCallback(
    (orb: Orb) => {
      if (settings.sfxMuted) return;
      const file = getOrbSoundFile(orb);
      if (!file) return;

      if (orb.isPoint()) {
        playSfxLayered(file, settings.sfxVolume, getPointEchoLayers(orb));
      } else {
        playSfx(file, settings.sfxVolume);
      }
    },
    [settings.sfxMuted, settings.sfxVolume],
  );

  const playRewardSound = useCallback(() => {
    if (settings.sfxMuted) return;
    const file = "/assets/sounds/moonrock.wav";
    // 6 staggered hits matching the particle animation
    playSfxLayered(file, settings.sfxVolume, 5);
  }, [settings.sfxMuted, settings.sfxVolume]);

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
    playRewardSound,
    startMusic,
    stopMusic,
    isMusicPlaying,
  };
}
