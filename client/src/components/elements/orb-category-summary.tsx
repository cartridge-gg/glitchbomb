import { forwardRef } from "react";
import { BagIcon, BoltIcon } from "@/components/icons";
import { Orb, OrbType } from "@/models";
import { OrbDisplay } from "./orb-display";

export interface OrbCategorySummaryProps {
  orbs: Orb[];
  onClick?: () => void;
}

type OrbCategory = "bomb" | "point" | "multiplier" | "health" | "special";

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
    color: "#FFFFFF",
  },
  point: {
    orb: new Orb(OrbType.Point5),
    color: "#36F818",
  },
  multiplier: {
    orb: new Orb(OrbType.Multiplier50),
    color: "#4C91FF",
  },
  health: {
    orb: new Orb(OrbType.Health1),
    color: "#FF0099",
  },
  special: {
    orb: new Orb(OrbType.Moonrock15),
    color: "#9747FF",
  },
};

const getOrbCategory = (orb: Orb): OrbCategory | null => {
  if (orb.isBomb()) return "bomb";
  if (orb.isPoint()) return "point";
  if (orb.isMultiplier()) return "multiplier";
  if (orb.isHealth()) return "health";
  if (orb.isChips()) return "special";
  if (orb.isMoonrock()) return "special";
  return null;
};

export const OrbCategorySummary = forwardRef<
  HTMLButtonElement,
  OrbCategorySummaryProps
>(({ orbs, onClick }, ref) => {
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
    "special",
  ];
  const categoriesToShow = displayOrder;

  return (
    <button
      ref={ref}
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
        className="flex items-center justify-around flex-1 px-4 pt-2 pb-3 border border-[#071304]"
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
            const count = categoryCounts[category] || 0;

            return (
              <div
                key={category}
                className="relative flex-shrink-0"
                data-orb-category={category}
              >
                {category === "special" ? (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden"
                    style={{
                      borderWidth: "1px",
                      borderStyle: "solid",
                      borderColor: config.color,
                    }}
                  >
                    <BoltIcon
                      className="w-2.5 h-2.5"
                      style={{
                        color: config.color,
                        filter: `drop-shadow(0 0 3px ${config.color})`,
                      }}
                    />
                  </div>
                ) : (
                  <OrbDisplay orb={config.orb} size="xs" showValue={false} />
                )}
                {/* Count pill */}
                <div
                  className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-1.5 py-[1px] rounded-full text-[9px] font-bold font-secondary"
                  style={{
                    backgroundColor: darkenHex(config.color, 0.35),
                    border: `1px solid ${config.color}`,
                    color: config.color,
                  }}
                >
                  <span
                    className="font-secondary font-bold"
                    style={{
                      color: hexToRgba(config.color, 0.25),
                      fontSize: "8px",
                    }}
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
});

OrbCategorySummary.displayName = "OrbCategorySummary";
