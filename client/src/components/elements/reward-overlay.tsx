import { AnimatePresence, motion } from "framer-motion";
import { type RefObject, useMemo, useRef, useState } from "react";
import { BracketArrowIcon, MoonrockIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import type { Orb as OrbModel } from "@/models";
import { Orb } from "./orb";

export interface RewardItem {
  variant: "moonrock" | "chip" | "point" | "multiplier";
  count: number;
  label: string;
}

interface Slide {
  variant: "moonrock" | "chip" | "point" | "multiplier" | "bomb" | "health";
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
  const [slideIndex, setSlideIndex] = useState(0);

  // Build slides: first is the reward (moonrocks), rest are grouped orbs
  const slides = useMemo<Slide[]>(() => {
    const result: Slide[] = [reward];
    if (!orbs || orbs.length === 0) return result;
    const map = new Map<string, { orb: OrbModel; count: number }>();
    for (const orb of orbs) {
      const existing = map.get(orb.value);
      if (existing) {
        existing.count++;
      } else {
        map.set(orb.value, { orb, count: 1 });
      }
    }
    for (const { orb, count } of map.values()) {
      result.push({
        variant: orb.outcomeVariant(),
        count,
        label: orb.name(),
      });
    }
    return result;
  }, [reward, orbs]);

  const maxSlide = slides.length - 1;
  const hasMultipleSlides = slides.length > 1;

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

            {/* Slide carousel: orb circles + count pill, with arrows */}
            <motion.div
              className="flex flex-col items-center gap-6"
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
              {/* Orb icon row with arrows centered on icon */}
              <div className="flex items-center gap-8">
                {/* Left arrow */}
                {hasMultipleSlides && (
                  <Button
                    variant="secondary"
                    gradient="green"
                    className="h-10 w-10 p-0 shrink-0 relative z-10"
                    onClick={() => setSlideIndex((i) => Math.max(0, i - 1))}
                    disabled={slideIndex <= 0}
                    aria-label="Previous reward"
                  >
                    <BracketArrowIcon size="xs" direction="left" />
                  </Button>
                )}

                {/* Stacked orb icons — two coins */}
                <div
                  ref={orbRef}
                  className="relative w-32 h-32 pointer-events-none"
                  style={
                    {
                      "--orb-moonrock": "var(--yellow-100)",
                    } as React.CSSProperties
                  }
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={slideIndex}
                      className="absolute inset-0"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Back orb — offset slightly right and down */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-[46%] -translate-y-[48%] opacity-60">
                        <Orb
                          variant={slides[slideIndex].variant}
                          className="scale-[0.44]"
                        />
                      </div>
                      {/* Front orb with black border */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-[54%] -translate-y-[52%]">
                        <Orb
                          variant={slides[slideIndex].variant}
                          className="scale-[0.44]"
                          style={{
                            boxShadow: "0 0 0 12px black",
                            borderRadius: "9999px",
                          }}
                        />
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Right arrow */}
                {hasMultipleSlides && (
                  <Button
                    variant="secondary"
                    gradient="green"
                    className="h-10 w-10 p-0 shrink-0 relative z-10"
                    onClick={() =>
                      setSlideIndex((i) => Math.min(maxSlide, i + 1))
                    }
                    disabled={slideIndex >= maxSlide}
                    aria-label="Next reward"
                  >
                    <BracketArrowIcon size="xs" direction="right" />
                  </Button>
                )}
              </div>

              {/* Count + label pill */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={slideIndex}
                  className="flex items-center gap-2 rounded-full px-5 py-2"
                  style={{ backgroundColor: "rgba(0, 0, 0, 0.20)" }}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="font-secondary text-lg tracking-widest font-bold text-green-400">
                    {slides[slideIndex].count}
                  </span>
                  <span className="font-secondary text-lg tracking-widest text-green-400">
                    {slides[slideIndex].label}
                  </span>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* TAKE ALL button — matches homepage style */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isExiting ? 0 : 1, y: 0 }}
              transition={isExiting ? { duration: 0.2 } : { delay: 0.65 }}
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
