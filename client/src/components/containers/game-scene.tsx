import { cva, type VariantProps } from "class-variance-authority";
import { type RefObject, useEffect, useMemo, useRef, useState } from "react";
import {
  Distribution,
  type DistributionValues,
  Multiplier,
  Puller,
} from "@/components/elements";
import {
  TapTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MultiplierMath } from "@/helpers/multiplier";

export interface OrbOutcome {
  variant:
    | "point"
    | "bomb"
    | "bomb1"
    | "bomb2"
    | "bomb3"
    | "multiplier"
    | "chip"
    | "moonrock"
    | "health";
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
  pullLoading?: boolean;
  showPercentages?: boolean;
  onPull: () => void;
  sceneRef?: RefObject<HTMLDivElement | null>;
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
  pullLoading = false,
  showPercentages = false,
  variant,
  className,
  onPull,
  sceneRef,
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
  const pullerSizePx = Math.round(clamp(125, distributionSize * 0.59, 185));
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
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className={gameSceneVariants({ variant, className })}
      {...props}
    >
      {/* Distribution */}
      <div
        ref={sceneRef}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <Distribution
          values={values}
          size={distributionSize}
          thickness={distributionThickness}
          showPercentages={showPercentages}
        />
      </div>

      {/* Puller — always visible so user can spam pulls */}
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <div className="relative" data-tutorial-id="puller">
          <Puller
            onClick={onPull}
            variant={lives < 2 ? "bomb" : lives < 4 ? "warning" : "point"}
            size="md"
            sizePx={pullerSizePx}
            orbs={orbs}
            bombs={bombs}
            isLoading={pullLoading}
          />
          {/* Multiplier Badge - top right of puller */}
          <div
            className="absolute z-30"
            data-tutorial-id="multiplier"
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
                  className="bg-black border border-white/10 px-3 py-2 max-w-[200px]"
                >
                  <p
                    className="font-secondary text-xs font-bold"
                    style={{ color: multiplierColor }}
                  >
                    {multiplier}x Multiplier
                  </p>
                  <p
                    className="font-secondary text-xs mt-0.5 opacity-50"
                    style={{ color: multiplierColor }}
                  >
                    All points earned are multiplied by {multiplier}x
                  </p>
                </TooltipContent>
              </TapTooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
};
