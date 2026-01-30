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
    <div className="flex flex-col gap-[clamp(8px,2svh,12px)] w-full h-full">
      {/* Confirm Cash Out Card - clickable */}
      <InfoCard
        variant="yellow"
        label="Cash Out"
        onClick={onConfirm}
        disabled={isConfirming}
        isLoading={isConfirming}
        className="flex-1"
        contentClassName="p-[clamp(10px,2.4svh,16px)] gap-[clamp(8px,2svh,12px)]"
        labelClassName="text-[clamp(0.6rem,1.4svh,0.875rem)] tracking-[0.35em]"
        hideInner
      >
        <div
          className="flex-1 flex flex-col rounded-lg overflow-hidden w-full"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }}
        >
          {/* Header */}
          <div className="py-[clamp(2px,0.6svh,4px)] px-[clamp(10px,2svh,16px)]">
            <span className="text-yellow-400 font-secondary text-[clamp(0.55rem,1.2svh,0.625rem)] tracking-[0.3em] uppercase">
              Reward
            </span>
          </div>
          {/* Separator */}
          <div className="h-px bg-yellow-500" />
          {/* Content */}
          <div className="flex-1 flex flex-col items-center justify-center gap-[clamp(6px,1.6svh,12px)] py-[clamp(10px,2.6svh,20px)] px-[clamp(10px,2.6svh,16px)]">
            <div className="flex items-center justify-center gap-1">
              <MoonrockIcon className="w-[clamp(28px,6svh,40px)] h-[clamp(28px,6svh,40px)] text-yellow-400" />
              <span className="text-yellow-400 font-secondary text-[clamp(1.25rem,4.5svh,2.25rem)] leading-none">
                +{totalMoonrocks}
              </span>
            </div>
            <span className="text-yellow-400/70 font-secondary text-[clamp(0.6rem,1.4svh,0.875rem)] tracking-wider">
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
        contentClassName="p-[clamp(10px,2.4svh,16px)] gap-[clamp(8px,2svh,12px)]"
        labelClassName="text-[clamp(0.6rem,1.4svh,0.875rem)] tracking-[0.35em]"
        innerClassName="py-[clamp(10px,2.6svh,20px)] px-[clamp(10px,2.6svh,16px)] gap-[clamp(6px,1.6svh,12px)]"
      >
        <div className="flex items-center gap-2">
          <ArrowLeftIcon
            size="sm"
            className="text-green-400 w-[clamp(16px,3.6svh,20px)] h-[clamp(16px,3.6svh,20px)]"
          />
          <span className="text-green-400 font-secondary text-[clamp(0.85rem,2.2svh,1.125rem)] tracking-wider">
            CANCEL
          </span>
        </div>
      </InfoCard>
    </div>
  );
};
