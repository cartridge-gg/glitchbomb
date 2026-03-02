import { useState } from "react";
import {
  OrbDisplay,
  RarityPill,
  TabBar,
  type TabBarItem,
} from "@/components/elements";
import { cn } from "@/lib/utils";
import type { Orb } from "@/models";

export interface GameStashProps {
  orbs: Orb[];
  discards?: boolean[];
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

interface OrbGroup {
  orb: Orb;
  count: number;
  discardedCount: number;
}

const groupOrbs = (orbs: Orb[], discards?: boolean[]): OrbGroup[] => {
  const map = new Map<string, OrbGroup>();
  for (let i = 0; i < orbs.length; i++) {
    const orb = orbs[i];
    const key = orb.value;
    const isDiscarded = Boolean(discards?.[i]);
    const existing = map.get(key);
    if (existing) {
      existing.count += 1;
      if (isDiscarded) existing.discardedCount += 1;
    } else {
      map.set(key, { orb, count: 1, discardedCount: isDiscarded ? 1 : 0 });
    }
  }
  return Array.from(map.values());
};

const OrbsTab = ({ orbs, discards }: { orbs: Orb[]; discards?: boolean[] }) => {
  const groups = groupOrbs(orbs, discards);

  return (
    <div className="flex flex-col items-start w-full">
      {groups.length > 0 ? (
        <div className="flex justify-center w-full">
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 w-full gap-x-[clamp(8px,3vw,16px)] gap-y-4 pb-3 place-items-center">
            {groups.map((group) => {
              const allDiscarded = group.discardedCount === group.count;
              return (
                <div
                  key={group.orb.value}
                  className={cn(
                    "flex flex-col items-center",
                    allDiscarded && "opacity-25",
                  )}
                >
                  <OrbDisplay
                    orb={group.orb}
                    size="sm"
                    bombTierIcons
                    valuePosition="top-right"
                    count={group.count}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-green-600 text-center font-secondary text-sm tracking-wide">
            No orbs in your bag yet
          </p>
        </div>
      )}
    </div>
  );
};

const ListTab = ({ orbs, discards }: { orbs: Orb[]; discards?: boolean[] }) => {
  const groups = groupOrbs(orbs, discards);

  return (
    <div className="flex flex-col gap-1 pb-4 w-full">
      {groups.length > 0 ? (
        groups.map((group) => {
          const allDiscarded = group.discardedCount === group.count;
          return (
            <div
              key={group.orb.value}
              className={cn(
                "flex items-center gap-3 px-2 py-1.5 rounded-md bg-green-950/30 w-full",
                allDiscarded && "opacity-25",
              )}
            >
              {/* Orb icon */}
              <OrbDisplay
                orb={group.orb}
                size="xs"
                bombTierIcons
                valuePosition="top-right"
                count={group.count}
              />

              {/* Orb info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-secondary text-[11px] tracking-[0.3em] uppercase flex-1 min-w-0">
                    {group.orb.name()}
                  </h3>
                  {!group.orb.isBomb() && (
                    <RarityPill
                      rarity={group.orb.rarity()}
                      className="ml-auto"
                    />
                  )}
                </div>
                <p className="text-white/60 font-secondary text-[10px] tracking-[0.2em]">
                  {group.orb.description()}
                </p>
              </div>
            </div>
          );
        })
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-green-600 text-center font-secondary text-sm tracking-wide">
            No orbs in your bag yet
          </p>
        </div>
      )}
    </div>
  );
};

export const GameStash = ({ orbs, discards }: GameStashProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("orbs");
  const tabItems: Array<TabBarItem<TabType>> = [
    { id: "orbs", Icon: GridIcon },
    { id: "list", Icon: ListIcon },
  ];

  return (
    <div className="flex flex-col gap-[clamp(6px,1.6svh,12px)] w-full max-w-[420px] mx-auto px-5 py-[clamp(8px,2svh,16px)] h-full min-h-0 text-left">
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex flex-col gap-0">
          {/* Header */}
          <div className="flex items-center justify-between w-full">
            <h1 className="text-green-400 font-secondary text-[clamp(1.05rem,3svh,1.25rem)] tracking-wide text-left">
              {`Your orbs (${orbs.length})`}
            </h1>
          </div>

          {/* Tabs */}
          <TabBar
            items={tabItems}
            active={activeTab}
            onChange={setActiveTab}
            className="w-full mt-2 mb-[clamp(8px,2svh,16px)]"
          />
        </div>

        <div
          className="flex-1 min-h-0 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {/* Tab Content */}
          {activeTab === "orbs" ? (
            <OrbsTab orbs={orbs} discards={discards} />
          ) : (
            <ListTab orbs={orbs} discards={discards} />
          )}
        </div>
      </div>
    </div>
  );
};
