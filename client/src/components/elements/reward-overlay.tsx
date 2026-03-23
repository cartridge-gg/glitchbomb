import { AnimatePresence, motion } from "framer-motion";
import { type RefObject, useCallback, useMemo, useRef, useState } from "react";
import { MoonrockIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  TapTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { type Orb as OrbModel, OrbType } from "@/models";
import { OrbDisplay } from "./orb-display";
import { getOrbColor, getOrbIcon } from "./orb-utils";
import { setRewardOverlayDismissed } from "./reward-overlay-prefs";

export interface RewardItem {
  variant: "moonrock" | "chip" | "point" | "multiplier";
  count: number;
  label: string;
}

export type DistributionKey =
  | "bombs"
  | "points"
  | "multipliers"
  | "health"
  | "special";

export interface RewardOverlayProps {
  open: boolean;
  onDismiss: () => void;
  onAnimationStart?: () => void;
  onOrbArrive?: (key: DistributionKey) => void;
  onTakeAll?: () => void;
  targetRef?: RefObject<HTMLElement | null>;
  orbTargetRef?: RefObject<HTMLElement | null>;
  heading?: string;
  actionLabel?: string;
  reward: RewardItem;
  orbs?: OrbModel[];
}

const PARTICLE_COUNT = 6;
const PARTICLE_STAGGER_MS = 50;
const ANIMATION_START_DELAY_MS = 300;

const ORB_STAGGER_MS = 60;
const ORB_FLIGHT_S = 0.4;
const ORB_ARRIVE_OFFSET_MS = 250;

interface OrbParticle {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  delay: number;
  orb: OrbModel;
  distributionKey: DistributionKey;
}

const bombDamage = (orb: OrbModel): number | undefined => {
  if (orb.value === OrbType.Bomb1 || orb.value === OrbType.StickyBomb) return 1;
  if (orb.value === OrbType.Bomb2) return 2;
  if (orb.value === OrbType.Bomb3) return 3;
  return undefined;
};

const orbToDistributionKey = (orb: OrbModel): DistributionKey => {
  if (orb.isBomb()) return "bombs";
  if (orb.isMultiplier()) return "multipliers";
  if (orb.isHealth()) return "health";
  if (orb.isChips()) return "special";
  if (orb.isMoonrock()) return "special";
  return "points";
};

export const RewardOverlay = ({
  open,
  onDismiss,
  onAnimationStart,
  onOrbArrive,
  onTakeAll,
  targetRef,
  orbTargetRef,
  heading = "YOU GET",
  actionLabel = "LET'S GO",
  reward,
  orbs,
}: RewardOverlayProps) => {
  const [isExiting, setIsExiting] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Sort orbs by kind
  const sortedOrbs = useMemo(() => {
    if (!orbs || orbs.length === 0) return [];
    const kindOrder = (o: OrbModel) => {
      if (o.isBomb()) return 0;
      if (o.isPoint()) return 1;
      if (o.isMultiplier()) return 2;
      if (o.isHealth()) return 3;
      if (o.isChips()) return 4;
      if (o.isMoonrock()) return 5;
      return 6;
    };
    return [...orbs].sort((a, b) => kindOrder(a) - kindOrder(b));
  }, [orbs]);

  const [particles, setParticles] = useState<
    {
      id: number;
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      delay: number;
    }[]
  >([]);
  const orbRef = useRef<HTMLDivElement>(null);
  const orbElementRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const [orbParticles, setOrbParticles] = useState<OrbParticle[]>([]);

  const setOrbElementRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      if (el) {
        orbElementRefs.current.set(index, el);
      } else {
        orbElementRefs.current.delete(index);
      }
    },
    [],
  );

  const handleTakeAll = () => {
    if (isExiting) return;
    setIsExiting(true);
    onTakeAll?.();

    if (dontShowAgain) {
      setRewardOverlayDismissed();
    }

    // Moonrock particles → header
    const orbRect = orbRef.current?.getBoundingClientRect();
    const targetRect = targetRef?.current?.getBoundingClientRect();

    const startX = orbRect
      ? orbRect.left + orbRect.width / 2
      : window.innerWidth / 2;
    const startY = orbRect
      ? orbRect.top + orbRect.height / 2
      : window.innerHeight / 2;
    const endX = targetRect
      ? targetRect.left + targetRect.width / 2
      : window.innerWidth / 2;
    const endY = targetRect ? targetRect.top + targetRect.height / 2 : 0;

    const newParticles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      startX: startX + (Math.random() - 0.5) * 40,
      startY: startY + (Math.random() - 0.5) * 20,
      endX,
      endY,
      delay: (i * PARTICLE_STAGGER_MS) / 1000,
    }));
    setParticles(newParticles);

    // Orb icons → chart center (direct flight)
    const orbTargetRect = orbTargetRef?.current?.getBoundingClientRect();
    if (orbTargetRect && sortedOrbs.length > 0) {
      const chartCenterX = orbTargetRect.left + orbTargetRect.width / 2;
      const chartCenterY = orbTargetRect.top + orbTargetRect.height / 2;

      const newOrbParticles: OrbParticle[] = sortedOrbs.map((orb, i) => {
        const el = orbElementRefs.current.get(i);
        const elRect = el?.getBoundingClientRect();
        return {
          id: `${orb.value}-${i}`,
          startX: elRect
            ? elRect.left + elRect.width / 2
            : window.innerWidth / 2,
          startY: elRect
            ? elRect.top + elRect.height / 2
            : window.innerHeight / 2,
          endX: chartCenterX,
          endY: chartCenterY,
          delay: i * ORB_STAGGER_MS,
          orb,
          distributionKey: orbToDistributionKey(orb),
        };
      });
      setOrbParticles(newOrbParticles);

      // Fire onOrbArrive as each icon lands
      for (const p of newOrbParticles) {
        setTimeout(
          () => onOrbArrive?.(p.distributionKey),
          p.delay + ORB_ARRIVE_OFFSET_MS,
        );
      }
    }

    // Header count-up
    setTimeout(() => {
      onAnimationStart?.();
    }, ANIMATION_START_DELAY_MS);

    // Dismiss
    const lastOrbMs =
      sortedOrbs.length > 0
        ? (sortedOrbs.length - 1) * ORB_STAGGER_MS + ORB_FLIGHT_S * 1000 + 150
        : 600;
    setTimeout(
      () => {
        setIsExiting(false);
        setParticles([]);
        setOrbParticles([]);
        onDismiss();
      },
      Math.max(600, lastOrbMs),
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={`fixed inset-0 z-50 flex items-center justify-center ${isExiting ? "" : "backdrop-blur-md"}`}
          style={{
            background: isExiting
              ? "transparent"
              : "radial-gradient(circle, rgba(0, 0, 0, 0.6) 0%, transparent 70%)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <TooltipProvider delayDuration={0}>
            <div className="flex flex-col items-center gap-6">
              {/* Heading */}
              <motion.p
                className="font-secondary text-sm tracking-[0.3em] text-green-400"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: isExiting ? 0 : 1, y: 0 }}
                transition={isExiting ? { duration: 0.2 } : { delay: 0.1 }}
              >
                {heading}
              </motion.p>

              {/* Rewards grid — moonrocks in center, orbs below */}
              <motion.div
                className="flex flex-col items-center gap-4"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: isExiting ? 0.5 : 1,
                  opacity: isExiting ? 0 : 1,
                }}
                transition={
                  isExiting
                    ? { duration: 0.2 }
                    : {
                        delay: 0.25,
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }
                }
              >
                {/* Moonrocks — label + header-button style pill */}
                <div className="flex flex-col items-center gap-1.5 w-[clamp(140px,40vw,200px)]">
                  <span className="font-secondary text-xs tracking-[0.2em] text-yellow-400 uppercase">
                    Moonrocks
                  </span>
                  <div
                    ref={orbRef}
                    className="w-full flex items-center justify-center gap-2 min-h-[clamp(32px,4.8svh,42px)] px-[clamp(10px,2.5svh,16px)] rounded-full bg-[#302A10]"
                  >
                    <MoonrockIcon className="w-5 h-5 text-yellow-400 shrink-0" />
                    <span className="font-secondary text-[clamp(0.65rem,1.6svh,0.875rem)] tracking-widest text-yellow-400">
                      {reward.count.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Orb grid */}
                {sortedOrbs.length > 0 && (
                  <div className="flex flex-col items-center gap-1.5 mt-2">
                    <span className="font-secondary text-xs tracking-[0.2em] text-green-400 uppercase">
                      Orbs
                    </span>
                    <div className="grid grid-cols-3 min-[360px]:grid-cols-4 min-[480px]:grid-cols-5 gap-2">
                      {sortedOrbs.map((orb, i) => (
                        <TapTooltip key={`${orb.value}-${i}`}>
                          <TooltipTrigger asChild>
                            <div ref={setOrbElementRef(i)}>
                              <OrbDisplay
                                orb={orb}
                                size="sm"
                                glowScale={0.5}
                                count={bombDamage(orb)}
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-black border border-white/10 px-3 py-2 max-w-[200px]">
                            <p
                              className="font-secondary text-xs font-bold"
                              style={{ color: orb.color() }}
                            >
                              {orb.name()}
                            </p>
                            <p
                              className="font-secondary text-xs mt-0.5 opacity-50"
                              style={{ color: orb.color() }}
                            >
                              {orb.description()}
                            </p>
                          </TooltipContent>
                        </TapTooltip>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Don't show again + LET'S GO button */}
              <motion.div
                className="flex flex-col items-center gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: isExiting ? 0 : 1, y: 0 }}
                transition={isExiting ? { duration: 0.2 } : { delay: 0.7 }}
              >
                <button
                  type="button"
                  onClick={() => setDontShowAgain((v) => !v)}
                  className="flex items-center gap-2.5 cursor-pointer select-none"
                >
                  <div
                    className="w-6 h-6 rounded-lg border-2 flex items-center justify-center"
                    style={{
                      borderColor: "rgba(54, 248, 24, 0.24)",
                      backgroundColor: dontShowAgain
                        ? undefined
                        : "rgba(54, 248, 24, 0.24)",
                    }}
                  >
                    {dontShowAgain && (
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        className="w-4 h-4 text-green-400"
                      >
                        <path
                          d="M3.5 8.5L6.5 11.5L12.5 4.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className="font-secondary text-xs tracking-wide"
                    style={{ color: "rgba(54, 248, 24, 0.48)" }}
                  >
                    Do not show this again
                  </span>
                </button>
                <Button
                  variant="secondary"
                  gradient="green"
                  className="h-12 px-12 font-secondary uppercase text-sm tracking-widest"
                  onClick={handleTakeAll}
                >
                  {actionLabel}
                </Button>
              </motion.div>
            </div>
          </TooltipProvider>

          {/* Flying moonrock particles */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="fixed z-[60] pointer-events-none"
              style={{ left: 0, top: 0 }}
              initial={{
                x: p.startX - 12,
                y: p.startY - 12,
                scale: 1,
                opacity: 1,
              }}
              animate={{
                x: p.endX - 12,
                y: p.endY - 12,
                scale: 0.5,
                opacity: 0,
              }}
              transition={{
                delay: p.delay,
                duration: 0.5,
                type: "spring",
                stiffness: 120,
                damping: 14,
              }}
            >
              <MoonrockIcon className="w-6 h-6 text-yellow-400" />
            </motion.div>
          ))}

          {/* Flying orb icons → chart center */}
          {orbParticles.map((p) => {
            const Icon = getOrbIcon(p.orb);
            const color = getOrbColor(p.orb);
            const half = 14;
            return (
              <motion.div
                key={p.id}
                className="fixed z-[60] pointer-events-none"
                style={{ left: 0, top: 0 }}
                initial={{
                  x: p.startX - half,
                  y: p.startY - half,
                  scale: 1,
                  opacity: 1,
                }}
                animate={{
                  x: p.endX - half,
                  y: p.endY - half,
                  scale: 0.3,
                  opacity: 0,
                }}
                transition={{
                  delay: p.delay / 1000,
                  duration: ORB_FLIGHT_S,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <Icon
                  className="w-7 h-7"
                  style={{
                    color,
                    filter: `drop-shadow(0 0 6px ${color})`,
                  }}
                />
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
