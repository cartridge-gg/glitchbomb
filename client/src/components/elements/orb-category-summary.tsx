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
    color: "#36F818",
    bgColor: "rgba(54, 248, 24, 0.2)",
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
      className="flex items-center gap-3 w-full p-3 rounded-lg border border-green-900/50 bg-green-950/30 hover:bg-green-950/50 transition-colors"
    >
      {/* Bag icon */}
      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-green-950/50">
        <BagIcon className="w-6 h-6 text-green-600" />
      </div>

      {/* Category orbs */}
      <div
        className="flex items-center gap-2 flex-1 overflow-x-auto"
        style={{ scrollbarWidth: "none" }}
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
                    className="w-6 h-6"
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
                    backgroundColor: config.color,
                    color: "#000",
                  }}
                >
                  x{count}
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
