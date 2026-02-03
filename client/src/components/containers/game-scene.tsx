import { cva, type VariantProps } from "class-variance-authority";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Distribution,
  type DistributionValues,
  Multiplier,
  Orb,
  Outcome,
  Puller,
} from "@/components/elements";
import { FireIcon } from "@/components/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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
  orb?: {
    variant: "point" | "bomb" | "multiplier" | "chip" | "moonrock" | "health";
    content: string;
  };
  onPull: () => void;
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
  variant,
  className,
  onPull,
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
  const outcomeScale = clamp(1.05, pullerSizePx / 120, 1.5);
  const fireIconSize = Math.round(badgeSizePx * 0.4);
  const sceneOffsetY = Math.round(clamp(4, viewportHeight * 0.02, 36));

  // 0: initial, 1: orb visible, 2: orb + outcome, 3: fade-out
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (orb) {
      // Phase 1: Show Orb
      setPhase(1);

      // Phase 2: After 500ms, show Outcome and reduce Orb opacity
      const phase2Timer = setTimeout(() => {
        setPhase(2);
      }, 500);

      // Phase 3: After 2s total, fade everything out
      const phase3Timer = setTimeout(() => {
        setPhase(3);
      }, 2000);

      return () => {
        clearTimeout(phase2Timer);
        clearTimeout(phase3Timer);
      };
    } else {
      setPhase(0);
    }
  }, [orb]);

  return (
    <div className={gameSceneVariants({ variant, className })} {...props}>
      {/* Distribution */}
      <div
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
          />
          {hasCurse && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="absolute z-30"
                    style={{ top: -badgeOffsetTop, left: -badgeOffsetX }}
                  >
                    <div style={{ width: badgeSizePx, height: badgeSizePx }}>
                      <Multiplier
                        count={3}
                        cornerRadius={50}
                        className="h-full w-full [&_p]:opacity-0"
                        electricGradient="linear-gradient(180deg, #F89149CC 0%, #D10D07CC 100%)"
                        electricBorderGradient="linear-gradient(180deg, #F89149 0%, #D10D07 100%)"
                        electricColor="#F89149"
                        contentOpacity={0.55}
                        borderWidthMin={1.25}
                        borderWidthMax={2.5}
                      />
                      <div className="absolute inset-0 z-20 flex items-center justify-center">
                        <FireIcon
                          style={{ width: fireIconSize, height: fireIconSize }}
                        />
                      </div>
                    </div>
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
            <div style={{ width: badgeSizePx, height: badgeSizePx }}>
              <Multiplier
                count={multiplier}
                cornerRadius={50}
                className="h-full w-full"
              />
            </div>
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <AnimatePresence>
          {phase === 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 15,
                mass: 0.8,
              }}
            >
              <div style={{ transform: `scale(${outcomeScale})` }}>
                <Outcome
                  content={orb?.content ?? ""}
                  variant={orb?.variant ?? "default"}
                  size="md"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
