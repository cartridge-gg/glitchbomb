import { ArrowLeftIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { CashOutCard } from "./cash-out-card";

export interface CashOutChoiceProps {
  moonrocks: number; // Current pack moonrocks
  points: number; // Current game points (will be added to moonrocks)
  cashOutValue?: string; // Formatted USD value of cashing out (e.g. "$1.23")
  onConfirm: () => void;
  onCancel: () => void;
  isConfirming?: boolean;
}

export const CashOutChoice = ({
  moonrocks,
  points,
  cashOutValue,
  onConfirm,
  onCancel,
  isConfirming = false,
}: CashOutChoiceProps) => {
  return (
    <div className="flex flex-col justify-center gap-[clamp(8px,2.2svh,18px)] w-full h-full">
      {/* Cash Out Card */}
      <CashOutCard
        moonrocks={moonrocks}
        totalMoonrocks={moonrocks + points}
        cashOutValue={cashOutValue}
        onClick={onConfirm}
        disabled={isConfirming}
        isLoading={isConfirming}
      />

      {/* Go Back Button */}
      <Button
        variant="secondary"
        gradient="green"
        className="h-12 w-full font-secondary uppercase text-sm tracking-widest"
        onClick={onCancel}
        disabled={isConfirming}
      >
        <ArrowLeftIcon size="sm" />
        Go Back
      </Button>
    </div>
  );
};
