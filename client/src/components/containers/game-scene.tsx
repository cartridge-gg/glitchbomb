import { cva, type VariantProps } from "class-variance-authority";
import { AnimatePresence, motion } from "framer-motion";
import { type RefObject, useEffect, useMemo, useRef, useState } from "react";
import {
  CurseBadge,
  Distribution,
  type DistributionValues,
  Multiplier,
  Orb,
  Outcome,
  Puller,
} from "@/components/elements";
import {
  TapTooltip,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MultiplierMath } from "@/helpers/multiplier";
import { cn } from "@/lib/utils";

export interface OrbOutcome {
  variant: "point" | "bomb" | "multiplier" | "chip" | "moonrock" | "health";
  content: string;
  /** Base points before multiplier (e.g. 5 for Point5) */
  basePoints?: number;
  /** Points after multiplier (e.g. 7 when 5 × 1.5x) */
  multipliedPoints?: number;
  /** Active multiplier (e.g. 1.5) — only set when > 1 */
  activeMultiplier?: number;
}

export interface GameSceneProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gameSceneVariants> {
  lives: number;
  bombs: number;
  orbs: number;
  multiplier: number;
  values: DistributionValues;
  hasCurse?: boolean;
  curseLabel?: string;
  orb?: OrbOutcome;
  pullLoading?: boolean;
  showPercentages?: boolean;
  onPull: () => void;
  sceneRef?: RefObject<HTMLDivElement | null>;
  /** Ref to the points counter element for fly-to targeting */
  pointsTargetRef?: RefObject<HTMLElement | null>;
  /** Called when flying points reach the counter */
  onPointsArrive?: () => void;
}

const useViewportSize = () => {
  const [size, setSize] = useState(() => ({
    width: typeof window === "undefined" ? 0 : window.innerWidth,
    height: typeof window === "undefined" ? 0 : window.innerHeight,
  }));

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
};

