import { useEffect, useRef, useState } from "react";

const GLITCH_CHARS = "!@#$%&*<>{}[]=/\\|~^";
const STEP_MS = 35;
const GLITCH_STEPS = 6;

interface GlitchTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

export const GlitchText = ({ text, className, style }: GlitchTextProps) => {
  const [display, setDisplay] = useState(text);
  const prevText = useRef(text);
  const frameRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (text === prevText.current) return;
    prevText.current = text;

    // Cancel any running animation
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

      // Progressively resolve characters from left to right
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

  return (
    <span className={className} style={style}>
      {display}
    </span>
  );
};
