import {
  BagIcon,
  OrbBombIcon,
  OrbChipIcon,
  OrbHealthIcon,
  OrbMoonrockIcon,
  OrbMultiplierIcon,
  OrbPointIcon,
} from "@/components/icons";
import type { Orb } from "@/models";

export interface OrbCategorySummaryProps {
  orbs: Orb[];
  onClick?: () => void;
}

type OrbCategory =
  | "bomb"
  | "point"
  | "multiplier"
  | "health"
  | "chip"
  | "moonrock";

interface CategoryConfig {
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  color: string;
  bgColor: string;
}

const darkenHex = (color: string, factor: number) => {
  if (!color.startsWith("#") || color.length !== 7) return color;
  const clamp = (value: number) => Math.max(0, Math.min(255, value));
  const r = clamp(Math.round(parseInt(color.slice(1, 3), 16) * factor));
  const g = clamp(Math.round(parseInt(color.slice(3, 5), 16) * factor));
  const b = clamp(Math.round(parseInt(color.slice(5, 7), 16) * factor));
  const toHex = (value: number) => value.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const categoryConfig: Record<OrbCategory, CategoryConfig> = {
  bomb: {
    icon: OrbBombIcon,
    color: "#FF1E00",
    bgColor: "rgba(255, 30, 0, 0.2)",
  },
  point: {
    icon: OrbPointIcon,
    color: "#36F818",
    bgColor: "rgba(54, 248, 24, 0.2)",
  },
  multiplier: {
    icon: OrbMultiplierIcon,
    color: "#FFF121",
    bgColor: "rgba(255, 241, 33, 0.2)",
  },
  health: {
    icon: OrbHealthIcon,
    color: "#FE5578",
    bgColor: "rgba(254, 85, 120, 0.2)",
  },
  chip: {
    icon: OrbChipIcon,
    color: "#FFF121",
    bgColor: "rgba(255, 241, 33, 0.2)",
  },
  moonrock: {
    icon: OrbMoonrockIcon,
    color: "#7487FF",
    bgColor: "rgba(116, 135, 255, 0.2)",
  },
};

const getOrbCategory = (orb: Orb): OrbCategory | null => {
  if (orb.isBomb()) return "bomb";
  if (orb.isPoint()) return "point";
  if (orb.isMultiplier()) return "multiplier";
  if (orb.isHealth()) return "health";
  if (orb.isChips()) return "chip";
  if (orb.isMoonrock()) return "moonrock";
  return null;
};

export const OrbCategorySummary = ({
  orbs,
  onClick,
}: OrbCategorySummaryProps) => {
  // Count orbs by category
  const categoryCounts = orbs.reduce<Record<OrbCategory, number>>(
    (acc, orb) => {
      const category = getOrbCategory(orb);
      if (category) {
        acc[category] = (acc[category] || 0) + 1;
      }
      return acc;
    },
    {} as Record<OrbCategory, number>,
  );

  // Get categories with counts > 0, in display order
  const displayOrder: OrbCategory[] = [
    "bomb",
    "point",
    "multiplier",
    "health",
    "chip",
    "moonrock",
  ];
  const categoriesToShow = displayOrder.filter(
    (cat) => categoryCounts[cat] > 0,
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-stretch w-full hover:brightness-110"
    >
      {/* Bag icon container with 40% black overlay */}
      <div
        className="flex items-center justify-center w-16 border border-[#071304] shrink-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0, 0, 0, 0.20), rgba(0, 0, 0, 0.40)), linear-gradient(180deg, #071304 0%, rgba(7, 19, 4, 0.00) 100%)",
          borderRadius: "8px 0 0 8px",
          borderRight: "none",
        }}
      >
        <BagIcon className="w-7 h-7 text-green-700" />
      </div>

      {/* Category orbs container with base gradient */}
      <div
        className="flex items-center gap-3 flex-1 px-4 pt-2 pb-3 border border-[#071304]"
        style={{
          background:
            "linear-gradient(180deg, #071304 0%, rgba(7, 19, 4, 0.00) 100%)",
          borderRadius: "0 8px 8px 0",
          borderLeft: "none",
        }}
      >
        {categoriesToShow.length > 0 ? (
          categoriesToShow.map((category) => {
            const config = categoryConfig[category];
            const Icon = config.icon;
            const count = categoryCounts[category];

            return (
              <div key={category} className="relative flex-shrink-0">
                {/* Orb circle */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: config.bgColor,
                    border: `2px solid ${config.color}`,
                  }}
                >
                  <Icon
                    className="w-9 h-9"
                    style={{
                      color: config.color,
                      filter: `drop-shadow(0 0 4px ${config.color})`,
                    }}
                  />
                </div>
                {/* Count pill */}
                <div
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-xs font-bold font-secondary"
                  style={{
                    backgroundColor: darkenHex(config.color, 0.6),
                    border: `2px solid ${config.color}`,
                    color: "#040603",
                  }}
                >
                  <span style={{ color: "#F5F5F5" }}>x</span>
                  {count}
                </div>
              </div>
            );
          })
        ) : (
          <span className="text-green-600 font-secondary text-sm">
            No orbs yet
          </span>
        )}
      </div>
    </button>
  );
};
