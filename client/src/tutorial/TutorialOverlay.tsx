import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTutorial } from "./hooks";
import { TutorialStep } from "./steps";

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

// Match the codebase color system exactly
const COLORS = {
  green400: "#36F818",
  green400_48: "rgba(54, 248, 24, 0.48)",
  green400_24: "rgba(54, 248, 24, 0.24)",
  green400_15: "rgba(54, 248, 24, 0.15)",
  green400_10: "rgba(54, 248, 24, 0.10)",
  cardBg: "#0A1A0A",
  borderDark: "rgba(29, 58, 41, 0.8)",
  black100: "#040603",
};

export function TutorialOverlay() {
  const { shouldShowOverlay, currentConfig, state, advance } = useTutorial();
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(
    null,
  );
  const overlayRef = useRef<HTMLDivElement>(null);

  // Find and track the target element
  useEffect(() => {
    if (!shouldShowOverlay || !currentConfig.target) {
      setSpotlightRect(null);
      return;
    }

    const findTarget = () => {
      const el = document.querySelector(
        `[data-tutorial-id="${currentConfig.target}"]`,
      );
      if (el) {
        const rect = el.getBoundingClientRect();
        const padding = 8;
        setSpotlightRect({
          top: rect.top - padding,
          left: rect.left - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
        });
      } else {
        setSpotlightRect(null);
      }
    };

    findTarget();
    const handleUpdate = () => findTarget();
    window.addEventListener("resize", handleUpdate);
    window.addEventListener("scroll", handleUpdate, true);
    const interval = setInterval(findTarget, 200);
    const timeout = setTimeout(() => clearInterval(interval), 3000);

    return () => {
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("scroll", handleUpdate, true);
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [shouldShowOverlay, currentConfig.target]);

  const handleTap = useCallback(
    (e: React.PointerEvent) => {
      if (currentConfig.target && spotlightRect) {
        const { clientX, clientY } = e;
        const inSpotlight =
          clientX >= spotlightRect.left &&
          clientX <= spotlightRect.left + spotlightRect.width &&
          clientY >= spotlightRect.top &&
          clientY <= spotlightRect.top + spotlightRect.height;

        if (inSpotlight) {
          if (
            state.step === TutorialStep.PULL_PROMPT ||
            state.step === TutorialStep.BAG_EXPLAIN ||
            state.step === TutorialStep.CONTINUE_EXPLAIN ||
            state.step === TutorialStep.HOME_WELCOME
          ) {
            return;
          }
        }
      }

      if (
        state.step === TutorialStep.PULL_PROMPT ||
        state.step === TutorialStep.BAG_EXPLAIN ||
        state.step === TutorialStep.HOME_WELCOME
      ) {
        return;
      }

      e.stopPropagation();
      e.preventDefault();
      advance();
    },
    [advance, currentConfig.target, spotlightRect, state.step],
  );

  const tooltipStyle = useCallback((): React.CSSProperties => {
    if (!spotlightRect || !currentConfig.target) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        maxWidth: "min(340px, calc(100vw - 32px))",
      };
    }

    const pos = currentConfig.position ?? "bottom";
    const margin = 16;

    switch (pos) {
      case "top":
        return {
          bottom: `${window.innerHeight - spotlightRect.top + margin}px`,
          left: `${spotlightRect.left + spotlightRect.width / 2}px`,
          transform: "translateX(-50%)",
          maxWidth: "min(340px, calc(100vw - 32px))",
        };
      case "bottom":
        return {
          top: `${spotlightRect.top + spotlightRect.height + margin}px`,
          left: `${spotlightRect.left + spotlightRect.width / 2}px`,
          transform: "translateX(-50%)",
          maxWidth: "min(340px, calc(100vw - 32px))",
        };
      case "left":
        return {
          top: `${spotlightRect.top + spotlightRect.height / 2}px`,
          right: `${window.innerWidth - spotlightRect.left + margin}px`,
          transform: "translateY(-50%)",
          maxWidth: "min(280px, calc(100vw - 32px))",
        };
      case "right":
        return {
          top: `${spotlightRect.top + spotlightRect.height / 2}px`,
          left: `${spotlightRect.left + spotlightRect.width + margin}px`,
          transform: "translateY(-50%)",
          maxWidth: "min(280px, calc(100vw - 32px))",
        };
    }
  }, [spotlightRect, currentConfig.target, currentConfig.position]);

  const renderBackdrop = () => {
    if (spotlightRect) {
      const r = 12;
      return (
        <svg className="fixed inset-0 w-full h-full z-[200] pointer-events-none">
          <defs>
            <mask id="tutorial-mask">
              <rect width="100%" height="100%" fill="white" />
              <rect
                x={spotlightRect.left}
                y={spotlightRect.top}
                width={spotlightRect.width}
                height={spotlightRect.height}
                rx={r}
                ry={r}
                fill="black"
              />
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.78)"
            mask="url(#tutorial-mask)"
          />
        </svg>
      );
    }

    return (
      <div
        className="fixed inset-0 z-[200] pointer-events-none"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.78)" }}
      />
    );
  };

  const renderArrow = () => {
    if (!spotlightRect || !currentConfig.target) return null;

    const pos = currentConfig.position ?? "bottom";
    const arrowSize = 10;
    let arrowStyle: React.CSSProperties = {};
    let rotation = 0;

    switch (pos) {
      case "top":
        arrowStyle = {
          bottom: `${window.innerHeight - spotlightRect.top + 2}px`,
          left: `${spotlightRect.left + spotlightRect.width / 2}px`,
          transform: "translateX(-50%) rotate(180deg)",
        };
        break;
      case "bottom":
        arrowStyle = {
          top: `${spotlightRect.top + spotlightRect.height + 2}px`,
          left: `${spotlightRect.left + spotlightRect.width / 2}px`,
          transform: "translateX(-50%)",
        };
        break;
      case "left":
        rotation = 90;
        arrowStyle = {
          top: `${spotlightRect.top + spotlightRect.height / 2}px`,
          right: `${window.innerWidth - spotlightRect.left + 2}px`,
          transform: `translateY(-50%) rotate(${rotation}deg)`,
        };
        break;
      case "right":
        rotation = -90;
        arrowStyle = {
          top: `${spotlightRect.top + spotlightRect.height / 2}px`,
          left: `${spotlightRect.left + spotlightRect.width + 2}px`,
          transform: `translateY(-50%) rotate(${rotation}deg)`,
        };
        break;
    }

    return (
      <div className="fixed z-[202] pointer-events-none" style={arrowStyle}>
        <svg
          width={arrowSize * 2}
          height={arrowSize}
          viewBox={`0 0 ${arrowSize * 2} ${arrowSize}`}
        >
          <polygon
            points={`0,${arrowSize} ${arrowSize},0 ${arrowSize * 2},${arrowSize}`}
            fill={COLORS.cardBg}
            stroke={COLORS.green400_24}
            strokeWidth="1"
          />
        </svg>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {shouldShowOverlay && (
        <motion.div
          key={`tutorial-${state.step}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[200]"
          ref={overlayRef}
          onPointerDown={handleTap}
          style={{ touchAction: "none" }}
        >
          {renderBackdrop()}
          {renderArrow()}
          {/* Tooltip card — matches InfoCard/ConfirmationDialog styling */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="fixed z-[201] pointer-events-none"
            style={tooltipStyle()}
          >
            {/* Outer gradient border (matches GradientBorder green) */}
            <div
              className="rounded-2xl p-[1px]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(54, 248, 24, 0.25) 0%, rgba(54, 248, 24, 0) 100%)",
              }}
            >
              {/* Inner card */}
              <div
                className="rounded-2xl px-5 py-4"
                style={{
                  backgroundColor: COLORS.cardBg,
                  boxShadow: `0 0 40px ${COLORS.green400_10}, 0 4px 24px rgba(0, 0, 0, 0.6)`,
                }}
              >
                {currentConfig.title && (
                  <p
                    className="font-secondary text-sm tracking-[0.3em] uppercase mb-2"
                    style={{
                      color: COLORS.green400,
                      textShadow: `0 0 16px ${COLORS.green400_24}`,
                    }}
                  >
                    {currentConfig.title}
                  </p>
                )}
                {currentConfig.message && (
                  <p
                    className="font-secondary text-xs tracking-wide leading-relaxed whitespace-pre-line"
                    style={{ color: COLORS.green400_48 }}
                  >
                    {currentConfig.message}
                  </p>
                )}
                <div
                  className="mt-3 pt-2 flex justify-end"
                  style={{ borderTop: `1px solid ${COLORS.green400_10}` }}
                >
                  <span
                    className="font-secondary text-[10px] tracking-[0.25em] uppercase"
                    style={{ color: COLORS.green400_24 }}
                  >
                    TAP TO CONTINUE
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
