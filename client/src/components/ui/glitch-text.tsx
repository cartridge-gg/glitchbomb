import { useEffect, useRef, useState } from "react";

const GLITCH_CHARS = "!@#$%&*<>{}[]=/\\|~^";
const STEP_MS = 35;
const GLITCH_STEPS = 6;

const SCRAMBLE_STEP_MS = 100;
const SCRAMBLE_GLITCH_STEPS = 8;
const SCRAMBLE_HOLD_MS = 800;

interface GlitchTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  /** When true, loops: readable → glitch → readable → glitch */
  scramble?: boolean;
}

export const GlitchText = ({
  text,
  className,
  style,
  scramble,
}: GlitchTextProps) => {
  const [display, setDisplay] = useState(text);
  const prevText = useRef(text);
  const frameRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Transition animation when text changes
  useEffect(() => {
    if (text === prevText.current) return;
    prevText.current = text;

    if (frameRef.current) {
      clearTimeout(frameRef.current);
    }

    let step = 0;
    const maxLen = Math.max(prevText.current.length, text.length);

    const tick = () => {
      step++;
      if (step >= GLITCH_STEPS) {
        setDisplay(text);
        frameRef.current = null;
        return;
      }

      const resolved = Math.floor((step / GLITCH_STEPS) * text.length);
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
      frameRef.current = setTimeout(tick, STEP_MS);
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

  return (
    <span className={className} style={style}>
      {display}
    </span>
  );
};
