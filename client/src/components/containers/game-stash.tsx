import { useState } from "react";
import { OrbDisplay } from "@/components/elements";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Orb, OrbPulled } from "@/models";

export interface GameStashProps {
  orbs: Orb[];
  pulls: OrbPulled[];
  onClose: () => void;
}

type TabType = "orbs" | "logs";

// Grid icon for orbs tab
const GridIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" />
  </svg>
);

// List icon for logs tab
const ListIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="5" cy="6" r="2" fill="currentColor" />
    <rect x="10" y="5" width="11" height="2" rx="1" fill="currentColor" />
    <circle cx="5" cy="12" r="2" fill="currentColor" />
    <rect x="10" y="11" width="11" height="2" rx="1" fill="currentColor" />
    <circle cx="5" cy="18" r="2" fill="currentColor" />
    <rect x="10" y="17" width="11" height="2" rx="1" fill="currentColor" />
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
      "flex-1 flex items-center justify-center py-2 rounded-lg transition-all",
      active
        ? "bg-green-800 text-green-400"
        : "text-green-900 hover:text-green-700",
    )}
  >
    {children}
  </button>
);

const OrbsTab = ({ orbs }: { orbs: Orb[] }) => {
  // Filter out bombs and empty orbs for display
  const displayOrbs = orbs.filter((orb) => !orb.isBomb() && !orb.isNone());

  return (
    <>
      {/* Subtitle */}
      <p className="text-green-600 font-secondary text-sm tracking-wide">
        Orbs in your bag that can be pulled
      </p>

      {/* Orbs grid */}
      <div
        className="flex-1 flex flex-col overflow-y-auto"
        style={{ scrollbarWidth: "none" }}
      >
        {displayOrbs.length > 0 ? (
          <div className="grid grid-cols-3 gap-6 py-4 justify-items-center">
            {displayOrbs.map((orb, index) => (
              <div key={index} className="flex flex-col items-center gap-4">
                <OrbDisplay orb={orb} size="lg" />
                <p className="text-green-500 text-2xs font-secondary uppercase tracking-wide">
                  {orb.name()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-green-600 text-center font-secondary text-sm tracking-wide">
              No orbs in your bag yet
            </p>
          </div>
        )}
      </div>
    </>
  );
};

const LogsTab = ({ pulls }: { pulls: OrbPulled[] }) => {
  // Sort by id descending (most recent first)
  const sortedPulls = [...pulls].sort((a, b) => b.id - a.id);

  return (
    <>
      {/* Subtitle */}
      <p className="text-green-600 font-secondary text-sm tracking-wide">
        History of orbs you've pulled
      </p>

      {/* Logs list */}
      <div
        className="flex-1 flex flex-col overflow-y-auto gap-2 py-2"
        style={{ scrollbarWidth: "none" }}
      >
        {sortedPulls.length > 0 ? (
          sortedPulls.map((pull) => (
            <div
              key={`${pull.pack_id}-${pull.game_id}-${pull.id}`}
              className="flex items-center gap-3 p-3 rounded-lg bg-green-950/50"
            >
              {/* Orb icon */}
              <OrbDisplay orb={pull.orb} size="sm" />

              {/* Orb info */}
              <div className="flex-1 min-w-0">
                <p className="text-green-400 font-secondary text-sm truncate">
                  {pull.orb.name()}
                </p>
                <p className="text-green-600 font-secondary text-xs truncate">
                  {pull.orb.description()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-green-600 text-center font-secondary text-sm tracking-wide">
              No orbs pulled yet
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export const GameStash = ({ orbs, pulls, onClose }: GameStashProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("orbs");

  return (
    <div className="flex flex-col gap-4 max-w-[420px] mx-auto px-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-white uppercase text-3xl font-primary">
          YOUR STASH
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-green-950 rounded-xl">
        <TabButton
          active={activeTab === "orbs"}
          onClick={() => setActiveTab("orbs")}
        >
          <GridIcon className="w-6 h-6" />
        </TabButton>
        <TabButton
          active={activeTab === "logs"}
          onClick={() => setActiveTab("logs")}
        >
          <ListIcon className="w-6 h-6" />
        </TabButton>
      </div>

      {/* Tab Content */}
      {activeTab === "orbs" ? (
        <OrbsTab orbs={orbs} />
      ) : (
        <LogsTab pulls={pulls} />
      )}

      {/* Action button */}
      <div className="flex items-stretch gap-3 w-full pt-2">
        <Button
          variant="secondary"
          className="min-h-14 flex-1 font-secondary text-sm tracking-widest"
          onClick={onClose}
        >
          ← BACK
        </Button>
      </div>
    </div>
  );
};
