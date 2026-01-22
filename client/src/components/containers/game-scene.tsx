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
import { cn } from "@/lib/utils";

export interface GameSceneProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gameSceneVariants> {
  lives: number;
  bombs: number;
  orbs: number;
  multiplier: number;
  values: DistributionValues;
  orb?: {
    variant: "point" | "bomb" | "multiplier" | "chip" | "moonrock" | "health";
    content: string;
  };
  onPull: () => void;
}

const gameSceneVariants = cva("relative", {
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
  orb,
  variant,
  className,
  onPull,
  ...props
}: GameSceneProps) => {
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
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300",
          phase === 0 && "opacity-100",
          (phase === 1 || phase === 2) && "opacity-10",
          phase === 3 && "opacity-100",
        )}
      >
        <Distribution values={values} />
      </div>

      {/* Puller */}
      <div
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[51.5%] transition-opacity duration-300",
          phase === 0 && "opacity-100 z-20",
          (phase === 1 || phase === 2) && "opacity-0 z-0",
          phase === 3 && "opacity-100 z-20",
        )}
      >
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
          orbs={orbs}
          bombs={bombs}
        />
        {/* Multiplier Badge - above and to the right of puller */}
        <div className="absolute -top-14 -right-6 z-30">
          <Multiplier
            count={multiplier}
            cornerRadius={50}
            className="w-12 h-12 rounded-full"
          />
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
              <Outcome
                content={orb?.content ?? ""}
                variant={orb?.variant ?? "default"}
                size="md"
                className="scale-[1.5]"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
