import { cva, type VariantProps } from "class-variance-authority";
import {
  type HTMLMotionProps,
  motion,
  useAnimationControls,
} from "framer-motion";
import { memo, useEffect, useState } from "react";
import { BombIcon, DotIcon, OrbIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

const pullerVariants = cva(
  "select-none relative rounded-full overflow-hidden cursor-pointer outline-none border-none",
  {
    variants: {
      variant: {
        default: "",
        bomb: "",
        point: "",
        multiplier: "",
        chip: "",
        moonrock: "",
        rainbow: "",
      },
      size: {
        xs: "w-[130px] h-[130px]",
        sm: "w-[150px] h-[150px]",
        md: "w-[180px] h-[180px]",
        lg: "w-[233px] h-[233px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

// Color mapping for variants
const VARIANT_COLORS = {
  default: {
    cssVar: "#ffffff",
  },
  bomb: {
    cssVar: "var(--red-100)",
  },
  point: {
    cssVar: "var(--green-400)",
  },
  multiplier: {
    cssVar: "var(--yellow-100)",
  },
  chip: {
    cssVar: "var(--orange-100)",
  },
  moonrock: {
    cssVar: "var(--blue-100)",
  },
  rainbow: {
    cssVar: "#ffffff",
  },
} as const;

// Rainbow color sequence - uses all variant colors including white
const RAINBOW_SEQUENCE = [
  VARIANT_COLORS.default,
  VARIANT_COLORS.bomb,
  VARIANT_COLORS.chip,
  VARIANT_COLORS.multiplier,
  VARIANT_COLORS.point,
  VARIANT_COLORS.moonrock,
] as const;

export interface PullerProps
  extends Omit<HTMLMotionProps<"button">, "ref">,
    VariantProps<typeof pullerVariants> {
  orbs?: number;
  bombs?: number;
  sizePx?: number;
}

export const Puller = memo(function Puller({
  variant,
  size,
  className,
  orbs = 0,
  bombs = 0,
  sizePx,
  style,
  ...props
}: PullerProps) {
  // Get color based on variant
  const color = VARIANT_COLORS[variant || "default"];
  const controls = useAnimationControls();
  const [currentColorIndex, setCurrentColorIndex] = useState(0);

  // Rainbow animation effect - only depends on variant, not controls
  useEffect(() => {
    if (variant === "rainbow") {
      let currentIndex = 0;
      const interval = setInterval(() => {
        currentIndex = (currentIndex + 1) % RAINBOW_SEQUENCE.length;
        setCurrentColorIndex(currentIndex);
        controls.start({
          backgroundColor: RAINBOW_SEQUENCE[currentIndex].cssVar,
        });
      }, 1000);

      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant]);

  // Get current color for rainbow variant
  const currentColor =
    variant === "rainbow" ? RAINBOW_SEQUENCE[currentColorIndex] : color;
  const defaultSizePx =
    size === "lg" ? 233 : size === "sm" ? 150 : size === "xs" ? 130 : 180;
  const resolvedSizePx = sizePx ?? defaultSizePx;
  const labelFontSize = Math.round(resolvedSizePx * 0.19);
  const labelLineHeight = Math.round(labelFontSize * 0.86);
  const mergedStyle = {
    boxShadow: "0px 0px 50px 30px #000000",
    ...(sizePx ? { width: resolvedSizePx, height: resolvedSizePx } : {}),
    ...style,
  };
  const iconScale = Math.min(Math.max(resolvedSizePx / 180, 0.85), 1);

  return (
    <motion.button
      className={cn(pullerVariants({ variant, size, className }))}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      style={mergedStyle}
      {...props}
    >
      <div className="absolute inset-0 rounded-full overflow-hidden">
        {/* 1. Orb image with zoom to crop edges - using CSS animation for Safari compatibility */}
        <div
          className="absolute inset-0 rounded-full bg-center"
          style={{
            backgroundImage: "url(/assets/orb.png)",
            backgroundSize: "102%",
            backgroundPosition: "center",
            animation: "puller-spin 60s linear infinite",
            WebkitAnimation: "puller-spin 60s linear infinite",
          }}
        />

        {/* 2. Color tint overlay */}
        {variant !== "default" && (
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              backgroundColor: color.cssVar,
              mixBlendMode: "multiply",
              opacity: 0.7,
            }}
            animate={variant === "rainbow" ? controls : undefined}
            transition={{
              duration: 0.5,
              ease: "easeInOut",
            }}
          />
        )}

        {/* 3. Glass filter */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            backdropFilter: "blur(1px)",
            WebkitBackdropFilter: "blur(1px)",
          }}
        />

        {/* 4. Glass specular with variant color */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            boxShadow: `inset 1px 1px 1px color-mix(in srgb, ${currentColor.cssVar} 20%, transparent)`,
            transition: "box-shadow 0.5s ease-in-out",
          }}
        />
      </div>

      {/* 5. Content */}
      <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 z-10 bg-transparent flex flex-col items-center gap-0">
        <p
          className="text-center font-[900]"
          style={{
            color: currentColor.cssVar,
            fontSize: `${labelFontSize}px`,
            lineHeight: `${labelLineHeight}px`,
            filter: `drop-shadow(0 0 20px color-mix(in srgb, ${currentColor.cssVar} 80%, transparent))`,
            transition: "color 0.5s ease-in-out, filter 0.5s ease-in-out",
          }}
        >
          PULL
          <br />
          ORB
        </p>
        <div
          className="flex items-center justify-center"
          style={{
            color: currentColor.cssVar,
            transition: "color 0.5s ease-in-out",
            transform: `scale(${iconScale})`,
            transformOrigin: "center",
          }}
        >
          <div
            className={cn(
              "flex items-center justify-center translate-x-[-4px]",
              orbs === 0 && "hidden",
            )}
          >
            <OrbIcon size="md" />
            <p className="text-xs font-secondary uppercase whitespace-nowrap">{`x ${orbs}`}</p>
          </div>
          <DotIcon
            size="3xs"
            className={cn(
              "opacity-25",
              (orbs === 0 || bombs === 0) && "hidden",
            )}
          />
          <div
            className={cn(
              "flex items-center justify-center translate-x-[-4px]",
              bombs === 0 && "hidden",
            )}
          >
            <BombIcon size="md" />
            <p className="text-xs font-secondary uppercase whitespace-nowrap">{`x ${bombs}`}</p>
          </div>
        </div>
      </div>
    </motion.button>
  );
});
