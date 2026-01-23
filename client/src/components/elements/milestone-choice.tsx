import { BombIcon, ChipIcon, MoonrockIcon } from "@/components/icons";
import { InfoCard } from "./info-card";

export interface MilestoneChoiceProps {
  moonrocks: number; // Current pack moonrocks
  points: number; // Current game points (will become chips on continue, added to moonrocks on cash out)
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
}: MilestoneChoiceProps) => {
  const isLoading = isEnteringShop || isCashingOut;
  const totalMoonrocks = moonrocks + points;

  return (
    <div className="flex flex-col gap-3 w-full h-full max-h-[600px]">
      {/* Cash Out Card - clickable */}
      <InfoCard
        variant="yellow"
        label="Cash Out"
        onClick={onCashOut}
        disabled={isLoading}
        isLoading={isCashingOut}
        className="flex-1"
      >
        <MoonrockIcon className="w-10 h-10 text-yellow-400" />
        <span className="text-yellow-400 font-secondary text-xl tracking-wider">
          {totalMoonrocks} MOON ROCKS
        </span>
      </InfoCard>

      {/* Continue Card - clickable */}
      <InfoCard
        variant="orange"
        label="Continue"
        onClick={onEnterShop}
        disabled={isLoading}
        isLoading={isEnteringShop}
        className="flex-1"
        hideInner
      >
        <div className="flex gap-3 w-full h-full">
          {/* Reward Inner Card */}
          <div className="flex-1 flex flex-col items-center justify-center gap-3 rounded-lg py-6 px-4 bg-black/30">
            <span className="text-orange-400 font-secondary text-xs tracking-[0.3em] uppercase">
              Reward
            </span>
            <div className="flex items-center gap-2">
              <ChipIcon size="md" className="text-orange-300" />
              <span className="text-orange-300 font-glitch text-2xl">
                +{points}
              </span>
            </div>
            <span className="text-orange-400/70 font-secondary text-xs tracking-wider">
              Gain Chips
            </span>
          </div>

          {/* Curse Inner Card */}
          <div className="flex-1 flex flex-col items-center justify-center gap-3 rounded-lg py-6 px-4 bg-black/30">
            <span className="text-red-400 font-secondary text-xs tracking-[0.3em] uppercase">
              Curse
            </span>
            <div className="flex items-center gap-2">
              <BombIcon className="w-6 h-6 text-red-400" />
              <span className="text-red-400 font-glitch text-2xl">+1</span>
            </div>
            <span className="text-red-400/70 font-secondary text-xs tracking-wider">
              Random Curse
            </span>
          </div>
        </div>
      </InfoCard>
    </div>
  );
};
