import { cva, type VariantProps } from "class-variance-authority";
import {
  OrbChipIcon,
  OrbHealthIcon,
  OrbMoonrockIcon,
  OrbMultiplierIcon,
  OrbPointIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils";
import type { Orb } from "@/models";

const orbDisplayVariants = cva(
  "relative rounded-full flex items-center justify-center shrink-0 overflow-hidden",
  {
    variants: {
      size: {
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

const iconSizeMap = {
  sm: "w-full h-full",
  md: "w-full h-full",
  lg: "w-full h-full",
};

const valueSizeMap = {
  sm: "text-xs -bottom-0.5",
  md: "text-sm -bottom-1",
  lg: "text-base -bottom-1",
};

const glowSizeMap = {
  sm: 4,
  md: 8,
  lg: 12,
};

// Get the icon component for an orb type
const getOrbIcon = (orb: Orb) => {
  if (orb.isPoint()) return OrbPointIcon;
  if (orb.isMultiplier()) return OrbMultiplierIcon;
  if (orb.isHealth()) return OrbHealthIcon;
  if (orb.isChips()) return OrbChipIcon;
  if (orb.isMoonrock()) return OrbMoonrockIcon;
  return OrbPointIcon;
};

// Get color for orb type
const getOrbColor = (orb: Orb) => {
  if (orb.isPoint()) return "var(--green-400)";
  if (orb.isMultiplier()) return "var(--yellow-100)";
  if (orb.isHealth()) return "var(--salmon-100)";
  if (orb.isChips()) return "var(--orange-100)";
  if (orb.isMoonrock()) return "var(--blue-100)";
  return "var(--green-400)";
};

// Get display value for orb (the number shown in the icon)
const getOrbDisplayValue = (orb: Orb): string => {
  const name = orb.name();
  // Extract number from name like "Point 5", "Multiplier 50%", etc.
  const match = name.match(/(\d+)/);
  if (orb.isMultiplier()) {
    // For multipliers, show as X3, X2, etc.
    const percent = match ? parseInt(match[1], 10) : 0;
    if (percent === 50) return "X2";
    if (percent === 100) return "X3";
    if (percent === 150) return "X4";
  }
  return match ? match[1] : "";
};

export interface OrbDisplayProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof orbDisplayVariants> {
  orb: Orb;
}

export const OrbDisplay = ({
  orb,
  size = "md",
  className,
  ...props
}: OrbDisplayProps) => {
  const Icon = getOrbIcon(orb);
  const color = getOrbColor(orb);
  const displayValue = getOrbDisplayValue(orb);
  const glowSize = glowSizeMap[size ?? "md"];

  return (
    <div
      className={cn(orbDisplayVariants({ size, className }))}
      style={{
        borderWidth: "2px",
        borderStyle: "solid",
        borderColor: color,
      }}
      {...props}
    >
      {/* Orb background */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          backgroundImage: "url(/assets/orb.png)",
          backgroundSize: "102%",
          backgroundPosition: "center",
          opacity: 0.4,
        }}
      />
      {/* Color tint */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          backgroundColor: color,
          mixBlendMode: "multiply",
          opacity: 0.5,
        }}
      />
      {/* Icon */}
      <Icon
        className={cn(iconSizeMap[size ?? "md"], "relative z-10")}
        style={{
          color,
          filter: `drop-shadow(0 0 ${glowSize}px ${color})`,
        }}
      />
      {/* Value */}
      <span
        className={cn(
          "absolute left-1/2 -translate-x-1/2 font-bold font-secondary z-10",
          valueSizeMap[size ?? "md"],
        )}
        style={{ color }}
      >
        {displayValue}
      </span>
    </div>
  );
};
