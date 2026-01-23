import { ArrowLeftIcon, MoonrockIcon } from "@/components/icons";
import { InfoCard } from "./info-card";

export interface CashOutChoiceProps {
  moonrocks: number; // Current pack moonrocks
  points: number; // Current game points (will be added to moonrocks)
  onConfirm: () => void;
  onCancel: () => void;
  isConfirming?: boolean;
}

export const CashOutChoice = ({
  moonrocks,
  points,
  onConfirm,
  onCancel,
  isConfirming = false,
}: CashOutChoiceProps) => {
  const totalMoonrocks = moonrocks + points;

  return (
    <div className="flex flex-col gap-3 w-full h-full max-h-[600px]">
      {/* Confirm Cash Out Card - clickable */}
      <InfoCard
        variant="yellow"
        label="Cash Out"
        onClick={onConfirm}
        disabled={isConfirming}
        isLoading={isConfirming}
        className="flex-1"
        hideInner
      >
        <div
          className="flex-1 flex flex-col rounded-lg overflow-hidden w-full"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }}
        >
          {/* Header */}
          <div className="py-1 px-4">
            <span className="text-yellow-400 font-secondary text-2xs tracking-[0.3em] uppercase">
              Reward
            </span>
          </div>
          {/* Separator */}
          <div className="h-px bg-yellow-500" />
          {/* Content */}
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-6 px-4">
            <div className="flex items-center gap-2">
              <MoonrockIcon className="w-10 h-10 text-yellow-400" />
              <span className="text-yellow-400 font-secondary text-2xl">
                +{totalMoonrocks}
              </span>
            </div>
            <span className="text-yellow-400/70 font-secondary text-xs tracking-wider">
              Moon Rocks
            </span>
          </div>
        </div>
      </InfoCard>

      {/* Cancel Card - clickable */}
      <InfoCard
        variant="green"
        label="Go Back"
        onClick={onCancel}
        disabled={isConfirming}
        className="flex-1"
        hideInner
      >
        <div
          className="flex-1 flex flex-col rounded-lg overflow-hidden w-full"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }}
        >
          {/* Header */}
          <div className="py-1 px-4">
            <span className="text-green-400 font-secondary text-2xs tracking-[0.3em] uppercase">
              Cancel
            </span>
          </div>
          {/* Separator */}
          <div className="h-px bg-green-500" />
          {/* Content */}
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-6 px-4">
            <div className="flex items-center gap-2">
              <ArrowLeftIcon size="md" className="text-green-400" />
              <span className="text-green-400 font-secondary text-2xl">
                Back
              </span>
            </div>
            <span className="text-green-400/70 font-secondary text-xs tracking-wider">
              Keep Playing
            </span>
          </div>
        </div>
      </InfoCard>
    </div>
  );
};
