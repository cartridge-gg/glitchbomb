import { useEffect, useRef, useState } from "react";

const GLITCH_CHARS = "!@#$%&*<>{}[]=/\\|~^";
const STEP_MS = 35;
const GLITCH_STEPS = 6;

const BURST_STEP_MS = 45;
const BURST_GLITCH_STEPS = 12;

const SCRAMBLE_STEP_MS = 100;
const SCRAMBLE_GLITCH_STEPS = 8;
const SCRAMBLE_HOLD_MS = 800;

interface GlitchTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  /** When true, loops: readable → glitch → readable → glitch */
  scramble?: boolean;
  /** Increment to trigger a dramatic burst glitch on next text change */
  burst?: number;
}

export const GlitchText = ({
  text,
  className,
  style,
  scramble,
  burst = 0,
}: GlitchTextProps) => {
  const [display, setDisplay] = useState(text);
  const [isBursting, setIsBursting] = useState(false);
  const prevText = useRef(text);
  const frameRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const burstRef = useRef(burst);

  // Track burst changes
  useEffect(() => {
    burstRef.current = burst;
  }, [burst]);

  // Transition animation when text changes
  useEffect(() => {
    if (text === prevText.current) return;
    prevText.current = text;

    if (frameRef.current) {
      clearTimeout(frameRef.current);
    }

    const useBurst = burstRef.current > 0;
    const steps = useBurst ? BURST_GLITCH_STEPS : GLITCH_STEPS;
    const stepMs = useBurst ? BURST_STEP_MS : STEP_MS;

    if (useBurst) setIsBursting(true);

    let step = 0;
    const maxLen = Math.max(prevText.current.length, text.length);

    const tick = () => {
      step++;
      if (step >= steps) {
        setDisplay(text);
        frameRef.current = null;
        if (useBurst) setIsBursting(false);
        return;
      }

      const progress = step / steps;
      const resolved = useBurst
        ? // Burst: stay fully corrupted longer, then resolve fast in last 30%
          progress < 0.7
          ? 0
          : Math.floor(((progress - 0.7) / 0.3) * text.length)
        : Math.floor(progress * text.length);

      let result = "";
      for (let i = 0; i < maxLen; i++) {
        if (i < resolved) {
          result += text[i] ?? "";
        } else if (i < text.length) {
          result +=
            GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        }
      }
      setDisplay(result);
      frameRef.current = setTimeout(tick, stepMs);
    };

    tick();

    return () => {
      if (frameRef.current) {
        clearTimeout(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [text]);

  // Scramble loop: hold readable → glitch out → hold readable → repeat
  useEffect(() => {
    if (!scramble) {
      setDisplay(text);
      return;
    }

    let step = 0;
    let phase: "hold" | "glitch" = "hold";

    const tick = () => {
      if (phase === "hold") {
        setDisplay(text);
        phase = "glitch";
        step = 0;
        frameRef.current = setTimeout(tick, SCRAMBLE_HOLD_MS);
        return;
      }

      // Glitch phase: progressively corrupt then resolve
      step++;
      const half = SCRAMBLE_GLITCH_STEPS / 2;
      // First half corrupts more, second half resolves back
      const corruption = step <= half ? step / half : 1 - (step - half) / half;

      let result = "";
      for (let i = 0; i < text.length; i++) {
        result +=
          Math.random() < corruption
            ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
            : text[i];
      }
      setDisplay(result);

      if (step >= SCRAMBLE_GLITCH_STEPS) {
        phase = "hold";
        frameRef.current = setTimeout(tick, SCRAMBLE_STEP_MS);
      } else {
        frameRef.current = setTimeout(tick, SCRAMBLE_STEP_MS);
      }
    };

    tick();

    return () => {
      if (frameRef.current) {
        clearTimeout(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [scramble, text]);

  const burstStyle: React.CSSProperties = isBursting
    ? {
        ...style,
        textShadow: `${style?.textShadow ? `${style.textShadow}, ` : ""}-3px 0 rgba(255, 0, 50, 0.8), 3px 0 rgba(0, 100, 255, 0.8)`,
      }
    : (style ?? {});

  return (
    <span className={className} style={burstStyle}>
      {display}
    </span>
  );
};
