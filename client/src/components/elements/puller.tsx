import { cva, type VariantProps } from "class-variance-authority";
import {
  type HTMLMotionProps,
  motion,
  useAnimationControls,
} from "framer-motion";
import { useEffect, useState } from "react";
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
}

export const Puller = ({
  variant,
  size,
  className,
  orbs = 0,
  bombs = 0,
  ...props
}: PullerProps) => {
  // Get color based on variant
  const color = VARIANT_COLORS[variant || "default"];
  const controls = useAnimationControls();
  const [currentColorIndex, setCurrentColorIndex] = useState(0);

  // Rainbow animation effect
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
  }, [variant, controls]);

  // Get current color for rainbow variant
  const currentColor =
    variant === "rainbow" ? RAINBOW_SEQUENCE[currentColorIndex] : color;

  return (
    <motion.button
      className={cn(pullerVariants({ variant, size, className }))}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      style={{
        boxShadow: "0px 0px 50px 30px #000000",
      }}
      {...props}
    >
      <div className="absolute inset-0 rounded-full overflow-hidden">
        {/* 1. Orb image with zoom to crop edges */}
        <motion.div
          className="absolute inset-0 rounded-full bg-center"
          style={{
            backgroundImage: "url(/assets/orb.png)",
            backgroundSize: "102%",
            backgroundPosition: "center",
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 60,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
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
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
        <p
          className="text-center text-[35px]/[30px] font-[900] -mt-1"
          style={{
            color: currentColor.cssVar,
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
};
