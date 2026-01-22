import { LoadingSpinner } from "@/components/elements";
import { BombIcon, ChipIcon, MoonrockIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

export interface MilestoneChoiceProps {
  points: number; // Current points (will become chips on continue, moonrocks on cash out)
  onCashOut: () => void;
  onEnterShop: () => void;
  isEnteringShop?: boolean;
  isCashingOut?: boolean;
}

export const MilestoneChoice = ({
  points,
  onCashOut,
  onEnterShop,
  isEnteringShop = false,
  isCashingOut = false,
}: MilestoneChoiceProps) => {
  const isLoading = isEnteringShop || isCashingOut;

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Cash Out Card */}
      <div
        className="flex flex-col rounded-lg overflow-hidden"
        style={{ border: "1px solid #3D5C2E", backgroundColor: "#0A1A08" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-center py-2"
          style={{ backgroundColor: "#0D1F0A" }}
        >
          <h2 className="text-yellow-400 font-primary text-xl tracking-wider">
            CASH OUT
          </h2>
        </div>

        {/* Content */}
        <div className="flex flex-col items-center gap-2 py-4 px-4">
          <span className="text-yellow-600 font-secondary text-xs tracking-[0.3em] uppercase">
            Reward
          </span>

          <div className="flex items-center gap-2">
            <MoonrockIcon className="w-6 h-6 text-yellow-400" />
            <span className="text-yellow-400 font-secondary text-xl tracking-wider">
              +{points}
            </span>
          </div>

          <span className="text-yellow-600/70 font-secondary text-xs">
            Gain Moon Rocks
          </span>
        </div>

        {/* Button */}
        <Button
          variant="default"
          className="min-h-12 w-full rounded-none font-secondary text-sm tracking-widest"
          style={{
            background: "linear-gradient(180deg, #4A6B1A 0%, #2D4D10 100%)",
            color: "#FFFF80",
          }}
          onClick={onCashOut}
          disabled={isLoading}
        >
          {isCashingOut ? <LoadingSpinner size="sm" /> : "CASH OUT"}
        </Button>
      </div>

      {/* Continue Card */}
      <div
        className="flex flex-col rounded-lg overflow-hidden"
        style={{ border: "1px solid #5C2E2E", backgroundColor: "#1A0808" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-center py-2"
          style={{ backgroundColor: "#1F0D0A" }}
        >
          <h2 className="text-red-400 font-primary text-xl tracking-wider">
            CONTINUE
          </h2>
        </div>

        {/* Content - Two cards side by side */}
        <div className="flex gap-2 p-3">
          {/* Reward */}
          <div
            className="flex-1 flex flex-col items-center gap-1 rounded-md py-3 px-2"
            style={{ backgroundColor: "#0D1A08" }}
          >
            <span className="text-green-600 font-secondary text-xs tracking-[0.2em] uppercase">
              Reward
            </span>
            <div className="flex items-center gap-1">
              <ChipIcon size="sm" className="text-orange-300" />
              <span className="text-orange-300 font-secondary text-lg">
                +{points}
              </span>
            </div>
            <span className="text-green-600/70 font-secondary text-xs">
              Gain Chips
            </span>
          </div>

          {/* Curse */}
          <div
            className="flex-1 flex flex-col items-center gap-1 rounded-md py-3 px-2"
            style={{ backgroundColor: "#1A0D08" }}
          >
            <span className="text-red-500 font-secondary text-xs tracking-[0.2em] uppercase">
              Curse
            </span>
            <div className="flex items-center gap-1">
              <BombIcon className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-secondary text-lg">+1</span>
            </div>
            <span className="text-red-500/70 font-secondary text-xs">
              Gain 3x Bomb
            </span>
          </div>
        </div>

        {/* Button */}
        <Button
          variant="default"
          className="min-h-12 w-full rounded-none font-secondary text-sm tracking-widest"
          style={{
            background: "linear-gradient(180deg, #6B1A1A 0%, #4D1010 100%)",
            color: "#FF8080",
          }}
          onClick={onEnterShop}
          disabled={isLoading}
        >
          {isEnteringShop ? <LoadingSpinner size="sm" /> : "ENTER SHOP"}
        </Button>
      </div>
    </div>
  );
};
