import { useState } from "react";
import { cn } from "@/lib/utils";
import type { OrbPulled } from "@/models";
import { type PLDataPoint, PLGraph } from "./pl-graph";

export interface PLChartTabsProps {
  data: PLDataPoint[];
  pulls: OrbPulled[];
  className?: string;
  mode?: "delta" | "absolute";
  title?: string;
  baseline?: number;
}

type TabType = "chart" | "logs";

// Chart icon
const ChartIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 3v18h18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7 14l4-4 4 4 5-5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Logs icon
const LogsIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="3" y="4" width="18" height="2" rx="1" fill="currentColor" />
    <rect x="3" y="9" width="14" height="2" rx="1" fill="currentColor" />
    <rect x="3" y="14" width="16" height="2" rx="1" fill="currentColor" />
    <rect x="3" y="19" width="10" height="2" rx="1" fill="currentColor" />
  </svg>
);

const TabButton = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all",
      active
        ? "bg-green-800 text-green-400"
        : "text-green-900 hover:text-green-700",
    )}
  >
    {children}
  </button>
);

// Get category name for an orb
const getOrbCategory = (orb: OrbPulled["orb"]): string => {
  if (orb.isPoint()) return "POINTS";
  if (orb.isMultiplier()) return "MULTIPLIER";
  if (orb.isBomb()) return "BOMB";
  if (orb.isHealth()) return "HEALTH";
  if (orb.isMoonrock()) return "MOONROCK";
  if (orb.isChips()) return "CHIPS";
  if (orb.isCurse()) return "CURSE";
  return "SPECIAL";
};

// Get category color for an orb
const getCategoryColor = (orb: OrbPulled["orb"]): string => {
  if (orb.isPoint()) return "text-green-400";
  if (orb.isMultiplier()) return "text-yellow-400";
  if (orb.isBomb()) return "text-red-400";
  if (orb.isHealth()) return "text-pink-400";
  if (orb.isMoonrock()) return "text-blue-400";
  if (orb.isChips()) return "text-orange-400";
  if (orb.isCurse()) return "text-purple-400";
  return "text-green-400";
};

// Get effect text for an orb
const getOrbEffect = (orb: OrbPulled["orb"]): string => {
  // Points
  if (orb.value === "Point5") return "+5 POINTS";
  if (orb.value === "Point6") return "+6 POINTS";
  if (orb.value === "Point7") return "+7 POINTS";
  if (orb.value === "Point8") return "+8 POINTS";
  if (orb.value === "Point9") return "+9 POINTS";
  if (orb.value === "PointOrb1") return "+1 POINT PER ORB";
  if (orb.value === "PointBomb4") return "+4 POINTS PER BOMB";

  // Multipliers
  if (orb.value === "Multiplier50") return "+1X MULTIPLIER";
  if (orb.value === "Multiplier100") return "+2X MULTIPLIER";
  if (orb.value === "Multiplier150") return "+3X MULTIPLIER";

  // Bombs
  if (orb.value === "Bomb1") return "SINGLE BOMB: -1 HEALTH";
  if (orb.value === "Bomb2") return "DOUBLE BOMB: -2 HEALTH";
  if (orb.value === "Bomb3") return "TRIPLE BOMB: -3 HEALTH";

  // Health
  if (orb.value === "Health1") return "+1 HEALTH";
  if (orb.value === "Health2") return "+2 HEALTH";
  if (orb.value === "Health3") return "+3 HEALTH";

  // Moonrocks
  if (orb.value === "Moonrock15") return "+15 MOONROCKS";
  if (orb.value === "Moonrock40") return "+40 MOONROCKS";

  // Chips
  if (orb.value === "Chips15") return "+15 CHIPS";

  // Curse
  if (orb.value === "CurseScoreDecrease") return "-20% SCORE";

  return orb.name().toUpperCase();
};

const LogsView = ({ pulls }: { pulls: OrbPulled[] }) => {
  // Sort by id ascending (oldest first, like a chat log)
  const sortedPulls = [...pulls].sort((a, b) => a.id - b.id);

  if (sortedPulls.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-green-600 font-secondary text-sm tracking-widest">
          No pulls yet
        </span>
      </div>
    );
  }

  return (
    <div
      className="flex-1 flex flex-col p-2 overflow-y-auto gap-1"
      style={{ scrollbarWidth: "none" }}
    >
      {sortedPulls.map((pull) => {
        const category = getOrbCategory(pull.orb);
        const effect = getOrbEffect(pull.orb);
        const colorClass = getCategoryColor(pull.orb);

        return (
          <div
            key={`${pull.pack_id}-${pull.game_id}-${pull.id}`}
            className="flex items-center"
          >
            <span
              className={`font-secondary text-xs tracking-widest uppercase ${colorClass}`}
            >
              {category}
            </span>
            <span className="font-secondary text-xs tracking-widest text-green-700 mx-1">
              {">"}
            </span>
            <span
              className={`font-secondary text-xs tracking-widest uppercase ${colorClass}`}
            >
              {effect}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export const PLChartTabs = ({
  data,
  pulls,
  className = "",
  mode = "absolute",
  title = "POTENTIAL",
  baseline,
}: PLChartTabsProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("chart");

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-green-950 rounded-xl">
        <TabButton
          active={activeTab === "chart"}
          onClick={() => setActiveTab("chart")}
        >
          <ChartIcon className="w-5 h-5" />
          <span className="font-secondary text-sm tracking-widest">P/L</span>
        </TabButton>
        <TabButton
          active={activeTab === "logs"}
          onClick={() => setActiveTab("logs")}
        >
          <LogsIcon className="w-5 h-5" />
          <span className="font-secondary text-sm tracking-widest">HISTORY</span>
        </TabButton>
      </div>

      {/* Tab Content */}
      {activeTab === "chart" ? (
        <PLGraph data={data} mode={mode} title={title} baseline={baseline} />
      ) : (
        <div
          className="h-[140px] overflow-y-auto"
          style={{
            scrollbarWidth: "none",
            maskImage: "linear-gradient(to bottom, black 75%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 75%, transparent 100%)",
          }}
        >
          <LogsView pulls={pulls} />
        </div>
      )}
    </div>
  );
};
