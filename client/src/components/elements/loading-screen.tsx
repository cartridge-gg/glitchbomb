import { useEffect, useState } from "react";
import { GlitchText } from "@/components/ui/glitch-text";

const MIN_DISPLAY_MS = 1200;

interface LoadingScreenProps {
  isLoading: boolean;
}

export function LoadingScreen({ isLoading }: LoadingScreenProps) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const [minElapsed, setMinElapsed] = useState(false);

  // Ensure minimum display time so it doesn't just flash
  useEffect(() => {
    const timer = setTimeout(() => setMinElapsed(true), MIN_DISPLAY_MS);
    return () => clearTimeout(timer);
  }, []);

  // Start fade-out once data is ready AND minimum time elapsed
  useEffect(() => {
    if (!isLoading && minElapsed) {
      setFading(true);
      const timer = setTimeout(() => setVisible(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, minElapsed]);

  if (!visible) return null;

  return (
    <div
      className={`loading-screen ${fading ? "loading-screen-exit" : ""}`}
      aria-label="Loading"
    >
      <div className="loading-screen-scanlines" aria-hidden="true" />
      <div className="loading-screen-content">
        <h1 className="flex items-center gap-1 uppercase leading-none glitch-text">
          <span className="text-green-400 text-3xl font-glitch font-thin tracking-tight">
            Glitch
          </span>
          <span className="text-white text-3xl tracking-tight">Bomb</span>
        </h1>
        <div className="loading-screen-status">
          <GlitchText
            text="LOADING"
            className="text-green-600 text-xs font-secondary tracking-[0.3em] uppercase"
            scramble
          />
        </div>
        <div className="loading-screen-bar">
          <div className="loading-screen-bar-fill" />
        </div>
      </div>
    </div>
  );
}
