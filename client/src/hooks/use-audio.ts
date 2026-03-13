import { useCallback, useEffect, useState } from "react";
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

const FADE_DURATION_S = 0.8;
const ECHO_OFFSET_MS = 40;
const ECHO_VOLUME_DECAY = 0.72;

// ── Shared Web Audio context ──

function getAudioCtx(): AudioContext {
  if (!gAudioCtx) {
    gAudioCtx = new AudioContext();
  }
  if (gAudioCtx.state === "suspended") {
    void gAudioCtx.resume();
  }
  return gAudioCtx;
}

let gAudioCtx: AudioContext | null = null;

// SFX buffer cache
const gSfxCache = new Map<string, AudioBuffer>();

async function fetchBuffer(url: string): Promise<AudioBuffer | null> {
  const cached = gSfxCache.get(url);
  if (cached) return cached;
  try {
    const ctx = getAudioCtx();
    const res = await fetch(url);
    const arrayBuf = await res.arrayBuffer();
    const audioBuf = await ctx.decodeAudioData(arrayBuf);
    gSfxCache.set(url, audioBuf);
    return audioBuf;
  } catch {
    return null;
  }
}

function playSfx(file: string, volume: number) {
  void (async () => {
    const buffer = await fetchBuffer(file);
    if (!buffer) return;
    const ctx = getAudioCtx();
    const gain = ctx.createGain();
    gain.gain.value = Math.min(volume, 1);
    gain.connect(ctx.destination);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(gain);
    source.start(0);
  })();
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

// ── Module-level music state ──

let gMusicSource: AudioBufferSourceNode | null = null;
let gMusicGain: GainNode | null = null;
let gCurrentTrack: MusicTrack | null = null;
let gResumeListener: (() => void) | null = null;
// Track playback position for crossfading
let gMusicStartTime = 0; // ctx.currentTime when source.start() was called
let gMusicOffset = 0; // offset into the buffer

let gOldSource: AudioBufferSourceNode | null = null;
let gOldGain: GainNode | null = null;

function stopSource(
  source: AudioBufferSourceNode | null,
  gain: GainNode | null,
) {
  if (source) {
    try {
      source.onended = null;
      source.stop();
    } catch {
      /* already stopped */
    }
  }
  if (gain) {
    gain.disconnect();
  }
}

export function useAudio() {
  const [settings, setSettings] = useState<AudioSettings>(loadSettings);
  const [isMusicPlaying, setIsMusicPlaying] = useState(gMusicSource !== null);

  // Persist settings whenever they change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Sync music volume/mute with gain node
  useEffect(() => {
    if (!gMusicGain) return;
    const vol = settings.musicMuted ? 0 : settings.musicVolume;
    gMusicGain.gain.setValueAtTime(vol, getAudioCtx().currentTime);
  }, [settings.musicMuted, settings.musicVolume]);

  const startMusic = useCallback(
    (track: MusicTrack = "normal") => {
      const vol = settings.musicMuted ? 0 : settings.musicVolume;
      const ctx = getAudioCtx();

      // If same track is already playing (or loading), just update volume
      if (gCurrentTrack === track) {
        if (gMusicGain) {
          gMusicGain.gain.setValueAtTime(vol, ctx.currentTime);
        }
        setIsMusicPlaying(true);
        return;
      }

      // Kill any previous old track that's still fading out
      stopSource(gOldSource, gOldGain);
      gOldSource = null;
      gOldGain = null;

      // Capture current playback position for seeking
      let seekPosition: number | null = null;
      if (gMusicSource && gMusicGain) {
        seekPosition = gMusicOffset + (ctx.currentTime - gMusicStartTime);
        // Fade out old track
        gOldSource = gMusicSource;
        gOldGain = gMusicGain;
        gOldGain.gain.setValueAtTime(gOldGain.gain.value, ctx.currentTime);
        gOldGain.gain.linearRampToValueAtTime(
          0,
          ctx.currentTime + FADE_DURATION_S,
        );
        const oldSrc = gOldSource;
        const oldGn = gOldGain;
        setTimeout(
          () => {
            stopSource(oldSrc, oldGn);
            if (gOldSource === oldSrc) {
              gOldSource = null;
              gOldGain = null;
            }
          },
          FADE_DURATION_S * 1000 + 50,
        );
      }

      gMusicSource = null;
      gMusicGain = null;
      gCurrentTrack = track;

      // Remove any previous autoplay-retry listener
      if (gResumeListener) {
        document.removeEventListener("click", gResumeListener);
        document.removeEventListener("touchstart", gResumeListener);
        gResumeListener = null;
      }

      const playBuffer = async () => {
        const buffer = await fetchBuffer(MUSIC_FILES[track]);
        if (!buffer) return;
        // Bail if track changed while loading
        if (gCurrentTrack !== track) return;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(
          vol,
          ctx.currentTime + FADE_DURATION_S,
        );
        gain.connect(ctx.destination);

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.connect(gain);

        const offset =
          seekPosition !== null
            ? seekPosition % buffer.duration
            : Math.random() * buffer.duration;

        source.start(0, offset);
        gMusicSource = source;
        gMusicGain = gain;
        gMusicStartTime = ctx.currentTime;
        gMusicOffset = offset;
      };

      // Resume AudioContext (may be suspended due to autoplay policy)
      if (ctx.state === "suspended") {
        const resume = () => {
          void ctx.resume().then(playBuffer);
          document.removeEventListener("click", resume);
          document.removeEventListener("touchstart", resume);
          gResumeListener = null;
        };
        gResumeListener = resume;
        document.addEventListener("click", resume, { once: true });
        document.addEventListener("touchstart", resume, { once: true });
      } else {
        void playBuffer();
      }

      setIsMusicPlaying(true);
    },
    [settings.musicMuted, settings.musicVolume],
  );

  const stopMusic = useCallback(() => {
    const ctx = getAudioCtx();
    if (gMusicSource && gMusicGain) {
      gMusicGain.gain.setValueAtTime(gMusicGain.gain.value, ctx.currentTime);
      gMusicGain.gain.linearRampToValueAtTime(
        0,
        ctx.currentTime + FADE_DURATION_S,
      );
      const src = gMusicSource;
      const gn = gMusicGain;
      setTimeout(() => stopSource(src, gn), FADE_DURATION_S * 1000 + 50);
    }
    gMusicSource = null;
    gMusicGain = null;
    gCurrentTrack = null;
    setIsMusicPlaying(false);
  }, []);

  // Global tap sound on every click/tap
  useEffect(() => {
    if (settings.sfxMuted) return;
    let recentTouch = false;
    const playTap = () => {
      playSfx("/assets/sounds/tap.wav", settings.sfxVolume * 0.5);
    };
    const onTouch = () => {
      recentTouch = true;
      playTap();
      setTimeout(() => {
        recentTouch = false;
      }, 300);
    };
    const onClick = () => {
      if (!recentTouch) playTap();
    };
    document.addEventListener("touchstart", onTouch, { passive: true });
    document.addEventListener("click", onClick, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onTouch);
      document.removeEventListener("click", onClick);
    };
  }, [settings.sfxMuted, settings.sfxVolume]);

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
