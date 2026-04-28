import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface AudioContextType {
  isMuted: boolean;
  toggleMute: () => void;
  volume: number;
  setVolume: (v: number) => void;
  playBomb1: () => void;
  playBomb2: () => void;
  playBomb3: () => void;
  playHealth: () => void;
  playMultiplier: () => void;
  playMoonrock: () => void;
  playPoints: () => void;
  playPoints1: () => void;
  playPoints5: () => void;
  playPoints7: () => void;
  playPoints8: () => void;
  playPoints9: () => void;
  playLevelStart: () => void;
  playLevelComplete: () => void;
  playPulling: () => void;
  playTap: () => void;
  playHover: () => void;
  playClick: () => void;
}

const noop = () => {};

const AudioCtx = createContext<AudioContextType>({
  isMuted: false,
  toggleMute: noop,
  volume: 100,
  setVolume: noop,
  playBomb1: noop,
  playBomb2: noop,
  playBomb3: noop,
  playHealth: noop,
  playMultiplier: noop,
  playMoonrock: noop,
  playPoints: noop,
  playPoints1: noop,
  playPoints5: noop,
  playPoints7: noop,
  playPoints8: noop,
  playPoints9: noop,
  playLevelStart: noop,
  playLevelComplete: noop,
  playPulling: noop,
  playTap: noop,
  playHover: noop,
  playClick: noop,
});

// eslint-disable-next-line react-refresh/only-export-components
export const useAudio = () => useContext(AudioCtx);

const SFX_PATHS = {
  bomb1: "/assets/sounds/bomb-1.wav",
  bomb2: "/assets/sounds/bomb-2.wav",
  bomb3: "/assets/sounds/bomb-3.wav",
  health: "/assets/sounds/health.wav",
  multiplier: "/assets/sounds/multiplier.wav",
  moonrock: "/assets/sounds/moonrock.wav",
  points: "/assets/sounds/points.wav",
  points1: "/assets/sounds/points-1.wav",
  points5: "/assets/sounds/points-5.wav",
  points7: "/assets/sounds/points-7.wav",
  points8: "/assets/sounds/points-8.wav",
  points9: "/assets/sounds/points-9.wav",
  levelStart: "/assets/sounds/level-started.wav",
  levelComplete: "/assets/sounds/level-completed.wav",
  pulling: "/assets/sounds/pulling.wav",
  tap: "/assets/sounds/tap.wav",
  hover: "/assets/sounds/hover.wav",
  click: "/assets/sounds/click.wav",
} as const;

type SfxName = keyof typeof SFX_PATHS;

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem("audioMuted");
    return saved ? JSON.parse(saved) : false;
  });

  const [volume, setVolumeState] = useState(() => {
    const saved = localStorage.getItem("audioVolume");
    return saved ? Number(JSON.parse(saved)) : 100;
  });

  const ctxRef = useRef<globalThis.AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const buffersRef = useRef<Map<SfxName, AudioBuffer>>(new Map());

  const getCtx = useCallback(() => {
    let ctx = ctxRef.current;
    let gain = gainRef.current;
    if (!ctx || !gain) {
      ctx = new globalThis.AudioContext();
      gain = ctx.createGain();
      gain.connect(ctx.destination);
      ctxRef.current = ctx;
      gainRef.current = gain;
    }
    if (ctx.state === "suspended") {
      void ctx.resume();
    }
    return { ctx, gain };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { ctx } = getCtx();
      await Promise.all(
        (Object.entries(SFX_PATHS) as [SfxName, string][]).map(
          async ([name, path]) => {
            try {
              const res = await fetch(path);
              const arrayBuf = await res.arrayBuffer();
              const audioBuf = await ctx.decodeAudioData(arrayBuf);
              if (!cancelled) buffersRef.current.set(name, audioBuf);
            } catch {
              // Silently ignore load failures for SFX
            }
          },
        ),
      );
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [getCtx]);

  useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.value = isMuted ? 0 : volume / 100;
    }
  }, [isMuted, volume]);

  useEffect(() => {
    localStorage.setItem("audioMuted", JSON.stringify(isMuted));
  }, [isMuted]);

  useEffect(() => {
    localStorage.setItem("audioVolume", JSON.stringify(volume));
  }, [volume]);

  const playSfx = useCallback(
    (name: SfxName) => {
      if (isMuted) return;
      const buffer = buffersRef.current.get(name);
      if (!buffer) return;
      const { ctx, gain } = getCtx();
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(gain);
      source.start(0);
    },
    [isMuted, getCtx],
  );

  const toggleMute = useCallback(() => {
    setIsMuted((prev: boolean) => !prev);
  }, []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(Math.max(0, Math.min(100, v)));
  }, []);

  const playBomb1 = useCallback(() => playSfx("bomb1"), [playSfx]);
  const playBomb2 = useCallback(() => playSfx("bomb2"), [playSfx]);
  const playBomb3 = useCallback(() => playSfx("bomb3"), [playSfx]);
  const playHealth = useCallback(() => playSfx("health"), [playSfx]);
  const playMultiplier = useCallback(() => playSfx("multiplier"), [playSfx]);
  const playMoonrock = useCallback(() => playSfx("moonrock"), [playSfx]);
  const playPoints = useCallback(() => playSfx("points"), [playSfx]);
  const playPoints1 = useCallback(() => playSfx("points1"), [playSfx]);
  const playPoints5 = useCallback(() => playSfx("points5"), [playSfx]);
  const playPoints7 = useCallback(() => playSfx("points7"), [playSfx]);
  const playPoints8 = useCallback(() => playSfx("points8"), [playSfx]);
  const playPoints9 = useCallback(() => playSfx("points9"), [playSfx]);
  const playLevelStart = useCallback(() => playSfx("levelStart"), [playSfx]);
  const playLevelComplete = useCallback(
    () => playSfx("levelComplete"),
    [playSfx],
  );
  const playPulling = useCallback(() => playSfx("pulling"), [playSfx]);
  const playTap = useCallback(() => playSfx("tap"), [playSfx]);
  const playHover = useCallback(() => playSfx("hover"), [playSfx]);
  const playClick = useCallback(() => playSfx("click"), [playSfx]);

  return (
    <AudioCtx.Provider
      value={{
        isMuted,
        toggleMute,
        volume,
        setVolume,
        playBomb1,
        playBomb2,
        playBomb3,
        playHealth,
        playMultiplier,
        playMoonrock,
        playPoints,
        playPoints1,
        playPoints5,
        playPoints7,
        playPoints8,
        playPoints9,
        playLevelStart,
        playLevelComplete,
        playPulling,
        playTap,
        playHover,
        playClick,
      }}
    >
      {children}
    </AudioCtx.Provider>
  );
}
