import { useMemo } from "react";
import { OrbIcon } from "@/components/elements";
import {
  TapTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Orb } from "@/models";

export interface GameStashProps {
  orbs: Orb[];
  discards?: boolean[];
  pendingOrbs?: Orb[];
  onRemovePending?: (index: number) => void;
}

const OrbsTab = ({ orbs, discards }: { orbs: Orb[]; discards?: boolean[] }) => {
  return (
    <div className="flex justify-center w-full">
      <TooltipProvider delayDuration={0}>
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 w-full gap-4">
          {orbs.map((orb, i) => {
            const isDiscarded = Boolean(discards?.[i]);
            return (
              <TapTooltip key={`${orb.value}-${i}`}>
                <TooltipTrigger asChild>
                  <OrbIcon
                    data-discarded={isDiscarded}
                    orb={orb}
                    size="md"
                    className="data-[discarded=true]:opacity-25"
                  />
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

export const GameStash = ({
  orbs,
  discards,
  pendingOrbs,
  onRemovePending,
}: GameStashProps) => {
  const hasPending = pendingOrbs && pendingOrbs.length > 0;

  const sorted = useMemo(() => {
    const indices = orbs.map((_, i) => i);
    indices.sort((a, b) => kindOrder(orbs[a]) - kindOrder(orbs[b]));
    return {
      orbs: indices.map((i) => orbs[i]),
      discards: discards ? indices.map((i) => discards[i]) : undefined,
    };
  }, [orbs, discards]);

  const sortedPending = useMemo(() => {
    if (!pendingOrbs) return [];
    const indices = pendingOrbs.map((_, i) => i);
    indices.sort(
      (a, b) => kindOrder(pendingOrbs[a]) - kindOrder(pendingOrbs[b]),
    );
    return indices;
  }, [pendingOrbs]);

  return (
    <div className="flex flex-col gap-[clamp(6px,1.6svh,12px)] w-full max-w-[420px] mx-auto px-5 py-[clamp(8px,2svh,16px)] h-full min-h-0 text-left">
      <div className="flex-1 min-h-0 flex flex-col">
        {/* Header (only when no pending orbs) */}
        {!hasPending && (
          <div className="flex items-center justify-between w-full mb-[clamp(8px,2svh,16px)]">
            <h1 className="text-green-400 font-secondary text-[clamp(1.05rem,3svh,1.25rem)] tracking-wide text-left">
              {`Your orbs (${orbs.length})`}
            </h1>
          </div>
        )}

        <div
          className="flex-1 min-h-0 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {/* Purchasing section */}
          {hasPending && pendingOrbs && onRemovePending && (
            <>
              <h1 className="text-green-400 font-secondary text-[clamp(1.05rem,3svh,1.25rem)] tracking-wide text-left mb-[clamp(8px,2svh,16px)]">
                {`Purchasing (${pendingOrbs.length})`}
              </h1>
              <div className="flex justify-center w-full mb-[clamp(12px,3svh,20px)]">
                <TooltipProvider delayDuration={0}>
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 w-full gap-x-[clamp(8px,3vw,16px)] gap-y-4 pb-3 place-items-center">
                    {sortedPending.map((originalIndex) => {
                      const orb = pendingOrbs[originalIndex];
                      return (
                        <TapTooltip
                          key={`pending-${orb.value}-${originalIndex}`}
                        >
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="flex flex-col items-center cursor-pointer"
                              onClick={() => onRemovePending(originalIndex)}
                            >
                              <OrbIcon orb={orb} size="md" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-black border border-white/10 px-3 py-2 max-w-[200px]">
                            <p
                              className="font-secondary text-xs font-bold"
                              style={{ color: orb.color() }}
                            >
                              {orb.name()}
                            </p>
                            <p className="font-secondary text-xs mt-0.5 text-red-400">
                              Tap to remove
                            </p>
                          </TooltipContent>
                        </TapTooltip>
                      );
                    })}
                  </div>
                </TooltipProvider>
              </div>

              {/* Your Orbs header */}
              <h1 className="text-green-400 font-secondary text-[clamp(1.05rem,3svh,1.25rem)] tracking-wide text-left mb-[clamp(8px,2svh,16px)]">
                {`Your orbs (${orbs.length})`}
              </h1>
            </>
          )}

          {/* Orbs content */}
          <OrbsTab orbs={sorted.orbs} discards={sorted.discards} />
        </div>
      </div>
    </div>
  );
};
