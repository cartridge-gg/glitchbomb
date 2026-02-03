import { ChipIcon, GlitchBombIcon, MoonrockIcon } from "@/components/icons";
import { InfoCard } from "./info-card";

export interface MilestoneChoiceProps {
  moonrocks: number; // Current pack moonrocks
  points: number; // Current game points (will become chips on continue, added to moonrocks on cash out)
  nextCurseLabel?: string; // Optional label if the next level has a known curse
  onCashOut: () => void;
  onEnterShop: () => void;
  isEnteringShop?: boolean;
  isCashingOut?: boolean;
}

export const MilestoneChoice = ({
  moonrocks,
  points,
  onCashOut,
  onEnterShop,
  isEnteringShop = false,
  isCashingOut = false,
  nextCurseLabel,
}: MilestoneChoiceProps) => {
  const isLoading = isEnteringShop || isCashingOut;
  const totalMoonrocks = moonrocks + points;
  const curseLabel = nextCurseLabel?.trim();
  const showCurse = Boolean(curseLabel);

  return (
    <div className="flex flex-col gap-[clamp(6px,1.4svh,10px)] w-full h-full">
      {/* Cash Out Card - clickable */}
      <InfoCard
        variant="yellow"
        label="Cash Out"
        onClick={onCashOut}
        disabled={isLoading}
        isLoading={isCashingOut}
        className="flex-1"
        contentClassName="p-[clamp(8px,2svh,12px)] gap-[clamp(6px,1.4svh,10px)]"
        labelClassName="text-[clamp(0.55rem,1.2svh,0.75rem)] tracking-[0.32em]"
        hideInner
      >
        <div
          className="flex-1 flex flex-col rounded-lg overflow-hidden w-full"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }}
        >
          {/* Header */}
          <div className="py-[clamp(1px,0.4svh,3px)] px-[clamp(8px,1.6svh,12px)]">
            <span className="text-yellow-400 font-secondary text-[clamp(0.5rem,1.1svh,0.6rem)] tracking-[0.3em] uppercase">
              Reward
            </span>
          </div>
          {/* Separator */}
          <div className="h-px bg-yellow-100 opacity-5" />
          {/* Content */}
          <div className="flex-1 flex flex-col items-center justify-center gap-[clamp(4px,1.2svh,10px)] py-[clamp(8px,2.2svh,16px)] px-[clamp(8px,2.2svh,14px)]">
            <div className="flex items-center justify-center gap-1">
              <MoonrockIcon className="w-[clamp(24px,5svh,36px)] h-[clamp(24px,5svh,36px)] text-yellow-400" />
              <span className="text-yellow-400 font-secondary text-[clamp(1rem,3.8svh,2rem)] leading-none">
                +{totalMoonrocks}
              </span>
            </div>
            <span className="text-yellow-400/70 font-secondary text-[clamp(0.55rem,1.3svh,0.8rem)] tracking-wider">
              Moon Rocks
            </span>
          </div>
        </div>
      </InfoCard>

      {/* Continue Card - clickable */}
      <InfoCard
        variant="orange"
        label="Continue"
        onClick={onEnterShop}
        disabled={isLoading}
        isLoading={isEnteringShop}
        className="flex-1"
        contentClassName="p-[clamp(8px,2svh,12px)] gap-[clamp(6px,1.4svh,10px)]"
        labelClassName="text-[clamp(0.55rem,1.2svh,0.75rem)] tracking-[0.32em]"
        hideInner
      >
        <div className="flex gap-[clamp(6px,1.4svh,10px)] w-full h-full">
          {/* Reward Inner Card */}
          <div
            className="flex-1 flex flex-col rounded-lg overflow-hidden"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }}
          >
            {/* Header */}
            <div className="py-[clamp(1px,0.4svh,3px)] px-[clamp(8px,1.6svh,12px)]">
              <span className="text-orange-400 font-secondary text-[clamp(0.5rem,1.1svh,0.6rem)] tracking-[0.3em] uppercase">
                Reward
              </span>
            </div>
            {/* Separator */}
            <div className="h-px bg-orange-100 opacity-5" />
            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center gap-[clamp(4px,1.2svh,10px)] py-[clamp(8px,2.2svh,16px)] px-[clamp(8px,2.2svh,14px)]">
              <div className="flex items-center gap-2">
                <ChipIcon
                  size="md"
                  className="text-orange-400 w-[clamp(18px,4svh,24px)] h-[clamp(18px,4svh,24px)]"
                />
                <span className="text-orange-400 font-secondary text-[clamp(0.9rem,3svh,1.5rem)] leading-none">
                  +{points}
                </span>
              </div>
              <span className="text-orange-400/70 font-secondary text-[clamp(0.5rem,1.1svh,0.7rem)] tracking-wider">
                Gain Chips
              </span>
            </div>
          </div>

          {/* Curse Inner Card */}
          {showCurse && (
            <div
              className="flex-1 flex flex-col rounded-lg overflow-hidden"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }}
            >
              {/* Header */}
              <div className="py-[clamp(1px,0.4svh,3px)] px-[clamp(8px,1.6svh,12px)]">
                <span className="text-red-400 font-secondary text-[clamp(0.5rem,1.1svh,0.6rem)] tracking-[0.3em] uppercase">
                  Curse
                </span>
              </div>
              {/* Separator */}
              <div className="h-px bg-orange-100 opacity-5" />
              {/* Content */}
              <div className="flex-1 flex flex-col items-center justify-center gap-[clamp(4px,1.2svh,10px)] py-[clamp(8px,2.2svh,16px)] px-[clamp(8px,2.2svh,14px)]">
                <div className="flex items-center gap-2">
                  <GlitchBombIcon className="w-[clamp(16px,3.6svh,22px)] h-[clamp(16px,3.6svh,22px)] text-red-400" />
                  <span className="text-red-400 font-secondary text-[clamp(0.7rem,2.1svh,0.95rem)] text-center leading-tight">
                    {curseLabel}
                  </span>
                </div>
                <span className="text-red-400/70 font-secondary text-[clamp(0.45rem,1svh,0.6rem)] tracking-[0.3em]">
                  Applied next level
                </span>
              </div>
            </div>
          )}
        </div>
      </InfoCard>
    </div>
  );
};
