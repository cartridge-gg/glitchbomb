import { cva, type VariantProps } from "class-variance-authority";
import { useEffect, useState } from "react";
import {
  Distribution,
  type DistributionValues,
  Orb,
  Outcome,
  Puller,
} from "@/components/elements";
import { HeartIcon, HeartOutlineIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export interface GameSceneProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gameSceneVariants> {
  lives: number;
  bombs: number;
  orbs: number;
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

      // Phase 2: After 1s, show Outcome and reduce Orb opacity
      const phase2Timer = setTimeout(() => {
        setPhase(2);
      }, 1000);

      // Phase 3: After 3s total (1s + 2s), fade everything out
      const phase3Timer = setTimeout(() => {
        setPhase(3);
      }, 3000);

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
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-1000",
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
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-1000",
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
      </div>

      {/* Hearts display - positioned below the Puller */}
      <div
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 mt-28 transition-opacity duration-1000",
          phase === 0 && "opacity-100 z-20",
          (phase === 1 || phase === 2) && "opacity-0 z-0",
          phase === 3 && "opacity-100 z-20",
        )}
      >
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) =>
            i < lives ? (
              <HeartIcon
                key={i}
                className="w-10 h-10"
                style={{
                  color: "var(--red-100)",
                  filter: "drop-shadow(0 0 8px var(--red-100))",
                }}
              />
            ) : (
              <HeartOutlineIcon
                key={i}
                className="w-10 h-10"
                style={{ color: "rgba(20, 83, 45, 0.5)" }}
              />
            ),
          )}
        </div>
      </div>

      {/* Orb */}
      <div
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-1000",
          phase === 0 && "opacity-0",
          phase === 1 && "opacity-100",
          phase === 2 && "opacity-50",
          phase === 3 && "opacity-0",
        )}
      >
        <Orb
          variant={orb?.variant ?? "default"}
          style={{
            boxShadow:
              "0px 0px 128px 96px #000000DD, 0px 0px 48px 16px #FFFFFF80",
          }}
        />
      </div>

      {/* Outcome */}
      <div
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-1000",
          (phase === 0 || phase === 1) && "opacity-0",
          phase === 2 && "opacity-100",
          phase === 3 && "opacity-0",
        )}
      >
        <Outcome
          content={orb?.content ?? ""}
          variant={orb?.variant ?? "default"}
          size="md"
          className="scale-[1.5]"
        />
      </div>
    </div>
  );
};
