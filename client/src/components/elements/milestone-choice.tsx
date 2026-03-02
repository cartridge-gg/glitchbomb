import { ChipIcon, GlitchBombIcon, MoonrockIcon } from "@/components/icons";
import { CardDivider } from "./card-divider";
import { InfoCard } from "./info-card";

export interface MilestoneChoiceProps {
  moonrocks: number; // Current pack moonrocks
  points: number; // Current game points (will become chips on continue, added to moonrocks on cash out)
  ante?: number; // Moonrocks deducted when continuing to the next level
  nextCurseLabel?: string; // Optional label if the next level has a known curse
  onCashOut: () => void;
  onEnterShop: () => void;
  isEnteringShop?: boolean;
  isCashingOut?: boolean;
}

export const MilestoneChoice = ({
  moonrocks,
  points,
  ante,
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
  const showAnte = ante != null && ante > 0;
  const rewardValueClass =
    "font-secondary text-[clamp(0.9rem,3svh,1.5rem)] leading-none";
  const rewardLabelClass =
    "font-secondary text-[clamp(0.5rem,1.1svh,0.7rem)] tracking-wider";
  const rewardIconClass = "w-[clamp(18px,4svh,24px)] h-[clamp(18px,4svh,24px)]";

  return (
    <div className="flex flex-col justify-center gap-[clamp(8px,2.2svh,18px)] w-full h-full">
      {/* Cash Out Card - clickable */}
      <InfoCard
        variant="yellow"
        label="Cash Out"
        onClick={onCashOut}
        disabled={isLoading}
        isLoading={isCashingOut}
        className="flex-1"
        contentClassName="p-[clamp(8px,2svh,12px)] gap-[clamp(8px,2.2svh,18px)]"
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
          <CardDivider className="bg-yellow-100" />
          {/* Content */}
          <div className="flex-1 flex flex-col items-center justify-center gap-[clamp(6px,2svh,18px)] py-[clamp(8px,2.2svh,16px)] px-[clamp(8px,2.2svh,14px)]">
            <div className="flex items-center justify-center gap-1">
              <MoonrockIcon className={`${rewardIconClass} text-yellow-400`} />
              <span className={`text-yellow-400 ${rewardValueClass}`}>
                +{totalMoonrocks}
              </span>
            </div>
            <span className={`text-yellow-400/70 ${rewardLabelClass}`}>
              Moon Rocks
            </span>
          </div>
        </div>
      </InfoCard>

      {/* Continue Card - clickable */}
      <InfoCard
        variant="orange"
        onClick={onEnterShop}
        disabled={isLoading}
        isLoading={isEnteringShop}
        className="flex-1"
        contentClassName="p-[clamp(8px,2svh,12px)] gap-[clamp(8px,2.2svh,18px)]"
        labelClassName="text-[clamp(0.55rem,1.2svh,0.75rem)] tracking-[0.32em]"
        hideInner
      >
        {/* Custom header row: Continue label + Ante pill */}
        <div className="flex items-center justify-between w-full">
          <span className="text-orange-400 font-secondary text-sm tracking-[0.4em] uppercase text-[clamp(0.55rem,1.2svh,0.75rem)]">
            Continue
          </span>
          {showAnte && (
            <div
              className="flex items-center rounded-md overflow-hidden"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}
            >
              <div
                className="flex items-center justify-center px-[clamp(6px,1.2svh,10px)] py-[clamp(2px,0.5svh,4px)]"
                style={{ backgroundColor: "rgba(0, 0, 0, 0.15)" }}
              >
                <span className="text-orange-400 font-secondary text-[clamp(0.45rem,0.9svh,0.6rem)] tracking-[0.25em] uppercase">
                  Ante
                </span>
              </div>
              <div className="w-px self-stretch bg-orange-400/20" />
              <div className="flex items-center gap-1 px-[clamp(6px,1.2svh,10px)] py-[clamp(2px,0.5svh,4px)]">
                <MoonrockIcon className="w-[clamp(10px,2svh,14px)] h-[clamp(10px,2svh,14px)] text-orange-400" />
                <span className="text-orange-400 font-secondary text-[clamp(0.55rem,1.1svh,0.75rem)] leading-none">
                  -{ante}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-[clamp(8px,2.2svh,18px)] w-full h-full">
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
            <CardDivider className="bg-orange-100" />
            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center gap-[clamp(6px,2svh,18px)] py-[clamp(8px,2.2svh,16px)] px-[clamp(8px,2.2svh,14px)]">
              <div className="flex items-center gap-2">
                <ChipIcon
                  size="md"
                  className={`text-orange-400 ${rewardIconClass}`}
                />
                <span className={`text-orange-400 ${rewardValueClass}`}>
                  +{points}
                </span>
              </div>
              <span className={`text-orange-400/70 ${rewardLabelClass}`}>
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
              <CardDivider className="bg-orange-100" />
              {/* Content */}
              <div className="flex-1 flex flex-col items-center justify-center gap-[clamp(6px,2svh,18px)] py-[clamp(8px,2.2svh,16px)] px-[clamp(8px,2.2svh,14px)]">
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
