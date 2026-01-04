import { cva, type VariantProps } from "class-variance-authority";
import { type HTMLMotionProps, motion } from "framer-motion";
import * as icons from "@/components/icons";
import { cn } from "@/lib/utils";

const orbVariants = cva(
  "select-none relative flex items-center justify-center rounded-full overflow-hidden cursor-pointer outline-none border-none",
  {
    variants: {
      variant: {
        default: "",
        bomb: "",
        point: "",
        multiplier: "",
        chip: "",
        moonrock: "",
      },
      size: {
        md: "w-[250px] h-[250px]",
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
      return icons.OrbPointIcon;
    case "bomb":
      return icons.OrbBombIcon;
    case "multiplier":
      return icons.OrbMultiplierIcon;
    case "health":
      return icons.OrbHealthIcon;
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
      style={{
        boxShadow: "0px 0px 50px 30px #000000",
      }}
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
        <Icon className="h-full w-full" />
      </div>
    </motion.div>
  );
};
