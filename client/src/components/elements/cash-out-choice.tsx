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
    <div className="flex flex-col gap-3 w-full h-full">
      {/* Confirm Cash Out Card - clickable */}
      <InfoCard
        variant="yellow"
        label="Cash Out"
        onClick={onConfirm}
        disabled={isConfirming}
        isLoading={isConfirming}
        className="flex-1"
      >
        <MoonrockIcon className="w-10 h-10 text-yellow-400" />
        <span className="text-yellow-400 font-secondary text-xl tracking-wider">
          {totalMoonrocks} MOON ROCKS
        </span>
      </InfoCard>

      {/* Cancel Card - clickable */}
      <InfoCard
        variant="green"
        label="Go Back"
        onClick={onCancel}
        disabled={isConfirming}
        className="flex-1"
      >
        <div className="flex items-center gap-2">
          <ArrowLeftIcon size="sm" className="text-green-400" />
          <span className="text-green-400 font-secondary text-lg tracking-wider">
            CANCEL
          </span>
        </div>
      </InfoCard>
    </div>
  );
};
