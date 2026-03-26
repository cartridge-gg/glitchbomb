import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import {
  Bomb1xIcon,
  Bomb2xIcon,
  Bomb3xIcon,
  BombOrbIcon,
  CrossIcon,
  HeartIcon,
  OrbChipIcon,
  OrbMoonrockIcon,
  SparklesIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils";
import type { Orb } from "@/models";
import { OrbType } from "@/models/orb";

const orbDisplayVariants = cva(
  "relative rounded-full flex items-center justify-center shrink-0",
  {
    variants: {
      size: {
        xs: "w-10 h-10",
        sm: "w-12 h-12",
        md: "w-16 h-16",
        lg: "w-20 h-20",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

const valueSizeMap = {
  xs: "-bottom-1 text-[11px] px-1.5 py-px",
  sm: "-bottom-1 text-xs px-2 py-px",
  md: "-bottom-1.5 text-sm px-3 py-px",
  lg: "-bottom-2 text-base px-4 py-0.5",
};

const valueSizeCompactMap = {
  xs: "text-xs px-1 py-0.5 leading-none",
  sm: "text-xs px-1 py-0.5 leading-none",
  md: "text-sm px-1.5 py-0.5 leading-none",
  lg: "text-base px-2 py-0.5 leading-none",
};

const valuePositionMap = {
  bottom: {
    xs: "left-1/2 -translate-x-1/2",
    sm: "left-1/2 -translate-x-1/2",
    md: "left-1/2 -translate-x-1/2",
    lg: "left-1/2 -translate-x-1/2",
  },
  "top-right": {
    xs: "top-0 right-0",
    sm: "top-0 right-0",
    md: "top-0 right-0",
    lg: "top-0 right-0",
  },
};

// Get the icon component for an orb type
const getOrbIcon = (orb: Orb) => {
  if (orb.isBomb()) {
    if (orb.value === OrbType.Bomb1) return Bomb1xIcon;
    if (orb.value === OrbType.Bomb2) return Bomb2xIcon;
    if (orb.value === OrbType.Bomb3) return Bomb3xIcon;
    return BombOrbIcon;
  }
  if (orb.isPoint()) return SparklesIcon;
  if (orb.isMultiplier()) return CrossIcon;
  if (orb.isHealth()) return HeartIcon;
  if (orb.isChips()) return OrbChipIcon;
  if (orb.isMoonrock()) return OrbMoonrockIcon;
  return SparklesIcon;
};

// Get color for orb type
const getOrbColor = (orb: Orb) => {
  if (orb.isBomb()) return "#FFFFFF";
  if (orb.isPoint()) return "var(--green-400)";
  if (orb.isMultiplier()) return "var(--orb-multiplier)";
  if (orb.isHealth()) return "var(--orb-heart)";
  if (orb.isChips()) return "var(--orb-chips)";
  if (orb.isMoonrock()) return "var(--orb-moonrock)";
  return "var(--green-400)";
};

// Get display value for orb (the number shown in the icon)
const getOrbDisplayValue = (orb: Orb): string => {
  if (orb.isMultiplier()) {
    switch (orb.value) {
      case OrbType.Multiplier50:
        return "+0.5x";
      case OrbType.Multiplier100:
        return "+1x";
      case OrbType.Multiplier150:
        return "+1.5x";
      default:
        return "";
    }
  }
  if (orb.isHealth()) {
    switch (orb.value) {
      case OrbType.Health1:
        return "1";
      case OrbType.Health2:
        return "2";
      case OrbType.Health3:
        return "3";
      default:
        return "";
    }
  }
  // Per-orb/per-bomb point orbs get an asterisk
  if (orb.value === OrbType.PointOrb1) return "1*";
  if (orb.value === OrbType.PointBomb4) return "4*";
  const name = orb.name();
  const match = name.match(/(\d+)/);
  return match ? match[1] : "";
};

export interface OrbDisplayProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof orbDisplayVariants> {
  orb: Orb;
  valuePosition?: "bottom" | "top-right";
  showValue?: boolean;
  /** When set, the pill shows this count instead of the orb value */
  count?: number;
  /** Hide the center icon (keeps border, background, and tint) */
  hideIcon?: boolean;
  /** Override the default icon component */
  iconOverride?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export const OrbDisplay = ({
  orb,
  size = "md",
  valuePosition = "bottom",
  showValue = true,
  count,
  hideIcon = false,
  iconOverride,
  className,
  ...props
}: OrbDisplayProps) => {
  const Icon = iconOverride ?? getOrbIcon(orb);
  const color = getOrbColor(orb);
  const displayValue = count != null ? String(count) : getOrbDisplayValue(orb);

  return (
    <div
      className="relative shrink-0"
      style={{ backfaceVisibility: "hidden" }}
      {...props}
    >
      {/* Orb circle */}
      <div
        className={cn(
          orbDisplayVariants({ size, className }),
          "overflow-hidden",
        )}
        style={{
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: color,
          transform: "translateZ(0)",
        }}
      >
        {/* Orb background */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            backgroundImage: "url(/assets/orb.png)",
            backgroundSize: "102%",
            backgroundPosition: "center",
            opacity: 0.4,
            backfaceVisibility: "hidden",
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 60,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        {/* Color tint */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            backgroundColor: color,
            mixBlendMode: "multiply",
            opacity: 0.1,
            backfaceVisibility: "hidden",
          }}
        />
        {/* Icon */}
        {!hideIcon && (
          <Icon
            className={cn(
              "relative z-10",
              orb.isChips() || orb.isMoonrock()
                ? "w-[80%] h-[80%]"
                : "w-[60%] h-[60%]",
              orb.isBomb() && "glitch-icon",
            )}
            style={{
              color,
            }}
          />
        )}
      </div>
      {/* Value pill - outside the clipped area */}
      {showValue && displayValue && (
        <div
          className={cn(
            "absolute z-30 rounded-full flex items-center justify-center",
            valuePosition === "top-right"
              ? valueSizeCompactMap[size ?? "md"]
              : valueSizeMap[size ?? "md"],
            valuePositionMap[valuePosition][size ?? "md"],
          )}
          style={{ backgroundColor: color }}
        >
          <span className="font-bold font-secondary text-black">
            {displayValue}
          </span>
        </div>
      )}
    </div>
  );
};
