import { useMemo, useState } from "react";
import {
  OrbDisplay,
  RarityPill,
  TabBar,
  type TabBarItem,
} from "@/components/elements";
import {
  TapTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Orb } from "@/models";
import { OrbType } from "@/models/orb";

export interface GameStashProps {
  orbs: Orb[];
  discards?: boolean[];
  pendingOrbs?: Orb[];
  onRemovePending?: (index: number) => void;
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

const bombDamage = (orb: Orb): number | undefined => {
  if (orb.value === OrbType.Bomb1 || orb.value === OrbType.StickyBomb) return 1;
  if (orb.value === OrbType.Bomb2) return 2;
  if (orb.value === OrbType.Bomb3) return 3;
  return undefined;
};

const OrbsTab = ({ orbs, discards }: { orbs: Orb[]; discards?: boolean[] }) => {
  return (
    <div className="flex flex-col items-start w-full">
      {orbs.length > 0 ? (
        <div className="flex justify-center w-full">
          <TooltipProvider delayDuration={0}>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 w-full gap-x-[clamp(8px,3vw,16px)] gap-y-4 pb-3 place-items-center">
              {orbs.map((orb, i) => {
                const isDiscarded = Boolean(discards?.[i]);
                return (
                  <TapTooltip key={`${orb.value}-${i}`}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "flex flex-col items-center",
                          isDiscarded && "opacity-25",
                        )}
                      >
                        <OrbDisplay
                          orb={orb}
                          size="sm"
                          valuePosition="top-right"
                          count={bombDamage(orb)}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-black border border-white/10 px-3 py-2 max-w-[200px]">
                      <p
                        className="font-secondary text-xs font-bold"
                        style={{ color: orb.color() }}
                      >
                        {orb.name()}
                      </p>
                      <p
                        className="font-secondary text-xs mt-0.5 opacity-50"
                        style={{ color: orb.color() }}
                      >
                        {orb.description()}
                      </p>
                    </TooltipContent>
                  </TapTooltip>
                );
              })}
            </div>
          </TooltipProvider>
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
  return (
    <div className="flex flex-col gap-1 pb-4 w-full">
      {orbs.length > 0 ? (
        orbs.map((orb, i) => {
          const isDiscarded = Boolean(discards?.[i]);
          return (
            <div
              key={`${orb.value}-${i}`}
              className={cn(
                "flex items-center gap-3 px-2 py-1.5 rounded-md bg-green-950/30 w-full",
                isDiscarded && "opacity-25",
              )}
            >
              {/* Orb icon */}
              <OrbDisplay
                orb={orb}
                size="xs"
                bombTierIcons
                valuePosition="top-right"
                count={bombDamage(orb)}
              />

              {/* Orb info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-secondary text-[11px] tracking-[0.3em] uppercase flex-1 min-w-0">
                    {orb.name()}
                  </h3>
                  {!orb.isBomb() && (
                    <RarityPill rarity={orb.rarity()} className="ml-auto" />
                  )}
                </div>
                <p className="text-white/60 font-secondary text-[10px] tracking-[0.2em]">
                  {orb.description()}
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

const kindOrder = (orb: Orb): number => {
  if (orb.isBomb()) return 0;
  if (orb.isPoint()) return 1;
  if (orb.isMultiplier()) return 2;
  if (orb.isHealth()) return 3;
  if (orb.isChips()) return 4;
  if (orb.isMoonrock()) return 5;
  if (orb.isCurse()) return 6;
  return 7;
};

const PurchasingSection = ({
  orbs,
  onRemove,
}: {
  orbs: Orb[];
  onRemove?: (index: number) => void;
}) => {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-orange-400 font-secondary text-[clamp(0.85rem,2.4svh,1rem)] tracking-wide">
        {`Purchasing (${orbs.length})`}
      </h2>
      <div className="flex flex-wrap gap-2 pb-2">
        {orbs.map((orb, i) => (
          <div key={`pending-${orb.value}-${i}`} className="relative group">
            <OrbDisplay orb={orb} size="sm" valuePosition="top-right" />
            {onRemove && (
              <button
                type="button"
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-900/90 border border-red-500/50 flex items-center justify-center hover:bg-red-700 z-10"
                onClick={() => onRemove(i)}
              >
                <span className="text-red-200 text-xs leading-none font-bold">
                  ×
                </span>
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="w-full h-px bg-green-900/40" />
    </div>
  );
};

export const GameStash = ({
  orbs,
  discards,
  pendingOrbs,
  onRemovePending,
}: GameStashProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("orbs");
  const tabItems: Array<TabBarItem<TabType>> = [
    { id: "orbs", Icon: GridIcon },
    { id: "list", Icon: ListIcon },
  ];

  const sorted = useMemo(() => {
    const indices = orbs.map((_, i) => i);
    indices.sort((a, b) => kindOrder(orbs[a]) - kindOrder(orbs[b]));
    return {
      orbs: indices.map((i) => orbs[i]),
      discards: discards ? indices.map((i) => discards[i]) : undefined,
    };
  }, [orbs, discards]);

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
          {/* Purchasing section */}
          {pendingOrbs && pendingOrbs.length > 0 && (
            <PurchasingSection orbs={pendingOrbs} onRemove={onRemovePending} />
          )}

          {/* Tab Content */}
          {activeTab === "orbs" ? (
            <OrbsTab orbs={sorted.orbs} discards={sorted.discards} />
          ) : (
            <ListTab orbs={sorted.orbs} discards={sorted.discards} />
          )}
        </div>
      </div>
    </div>
  );
};
