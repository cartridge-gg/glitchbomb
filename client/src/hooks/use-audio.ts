import { useCallback, useEffect, useRef, useState } from "react";
import type { Orb } from "@/models/orb";
import { OrbType } from "@/models/orb";

export interface AudioSettings {
  musicMuted: boolean;
  sfxMuted: boolean;
  musicVolume: number;
  sfxVolume: number;
}

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

export function useAudio() {
  const [settings, setSettings] = useState<AudioSettings>(loadSettings);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const musicRef = useRef<HTMLAudioElement | null>(null);

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

  const startMusic = useCallback(() => {
    if (musicRef.current) {
      musicRef.current.volume = settings.musicMuted ? 0 : settings.musicVolume;
      musicRef.current.play().catch(() => {});
      setIsMusicPlaying(true);
      return;
    }
    const audio = new Audio("/assets/sounds/music.wav");
    audio.loop = true;
    audio.volume = settings.musicMuted ? 0 : settings.musicVolume;
    musicRef.current = audio;
    audio.play().catch(() => {});
    setIsMusicPlaying(true);
  }, [settings.musicMuted, settings.musicVolume]);

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
      const audio = new Audio(file);
      audio.volume = settings.sfxVolume;
      audio.play().catch(() => {});
      audio.addEventListener("ended", () => {
        audio.src = "";
      });
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
