import { AnimatePresence, motion } from "framer-motion";
import { type RefObject, useMemo, useRef, useState } from "react";
import { MoonrockIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Orb as OrbModel, OrbType } from "@/models";
import { OrbDisplay } from "./orb-display";

export interface RewardItem {
  variant: "moonrock" | "chip" | "point" | "multiplier";
  count: number;
  label: string;
}

export interface RewardOverlayProps {
  open: boolean;
  onDismiss: () => void;
  onAnimationStart?: () => void;
  onTakeAll?: () => void;
  targetRef?: RefObject<HTMLElement | null>;
  heading?: string;
  actionLabel?: string;
  reward: RewardItem;
  orbs?: OrbModel[];
}

const moonrockOrb = new OrbModel(OrbType.Moonrock15);

const PARTICLE_COUNT = 6;
const PARTICLE_STAGGER_MS = 50;
const ANIMATION_START_DELAY_MS = 300;
const ANIMATION_TOTAL_MS = 800;

export const RewardOverlay = ({
  open,
  onDismiss,
  onAnimationStart,
  onTakeAll,
  targetRef,
  heading = "YOU RECEIVE",
  actionLabel = "LET'S GO",
  reward,
  orbs,
}: RewardOverlayProps) => {
  const [isExiting, setIsExiting] = useState(false);

  // Group identical orbs by value
  const groupedOrbs = useMemo(() => {
    if (!orbs || orbs.length === 0) return [];
    const map = new Map<string, { orb: OrbModel; count: number }>();
    for (const orb of orbs) {
      const existing = map.get(orb.value);
      if (existing) {
        existing.count++;
      } else {
        map.set(orb.value, { orb, count: 1 });
      }
    }
    return Array.from(map.values());
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

  const handleTakeAll = () => {
    if (isExiting) return;
    setIsExiting(true);
    onTakeAll?.();

    // Calculate particle start (orb center) and end (target pill) positions
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

    // Trigger header count-up mid-flight
    setTimeout(() => {
      onAnimationStart?.();
    }, ANIMATION_START_DELAY_MS);

    // Dismiss after full animation
    setTimeout(() => {
      setIsExiting(false);
      setParticles([]);
      onDismiss();
    }, ANIMATION_TOTAL_MS);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md"
          style={{
            background:
              "radial-gradient(circle, rgba(0, 0, 0, 0.6) 0%, transparent 70%)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
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

            {/* Rewards grid — moonrocks large in center, orbs below */}
            <motion.div
              ref={orbRef}
              className="flex flex-col items-center gap-4"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: isExiting ? 0.5 : 1,
                opacity: isExiting ? 0 : 1,
              }}
              transition={
                isExiting
                  ? { duration: 0.2 }
                  : { delay: 0.25, type: "spring", stiffness: 300, damping: 20 }
              }
            >
              {/* Moonrocks — large */}
              <OrbDisplay
                orb={moonrockOrb}
                size="lg"
                count={reward.count}
                glowScale={1}
              />

              {/* Orb grid */}
              {groupedOrbs.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {groupedOrbs.map(({ orb, count }) => (
                    <OrbDisplay
                      key={orb.value}
                      orb={orb}
                      size="sm"
                      count={count}
                      glowScale={0.5}
                    />
                  ))}
                </div>
              )}
            </motion.div>

            {/* LET'S GO button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isExiting ? 0 : 1, y: 0 }}
              transition={isExiting ? { duration: 0.2 } : { delay: 0.7 }}
            >
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
        </motion.div>
      )}
    </AnimatePresence>
  );
};
