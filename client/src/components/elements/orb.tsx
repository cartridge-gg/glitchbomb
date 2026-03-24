import { cva, type VariantProps } from "class-variance-authority";
import { type HTMLMotionProps, motion } from "framer-motion";
import * as icons from "@/components/icons";
import { cn } from "@/lib/utils";

const orbVariants = cva(
  "select-none relative flex items-center justify-center rounded-full overflow-hidden outline-none border-none",
  {
    variants: {
      variant: {
        default: "",
        bomb: "",
        bomb1: "",
        bomb2: "",
        bomb3: "",
        point: "",
        multiplier: "",
        chip: "",
        moonrock: "",
        health: "",
      },
      size: {
        xs: "w-12 h-12",
        md: "w-[235px] h-[235px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

const iconVariants = (variant: string) => {
  switch (variant) {
    case "point":
      return icons.SparklesIcon;
    case "bomb":
      return icons.BombOrbIcon;
    case "bomb1":
      return icons.Bomb1xIcon;
    case "bomb2":
      return icons.Bomb2xIcon;
    case "bomb3":
      return icons.Bomb3xIcon;
    case "multiplier":
      return icons.CrossIcon;
    case "health":
      return icons.HeartIcon;
    case "chip":
      return icons.BoltIcon;
    case "moonrock":
      return icons.BoltIcon;
    default:
      return icons.OrbIcon;
  }
};

// Color mapping for variants
const VARIANT_COLORS = {
  default: {
    cssVar: "#ffffff",
  },
  bomb: {
    cssVar: "#FFFFFF",
  },
  bomb1: {
    cssVar: "#FFFFFF",
  },
  bomb2: {
    cssVar: "#FFFFFF",
  },
  bomb3: {
    cssVar: "#FFFFFF",
  },
  point: {
    cssVar: "var(--green-400)",
  },
  multiplier: {
    cssVar: "var(--orb-multiplier)",
  },
  chip: {
    cssVar: "var(--orb-chips)",
  },
  moonrock: {
    cssVar: "var(--orb-moonrock)",
  },
  health: {
    cssVar: "var(--orb-heart)",
  },
} as const;

export interface OrbProps
  extends Omit<HTMLMotionProps<"div">, "ref">,
    VariantProps<typeof orbVariants> {}

export const Orb = ({ variant, size, className, ...props }: OrbProps) => {
  // Get color based on variant
  const color = VARIANT_COLORS[variant ?? "default"];
  const Icon = iconVariants(variant ?? "default");

  return (
    <motion.div
      className={cn(orbVariants({ variant, size, className }))}
      {...props}
    >
      <div
        className="absolute inset-0 rounded-full overflow-hidden border-8"
        style={{ borderColor: color.cssVar }}
      >
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
      </div>

      {/* 5. Content */}
      <div
        className="relative z-10 bg-transparent flex justify-center items-center"
        style={{
          color: color.cssVar,
          filter: `drop-shadow(0 0 20px color-mix(in srgb, ${color.cssVar} 80%, transparent))`,
          transition: "color 0.5s ease-in-out, filter 0.5s ease-in-out",
        }}
      >
        <Icon
          className={cn(
            variant === "chip" || variant === "moonrock"
              ? "h-[35%] w-[35%]"
              : "h-[60%] w-[60%]",
            (variant === "bomb" ||
              variant === "bomb1" ||
              variant === "bomb2" ||
              variant === "bomb3") &&
              "glitch-icon",
          )}
        />
      </div>
    </motion.div>
  );
};
