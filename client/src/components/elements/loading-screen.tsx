import { useEffect, useState } from "react";
import { GlitchText } from "@/components/ui/glitch-text";
import { useLoadingContext } from "@/contexts/use-loading";

const MIN_DISPLAY_MS = 1200;

export function LoadingScreen() {
  const { allReady } = useLoadingContext();
  const [phase, setPhase] = useState<"visible" | "fading" | "hidden">(
    "visible",
  );

  // Re-show when data starts loading again (e.g. navigating back to home,
  // or purchase completing and transitioning to the game page)
  useEffect(() => {
    if (!allReady && (phase === "hidden" || phase === "fading")) {
      setPhase("visible");
    }
  }, [allReady, phase]);

  // Start fade-out after min display time when ready
  useEffect(() => {
    if (!allReady || phase !== "visible") return;
    const timer = setTimeout(() => setPhase("fading"), MIN_DISPLAY_MS);
    return () => clearTimeout(timer);
  }, [allReady, phase]);

  // Hide after fade completes
  useEffect(() => {
    if (phase !== "fading") return;
    const timer = setTimeout(() => setPhase("hidden"), 500);
    return () => clearTimeout(timer);
  }, [phase]);

  // Show immediately when not ready (bypasses phase state machine for instant
  // re-show). Also show during visible/fading phases for the fade-out sequence.
  const isVisible = !allReady || phase !== "hidden";

  return (
    <div
      className={`loading-screen ${phase === "fading" && allReady ? "loading-screen-exit" : ""} ${!isVisible ? "loading-screen-hidden" : ""}`}
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
