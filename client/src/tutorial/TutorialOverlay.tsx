import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useTutorial } from "./hooks";
import { TutorialStep } from "./steps";

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const COLORS = {
  green400: "#36F818",
  green400_64: "rgba(54, 248, 24, 0.64)",
  green400_32: "rgba(54, 248, 24, 0.32)",
  green400_10: "rgba(54, 248, 24, 0.10)",
  cardBg: "#0A1A0A",
};

/** Steps where clicks inside the spotlight must reach the underlying button */
const INTERACTIVE_STEPS = new Set([
  TutorialStep.HOME_WELCOME,
  TutorialStep.PULL_PROMPT,
  TutorialStep.BAG_EXPLAIN,
  TutorialStep.CONTINUE_EXPLAIN,
]);

/** Steps where tapping outside the spotlight does nothing (must use the target) */
const TARGET_ONLY_STEPS = new Set([
  TutorialStep.HOME_WELCOME,
  TutorialStep.PULL_PROMPT,
  TutorialStep.BAG_EXPLAIN,
]);

export function TutorialOverlay() {
  const { shouldShowOverlay, currentConfig, state, advance, completeTutorial } =
    useTutorial();
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(
    null,
  );

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
        const padding = currentConfig.spotlightShape === "circle" ? 16 : 8;

        if (currentConfig.spotlightShape === "circle") {
          // Make spotlight a square centered on the element (for circular cutout)
          const size = Math.max(rect.width, rect.height) + padding * 2;
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          setSpotlightRect({
            top: cy - size / 2,
            left: cx - size / 2,
            width: size,
            height: size,
          });
        } else {
          setSpotlightRect({
            top: rect.top - padding,
            left: rect.left - padding,
            width: rect.width + padding * 2,
            height: rect.height + padding * 2,
          });
        }
      } else {
        setSpotlightRect(null);
      }
    };

    findTarget();
    const handleUpdate = () => findTarget();
    window.addEventListener("resize", handleUpdate);
    window.addEventListener("scroll", handleUpdate, true);
    const interval = setInterval(findTarget, 150);
    const timeout = setTimeout(() => clearInterval(interval), 10000);

    return () => {
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("scroll", handleUpdate, true);
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [shouldShowOverlay, currentConfig.target, currentConfig.spotlightShape]);

  const handleBackdropClick = useCallback(
    (e: React.PointerEvent) => {
      // For target-only steps, ignore clicks outside the spotlight
      if (TARGET_ONLY_STEPS.has(state.step)) return;
      e.stopPropagation();
      e.preventDefault();
      advance();
    },
    [advance, state.step],
  );

  // Compute effective tooltip position with mobile-aware fallbacks
  const effectivePosition = (() => {
    if (!spotlightRect || !currentConfig.target)
      return currentConfig.position ?? "bottom";

    const pos = currentConfig.position ?? "bottom";
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const margin = 12;
    let p = pos;

    // Fall back left/right to top/bottom on narrow screens
    if ((p === "left" || p === "right") && vw < 480) {
      const targetCenterY = spotlightRect.top + spotlightRect.height / 2;
      p = targetCenterY > vh / 2 ? "top" : "bottom";
    }

    // Flip if not enough space for tooltip
    if (p === "bottom") {
      const spaceBelow =
        vh - (spotlightRect.top + spotlightRect.height + margin);
      if (spaceBelow < 100) p = "top";
    } else if (p === "top") {
      const spaceAbove = spotlightRect.top - margin;
      if (spaceAbove < 100) p = "bottom";
    }

    return p;
  })();

  const tooltipStyle = (): React.CSSProperties => {
    const safeInset = 16;
    const maxW = `min(340px, calc(100vw - ${safeInset * 2}px))`;

    if (!spotlightRect || !currentConfig.target) {
      return {
        top: "50%",
        left: `${safeInset}px`,
        right: `${safeInset}px`,
        transform: "translateY(-50%)",
        maxWidth: maxW,
        marginInline: "auto",
      };
    }

    const margin = 12;
    const vh = window.innerHeight;

    switch (effectivePosition) {
      case "top": {
        const bottomVal = vh - spotlightRect.top + margin;
        return {
          bottom: `${Math.min(bottomVal, vh - safeInset)}px`,
          left: `${safeInset}px`,
          right: `${safeInset}px`,
          maxWidth: maxW,
          marginInline: "auto",
        };
      }
      case "bottom":
        return {
          top: `${Math.max(spotlightRect.top + spotlightRect.height + margin, safeInset)}px`,
          left: `${safeInset}px`,
          right: `${safeInset}px`,
          maxWidth: maxW,
          marginInline: "auto",
        };
      case "left": {
        const topVal = spotlightRect.top + spotlightRect.height / 2;
        return {
          top: `${Math.max(safeInset, Math.min(topVal, vh - safeInset))}px`,
          right: `${window.innerWidth - spotlightRect.left + margin}px`,
          transform: "translateY(-50%)",
          maxWidth: `min(280px, calc(100vw - ${safeInset * 2}px))`,
        };
      }
      case "right": {
        const topVal = spotlightRect.top + spotlightRect.height / 2;
        return {
          top: `${Math.max(safeInset, Math.min(topVal, vh - safeInset))}px`,
          left: `${spotlightRect.left + spotlightRect.width + margin}px`,
          transform: "translateY(-50%)",
          maxWidth: `min(280px, calc(100vw - ${safeInset * 2}px))`,
        };
      }
    }
  };

  const isInteractive = INTERACTIVE_STEPS.has(state.step);
  const isCircle = currentConfig.spotlightShape === "circle";
  const backdropColor = "rgba(0, 0, 0, 0.80)";

  /**
   * Builds an SVG clip-path that covers the full viewport with a hole cut out
   * for the spotlight area. clip-path affects both rendering AND hit-testing,
   * so clicks inside the hole pass through to the underlying button.
   */
  const buildClipPath = () => {
    if (!spotlightRect) return undefined;
    const { top, left, width, height } = spotlightRect;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (isCircle) {
      const cx = left + width / 2;
      const cy = top + height / 2;
      const r = Math.max(width, height) / 2;
      return `path(evenodd, 'M 0 0 H ${vw} V ${vh} H 0 Z M ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} Z')`;
    }

    const rx = 12;
    const x1 = left;
    const y1 = top;
    const x2 = left + width;
    const y2 = top + height;
    return `path(evenodd, 'M 0 0 H ${vw} V ${vh} H 0 Z M ${x1 + rx} ${y1} H ${x2 - rx} Q ${x2} ${y1} ${x2} ${y1 + rx} V ${y2 - rx} Q ${x2} ${y2} ${x2 - rx} ${y2} H ${x1 + rx} Q ${x1} ${y2} ${x1} ${y2 - rx} V ${y1 + rx} Q ${x1} ${y1} ${x1 + rx} ${y1} Z')`;
  };

  const renderBackdrop = () => {
    if (spotlightRect && isInteractive) {
      // clip-path creates a visual + pointer-event hole for the spotlight
      return (
        <div
          className="fixed inset-0 z-[200]"
          style={{
            backgroundColor: backdropColor,
            pointerEvents: "auto",
            clipPath: buildClipPath(),
          }}
          onPointerDown={handleBackdropClick}
        />
      );
    }

    // Non-interactive: full-screen backdrop (visual hole only, clicks captured everywhere)
    if (spotlightRect) {
      const { top, left, width, height } = spotlightRect;
      const cx = left + width / 2;
      const cy = top + height / 2;
      const r = Math.max(width, height) / 2;
      const rr = 12;
      return (
        <svg
          className="fixed inset-0 w-full h-full z-[200]"
          onPointerDown={handleBackdropClick}
          style={{ touchAction: "none", pointerEvents: "auto" }}
        >
          <defs>
            <mask id="tutorial-mask">
              <rect width="100%" height="100%" fill="white" />
              {isCircle ? (
                <circle cx={cx} cy={cy} r={r} fill="black" />
              ) : (
                <rect
                  x={left}
                  y={top}
                  width={width}
                  height={height}
                  rx={rr}
                  ry={rr}
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill={backdropColor}
            mask="url(#tutorial-mask)"
          />
        </svg>
      );
    }

    return (
      <div
        className="fixed inset-0 z-[200]"
        style={{
          backgroundColor: backdropColor,
          touchAction: "none",
          pointerEvents: "auto",
        }}
        onPointerDown={handleBackdropClick}
      />
    );
  };

  const renderArrow = () => {
    if (!spotlightRect || !currentConfig.target) return null;

    const pos = effectivePosition;
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
            stroke={COLORS.green400_32}
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
          className="fixed inset-0 z-[200] pointer-events-none"
        >
          {renderBackdrop()}
          {renderArrow()}
          {/* Tooltip card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.2 }}
            className="fixed z-[201] pointer-events-none"
            style={tooltipStyle()}
          >
            {state.step === TutorialStep.HOME_WELCOME && (
              <div className="flex justify-end mb-2">
                <button
                  type="button"
                  className="font-secondary text-[10px] tracking-[0.25em] uppercase pointer-events-auto px-3 py-1.5 rounded-full"
                  style={{
                    color: COLORS.green400_64,
                    border: `1px solid ${COLORS.green400_32}`,
                    backgroundColor: COLORS.cardBg,
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    completeTutorial();
                  }}
                >
                  SKIP TUTORIAL
                </button>
              </div>
            )}
            <div
              className="rounded-2xl p-[1px]"
              style={{
                background:
                  "linear-gradient(180deg, #35F81840 0%, #36F81800 100%)",
              }}
            >
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{
                  backgroundColor: COLORS.cardBg,
                  boxShadow:
                    "0 0 24px rgba(54, 248, 24, 0.08), 0 4px 24px rgba(0, 0, 0, 0.5)",
                  padding: "clamp(10px, 2svh, 16px) clamp(12px, 2.5svh, 20px)",
                }}
              >
                {/* CRT scanlines — animated scroll */}
                <div
                  className="absolute inset-x-0 pointer-events-none animate-[tutorial-scanlines_0.15s_linear_infinite]"
                  style={{
                    top: "-4px",
                    bottom: 0,
                    backgroundImage:
                      "repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, rgba(0, 0, 0, 0.12) 2px, rgba(0, 0, 0, 0.12) 4px)",
                    backgroundSize: "100% 4px",
                    opacity: 0.5,
                  }}
                />
                {currentConfig.title && (
                  <p
                    className="relative font-secondary tracking-[0.3em] uppercase"
                    style={{
                      color: COLORS.green400,
                      textShadow: `0 0 8px ${COLORS.green400_64}, 0 0 2px ${COLORS.green400}`,
                      fontSize: "clamp(0.75rem, 1.8svh, 0.875rem)",
                      marginBottom: "clamp(4px, 1svh, 8px)",
                    }}
                  >
                    {currentConfig.title}
                  </p>
                )}
                {currentConfig.message && (
                  <p
                    className="relative font-secondary tracking-wide leading-relaxed whitespace-pre-line"
                    style={{
                      color: COLORS.green400_64,
                      textShadow: `0 0 6px ${COLORS.green400_32}`,
                      fontSize: "clamp(0.7rem, 1.5svh, 0.8rem)",
                    }}
                  >
                    {currentConfig.message}
                  </p>
                )}
                <div
                  className="relative flex justify-end"
                  style={{
                    borderTop: `1px solid ${COLORS.green400_10}`,
                    marginTop: "clamp(6px, 1.5svh, 12px)",
                    paddingTop: "clamp(4px, 1svh, 8px)",
                  }}
                >
                  <span
                    className="font-secondary tracking-[0.25em] uppercase"
                    style={{
                      color: COLORS.green400_32,
                      fontSize: "clamp(0.55rem, 1.1svh, 0.65rem)",
                    }}
                  >
                    {TARGET_ONLY_STEPS.has(state.step)
                      ? "TAP THE HIGHLIGHTED AREA"
                      : "TAP TO CONTINUE"}
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
