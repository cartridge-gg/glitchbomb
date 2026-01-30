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
    <div className="flex flex-col gap-[clamp(6px,1.4svh,10px)] w-full h-full">
      {/* Confirm Cash Out Card - clickable */}
      <InfoCard
        variant="yellow"
        label="Cash Out"
        onClick={onConfirm}
        disabled={isConfirming}
        isLoading={isConfirming}
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
          <div className="h-px bg-yellow-500" />
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

      {/* Cancel Card - clickable */}
      <InfoCard
        variant="green"
        label="Go Back"
        onClick={onCancel}
        disabled={isConfirming}
        className="flex-1"
        contentClassName="p-[clamp(8px,2svh,12px)] gap-[clamp(6px,1.4svh,10px)]"
        labelClassName="text-[clamp(0.55rem,1.2svh,0.75rem)] tracking-[0.32em]"
        innerClassName="py-[clamp(8px,2.2svh,16px)] px-[clamp(8px,2.2svh,14px)] gap-[clamp(4px,1.2svh,10px)]"
      >
        <div className="flex items-center gap-2">
          <ArrowLeftIcon
            size="sm"
            className="text-green-400 w-[clamp(14px,3svh,18px)] h-[clamp(14px,3svh,18px)]"
          />
          <span className="text-green-400 font-secondary text-[clamp(0.75rem,2svh,1rem)] tracking-wider">
            CANCEL
          </span>
        </div>
      </InfoCard>
    </div>
  );
};
