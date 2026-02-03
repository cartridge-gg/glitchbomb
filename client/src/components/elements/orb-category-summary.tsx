import { BagIcon } from "@/components/icons";
import { Orb, OrbType } from "@/models";
import { OrbDisplay } from "./orb-display";

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
  orb: Orb;
  color: string;
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

const hexToRgba = (color: string, alpha: number) => {
  if (!color.startsWith("#") || color.length !== 7) return color;
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const categoryConfig: Record<OrbCategory, CategoryConfig> = {
  bomb: {
    orb: new Orb(OrbType.Bomb1),
    color: "#FF1E00",
  },
  point: {
    orb: new Orb(OrbType.Point5),
    color: "#36F818",
  },
  multiplier: {
    orb: new Orb(OrbType.Multiplier50),
    color: "#FFF121",
  },
  health: {
    orb: new Orb(OrbType.Health1),
    color: "#FE5578",
  },
  chip: {
    orb: new Orb(OrbType.Chips15),
    color: "#FFF121",
  },
  moonrock: {
    orb: new Orb(OrbType.Moonrock15),
    color: "#7487FF",
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
            const count = categoryCounts[category];

            return (
              <div key={category} className="relative flex-shrink-0">
                <OrbDisplay
                  orb={config.orb}
                  size="xs"
                  showValue={false}
                  glowScale={0.35}
                />
                {/* Count pill */}
                <div
                  className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-1.5 py-[1px] rounded-full text-[9px] font-bold font-secondary"
                  style={{
                    backgroundColor: darkenHex(config.color, 0.35),
                    border: `1.5px solid ${config.color}`,
                    color: config.color,
                  }}
                >
                  <span
                    className="font-secondary"
                    style={{ color: hexToRgba(config.color, 0.25) }}
                  >
                    X
                  </span>
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
