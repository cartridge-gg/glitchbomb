import { useEffect, useRef, useState } from "react";

const GLITCH_CHARS = "!@#$%&*<>{}[]=/\\|~^";
const STEP_MS = 35;
const GLITCH_STEPS = 6;

const SCRAMBLE_MS = 60;

interface GlitchTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  /** When true, continuously scrambles the text */
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

  // Continuous scramble loop
  useEffect(() => {
    if (!scramble) {
      setDisplay(text);
      return;
    }

    const tick = () => {
      let result = "";
      for (let i = 0; i < text.length; i++) {
        result +=
          Math.random() < 0.4
            ? text[i]
            : GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
      }
      setDisplay(result);
      frameRef.current = setTimeout(tick, SCRAMBLE_MS);
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
