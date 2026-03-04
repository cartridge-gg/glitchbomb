import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import {
  Bomb1xIcon,
  Bomb2xIcon,
  Bomb3xIcon,
  BombOrbIcon,
  OrbChipIcon,
  OrbHealthIcon,
  OrbMoonrockIcon,
  OrbMultiplierIcon,
  OrbPointIcon,
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

const glowSizeMap = {
  xs: 3,
  sm: 4,
  md: 8,
  lg: 12,
};

// Get the icon component for an orb type
const getOrbIcon = (orb: Orb, useBombTierIcons?: boolean) => {
  // PointBomb4 should show a bomb icon
  if (orb.isBomb()) {
    if (useBombTierIcons) {
      if (orb.value === OrbType.Bomb1) return Bomb1xIcon;
      if (orb.value === OrbType.Bomb2) return Bomb2xIcon;
      if (orb.value === OrbType.Bomb3) return Bomb3xIcon;
    }
    return BombOrbIcon;
  }
  if (orb.isPoint()) return OrbPointIcon;
  if (orb.isMultiplier()) return OrbMultiplierIcon;
  if (orb.isHealth()) return OrbHealthIcon;
  if (orb.isChips()) return OrbChipIcon;
  if (orb.isMoonrock()) return OrbMoonrockIcon;
  return OrbPointIcon;
};

// Get color for orb type
const getOrbColor = (orb: Orb) => {
  // PointBomb4 should be red like a bomb
  if (orb.isBomb()) return "var(--red-100)";
  if (orb.isPoint()) return "var(--green-400)";
  if (orb.isMultiplier()) return "var(--orb-multiplier)";
  if (orb.isHealth()) return "var(--orb-heart)";
  if (orb.isChips()) return "var(--orb-chips)";
  if (orb.isMoonrock()) return "var(--orb-moonrock)";
  return "var(--green-400)";
};

// Get display value for orb (the number shown in the icon)
const getOrbDisplayValue = (orb: Orb): string => {
  const name = orb.name();
  if (orb.isMultiplier()) {
    const match = name.match(/x(\d+)/i);
    return match ? `X${match[1]}` : "";
  }
  const match = name.match(/(\d+)/);
  return match ? match[1] : "";
};

export interface OrbDisplayProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof orbDisplayVariants> {
  orb: Orb;
  bombTierIcons?: boolean;
  valuePosition?: "bottom" | "top-right";
  showValue?: boolean;
  glowScale?: number;
  /** When set, the pill shows this count instead of the orb value */
  count?: number;
}

export const OrbDisplay = ({
  orb,
  size = "md",
  bombTierIcons = false,
  valuePosition = "bottom",
  showValue = true,
  glowScale = 1,
  count,
  className,
  ...props
}: OrbDisplayProps) => {
  const Icon = getOrbIcon(orb, bombTierIcons);
  const color = getOrbColor(orb);
  const displayValue = count != null ? String(count) : getOrbDisplayValue(orb);
  const glowSize = glowSizeMap[size ?? "md"] * glowScale;

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
        <Icon
          className={cn(
            "relative z-10",
            orb.isBomb() ? "w-3/5 h-3/5" : "w-full h-full",
          )}
          style={{
            color,
            filter: `drop-shadow(0 0 ${glowSize}px ${color})`,
          }}
        />
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
