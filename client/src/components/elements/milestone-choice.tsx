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
        variant="red"
        label="Continue"
        onClick={onEnterShop}
        disabled={isLoading}
        isLoading={isEnteringShop}
        className="flex-1"
      >
        <div className="flex gap-4 w-full">
          {/* Reward */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <span className="text-green-500 font-secondary text-xs tracking-[0.2em] uppercase">
              Reward
            </span>
            <div className="flex items-center gap-2">
              <ChipIcon size="sm" className="text-orange-300" />
              <span className="text-orange-300 font-secondary text-lg">
                +{points}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px bg-red-900/50" />

          {/* Curse */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <span className="text-red-500 font-secondary text-xs tracking-[0.2em] uppercase">
              Curse
            </span>
            <div className="flex items-center gap-2">
              <BombIcon className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-secondary text-lg">+1</span>
            </div>
          </div>
        </div>
      </InfoCard>
    </div>
  );
};