const gameSceneVariants = cva("relative w-full h-full", {
  variants: {
    variant: {
      default: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const GameScene = ({
  lives,
  bombs,
  orbs,
  multiplier,
  values,
  hasCurse = false,
  curseLabel,
  orb,
  pullLoading = false,
  showPercentages = false,
  variant,
  className,
  onPull,
  sceneRef,
  pointsTargetRef,
  onPointsArrive,
  ...props
}: GameSceneProps) => {
  const { height } = useViewportSize();
  const clamp = (min: number, value: number, max: number) =>
    Math.min(Math.max(value, min), max);
  const viewportHeight = height || 800;

  const distributionSize = Math.round(clamp(200, viewportHeight * 0.34, 300));
  const distributionThickness = Math.round(
    clamp(30, viewportHeight * 0.065, 50),
  );
  const pullerSizePx = Math.round(clamp(130, distributionSize * 0.62, 190));
  const heightScale = clamp(0.7, viewportHeight / 800, 1);
  const badgeSizePx = Math.round(clamp(36, 72 * heightScale, 72));
  const badgeOffsetTop = Math.round(
    (badgeSizePx * 1.05 + pullerSizePx * 0.22) * heightScale,
  );
  const badgeOffsetX = 104;
  const multiplierMagnitude = Math.floor(
    Math.min(Math.max(1, multiplier), 5),
  ) as 1 | 2 | 3 | 4 | 5;
  const multiplierColor = useMemo(
    () => MultiplierMath.getMagnitudeColor(multiplierMagnitude),
    [multiplierMagnitude],
  );
  const outcomeScale = clamp(1.05, pullerSizePx / 120, 1.5);

  // Animation phases:
  // 0: initial
  // 1: orb visible
  // 2: outcome visible (base value for point orbs with multiplier)
  // 2.5: multiplied value revealed (point orbs with multiplier > 1 only)
  // 3: fly + fade-out
  const [phase, setPhase] = useState(0);
  const [showMultiplied, setShowMultiplied] = useState(false);
  const [flyParticle, setFlyParticle] = useState<{
    value: number;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);

  const outcomeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const hasMultiplierEffect =
    orb?.variant === "point" &&
    orb?.multipliedPoints !== undefined &&
    orb?.activeMultiplier !== undefined &&
    orb.activeMultiplier > 1;

  const isPointOrb = orb?.variant === "point";

  useEffect(() => {
    if (orb) {
      setPhase(1);
      setShowMultiplied(false);
      setFlyParticle(null);

      // Phase 2: Show Outcome
      const phase2Timer = setTimeout(() => {
        setPhase(2);
      }, 500);

      // Phase 2.5: Multiplier transformation (only for point orbs with mult > 1)
      const multTimer = hasMultiplierEffect
        ? setTimeout(() => {
            setShowMultiplied(true);
          }, 1100)
        : undefined;

      // Phase 3: Fly + fade
      const totalOutcomeMs = hasMultiplierEffect ? 2300 : 2000;
      const phase3Timer = setTimeout(() => {
        setPhase(3);

        // Launch flying particle for point orbs
        if (isPointOrb) {
          const outcomeEl = outcomeRef.current;
          const targetEl = pointsTargetRef?.current;
          if (outcomeEl && targetEl) {
            const startRect = outcomeEl.getBoundingClientRect();
            const endRect = targetEl.getBoundingClientRect();
            setFlyParticle({
              value: hasMultiplierEffect
                ? orb.multipliedPoints!
                : (orb.basePoints ?? 0),
              startX: startRect.left + startRect.width / 2,
              startY: startRect.top + startRect.height / 2,
              endX: endRect.left + endRect.width / 2,
              endY: endRect.top + endRect.height / 2,
            });

            // Fire callback when particle arrives
            setTimeout(() => {
              onPointsArrive?.();
            }, 350);
          } else {
            // No target ref — fire immediately
            onPointsArrive?.();
          }
        }
      }, totalOutcomeMs);

      return () => {
        clearTimeout(phase2Timer);
        if (multTimer) clearTimeout(multTimer);
        clearTimeout(phase3Timer);
      };
    }
    setPhase(0);
    setShowMultiplied(false);
    setFlyParticle(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orb]);

  // Determine displayed outcome content
  const outcomeContent = useMemo(() => {
    if (!orb) return "";
    if (hasMultiplierEffect && showMultiplied) {
      return `+${orb.multipliedPoints} pts`;
    }
    return orb.content;
  }, [orb, hasMultiplierEffect, showMultiplied]);

  return (
    <div
      ref={containerRef}
      className={gameSceneVariants({ variant, className })}
      {...props}
    >
      {/* Distribution */}
      <div
        ref={sceneRef}
        className={cn(
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300",
          phase === 0 && "opacity-100",
          (phase === 1 || phase === 2) && "opacity-10",
          phase === 3 && "opacity-100",
        )}
      >
        <Distribution
          values={values}
          size={distributionSize}
          thickness={distributionThickness}
          showPercentages={showPercentages}
        />
      </div>

      {/* Puller */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
          phase === 0 && "opacity-100 z-20",
          (phase === 1 || phase === 2) && "opacity-0 z-0",
          phase === 3 && "opacity-100 z-20",
        )}
      >
        <div className="relative">
          <Puller
            onClick={onPull}
            variant={
              lives < 2
                ? "bomb"
                : lives < 4
                  ? "multiplier"
                  : lives < 5
                    ? "default"
                    : "point"
            }
            size="md"
            sizePx={pullerSizePx}
            orbs={orbs}
            bombs={bombs}
            isLoading={pullLoading}
          />
          {hasCurse && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="absolute z-30"
                    style={{ top: -badgeOffsetTop, left: -badgeOffsetX }}
                  >
                    <CurseBadge size={badgeSizePx} />
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="bg-[#1A120A] text-orange-100 font-secondary text-[10px] tracking-[0.25em] uppercase border border-orange-500/50"
                >
                  {curseLabel ?? "Random Curse"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {/* Multiplier Badge - top right of puller */}
          <div
            className="absolute z-30"
            style={{ top: -badgeOffsetTop, right: -badgeOffsetX }}
          >
            <TooltipProvider delayDuration={0}>
              <TapTooltip>
                <TooltipTrigger asChild>
                  <div style={{ width: badgeSizePx, height: badgeSizePx }}>
                    <Multiplier
                      count={multiplier}
                      cornerRadius={50}
                      className="h-full w-full"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  align="center"
                  collisionPadding={16}
                  className="bg-[#0A0E1A] font-secondary text-[10px] tracking-[0.25em] uppercase border"
                  style={{
                    color: multiplierColor,
                    borderColor: `${multiplierColor}40`,
                  }}
                >
                  Your current multiplier
                </TooltipContent>
              </TapTooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <AnimatePresence>
          {(phase === 1 || phase === 2) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{
                opacity: phase === 2 ? 0.5 : 1,
                scale: 1,
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
            >
              <Orb
                variant={orb?.variant ?? "default"}
                style={{
                  boxShadow:
                    "0px 0px 128px 96px #000000DD, 0px 0px 48px 16px #FFFFFF80",
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Outcome */}
      <div
        ref={outcomeRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <AnimatePresence>
          {phase === 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={
                isPointOrb
                  ? { opacity: 0, scale: 0.4, y: -120 }
                  : { opacity: 0, scale: 0.8, y: -10 }
              }
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 15,
                mass: 0.8,
              }}
            >
              <div
                className="flex flex-col items-center gap-0"
                style={{ transform: `scale(${outcomeScale})` }}
              >
                <motion.div
                  animate={
                    showMultiplied
                      ? { scale: [1.2, 1], opacity: [0.7, 1] }
                      : { scale: 1 }
                  }
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <Outcome
                    content={outcomeContent}
                    variant={orb?.variant ?? "default"}
                    size="md"
                  />
                </motion.div>
                {/* Multiplier breakdown — styled like Outcome for visibility */}
                <AnimatePresence>
                  {hasMultiplierEffect && showMultiplied && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.3, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 15,
                      }}
                      className="mt-1"
                    >
                      <Outcome
                        content={`${orb!.basePoints} × ${orb!.activeMultiplier}x`}
                        variant="multiplier"
                        size="sm"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Flying points particle */}
      <AnimatePresence>
        {flyParticle && flyParticle.value > 0 && (
          <motion.div
            className="fixed z-[60] pointer-events-none"
            style={{ left: 0, top: 0 }}
            initial={{
              x: flyParticle.startX,
              y: flyParticle.startY,
              scale: 1,
              opacity: 1,
            }}
            animate={{
              x: flyParticle.endX,
              y: flyParticle.endY,
              scale: 0.5,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <span
              className="font-rubik text-2xl font-bold text-green-400"
              style={{
                textShadow:
                  "0 0 16px rgba(74, 222, 128, 0.8), 0 0 32px rgba(74, 222, 128, 0.4)",
                transform: "translate(-50%, -50%)",
                display: "inline-block",
              }}
            >
              +{flyParticle.value}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
