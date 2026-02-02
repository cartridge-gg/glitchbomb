import { useState } from "react";
import { OrbDisplay } from "@/components/elements";
import { cn } from "@/lib/utils";
import type { Orb } from "@/models";

export interface GameStashProps {
  orbs: Orb[];
}

type TabType = "orbs" | "list";

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

// List icon for list tab
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
  return (
    <>
      {/* Subtitle */}
      <p className="text-green-600 font-secondary text-sm tracking-wide">
        Orbs in your bag that can be pulled
      </p>

      {/* Orbs grid */}
      <div className="flex flex-col items-start">
        {orbs.length > 0 ? (
          <div className="grid grid-cols-3 gap-6 py-4 justify-items-start w-full">
            {orbs.map((orb, index) => (
              <div key={index} className="flex flex-col items-start gap-4">
                <OrbDisplay orb={orb} size="lg" />
                <p className="text-green-500 text-2xs font-secondary uppercase tracking-wide text-left">
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

const ListTab = ({ orbs }: { orbs: Orb[] }) => {
  return (
    <>
      {/* Subtitle */}
      <p className="text-green-600 font-secondary text-sm tracking-wide">
        List view of the orbs in your bag
      </p>

      {/* Orbs list */}
      <div className="flex flex-col gap-2 py-4">
        {orbs.length > 0 ? (
          orbs.map((orb, index) => (
            <div
              key={`${orb.value}-${index}`}
              className="flex items-center gap-3 p-2 rounded-lg border border-green-900 bg-green-950/30"
            >
              {/* Orb icon */}
              <OrbDisplay orb={orb} size="sm" />

              {/* Orb info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-primary text-sm tracking-wide">
                  {orb.name()}
                </h3>
                <p className="text-green-600 font-secondary text-2xs tracking-wider uppercase">
                  {orb.description()}
                </p>
              </div>
            </div>
          ))
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

export const GameStash = ({ orbs }: GameStashProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("orbs");

  return (
    <div className="flex flex-col gap-[clamp(8px,2svh,16px)] max-w-[420px] mx-auto px-4 py-[clamp(6px,1.6svh,12px)] h-full min-h-0">
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex flex-col gap-[clamp(4px,1svh,8px)]">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-white uppercase font-primary text-[clamp(1.5rem,4.5svh,2rem)] text-left">
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
              active={activeTab === "list"}
              onClick={() => setActiveTab("list")}
            >
              <ListIcon className="w-6 h-6" />
            </TabButton>
          </div>
        </div>

        <div
          className="flex-1 min-h-0 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {/* Tab Content */}
          {activeTab === "orbs" ? (
            <OrbsTab orbs={orbs} />
          ) : (
            <ListTab orbs={orbs} />
          )}
        </div>
      </div>
    </div>
  );
};
