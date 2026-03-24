import {
  Bomb2xIcon,
  ChipIcon,
  MoonrockIcon,
  StickyBombIcon,
} from "@/components/icons";
import { GlitchText } from "@/components/ui/glitch-text";
import { CashOutCard } from "./cash-out-card";
import { InfoCard } from "./info-card";

export interface MilestoneChoiceProps {
  moonrocks: number; // Current pack moonrocks
  points: number; // Current game points (will become chips on continue, added to moonrocks on cash out)
  ante?: number; // Moonrocks deducted when continuing to the next level
  cashOutValue?: string; // Formatted USD value of cashing out (e.g. "$1.23")
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
  cashOutValue,
  onCashOut,
  onEnterShop,
  isEnteringShop = false,
  isCashingOut = false,
  nextCurseLabel,
}: MilestoneChoiceProps) => {
  const isLoading = isEnteringShop || isCashingOut;
  const curseLabel = nextCurseLabel?.trim();
  const showCurse = Boolean(curseLabel);
  const showAnte = ante != null && ante > 0;
  const rewardValueClass =
    "font-secondary text-[clamp(0.8rem,2.5svh,1.25rem)] leading-none";
  const rewardLabelClass =
    "font-secondary text-[clamp(0.5rem,1.1svh,0.7rem)] tracking-wider";
  const rewardIconClass =
    "w-[clamp(18px,3.5svh,24px)] h-[clamp(18px,3.5svh,24px)]";

  return (
    <div className="flex flex-col justify-center gap-[clamp(8px,2.2svh,18px)] w-full h-full">
      {/* Continue Card - clickable */}
      <InfoCard
        variant="orange"
        onClick={onEnterShop}
        disabled={isLoading}
        isLoading={isEnteringShop}
        className="h-[clamp(120px,22svh,200px)]"
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
              <div className="w-px self-stretch bg-orange-100 opacity-5" />
              <div className="flex items-center gap-1 px-[clamp(6px,1.2svh,10px)] py-[clamp(2px,0.5svh,4px)]">
                <MoonrockIcon className="w-[clamp(10px,2svh,14px)] h-[clamp(10px,2svh,14px)] text-orange-400" />
                <GlitchText
                  className="text-orange-400 font-secondary text-[clamp(0.55rem,1.1svh,0.75rem)] leading-none"
                  text={`-${ante}`}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-[clamp(8px,2.2svh,18px)] w-full h-full">
          {/* Reward Inner Card */}
          <div
            className="flex-1 flex flex-col items-center justify-center gap-[clamp(2px,0.6svh,6px)] rounded-lg py-[clamp(8px,2.2svh,16px)] px-[clamp(8px,2.2svh,14px)]"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }}
          >
            <div className="flex items-center justify-center gap-[clamp(2px,0.5svh,5px)]">
              <ChipIcon
                className={`text-orange-400 ${rewardIconClass} shrink-0`}
              />
              <GlitchText
                className={`text-orange-400 ${rewardValueClass}`}
                text={`+${points}`}
              />
            </div>
            <span className={`text-orange-400/70 ${rewardLabelClass}`}>
              Gain Chips
            </span>
          </div>

          {/* Curse Inner Card */}
          {showCurse && (
            <div
              className="flex-1 flex flex-col items-center justify-center gap-[clamp(2px,0.6svh,6px)] rounded-lg py-[clamp(8px,2.2svh,16px)] px-[clamp(8px,2.2svh,14px)]"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }}
            >
              {curseLabel === "Sticky Bomb" ? (
                <StickyBombIcon className="w-[clamp(24px,5svh,34px)] h-[clamp(24px,5svh,34px)] text-white glitch-icon" />
              ) : (
                <Bomb2xIcon className="w-[clamp(28px,6svh,40px)] h-[clamp(28px,6svh,40px)] text-white glitch-icon" />
              )}
              <span className="text-white/70 font-secondary text-[clamp(0.5rem,1.1svh,0.7rem)] tracking-wider">
                {curseLabel === "Sticky Bomb" ? "Sticky Bomb" : "2x Bomb"}
              </span>
            </div>
          )}
        </div>
      </InfoCard>

      {/* Cash Out Card */}
      <CashOutCard
        moonrocks={moonrocks}
        reward={points}
        cashOutValue={cashOutValue}
        onClick={onCashOut}
        disabled={isLoading}
        isLoading={isCashingOut}
      />
    </div>
  );
};
