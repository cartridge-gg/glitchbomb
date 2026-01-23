import { ArrowLeftIcon, MoonrockIcon } from "@/components/icons";
import { LoadingSpinner } from "./loading-spinner";

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
    <div className="flex gap-3 w-full h-full max-h-[400px]">
      {/* Cash Out Inner Card - clickable */}
      <button
        type="button"
        onClick={onConfirm}
        disabled={isConfirming}
        className={`flex-1 flex flex-col items-center justify-center gap-4 rounded-2xl p-6 bg-[#1A1A0A] border border-yellow-400/30 transition-all duration-200 ${
          isConfirming
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:brightness-125"
        }`}
      >
        <span className="text-yellow-400 font-secondary text-sm tracking-[0.3em] uppercase">
          Cash Out
        </span>
        {isConfirming ? (
          <LoadingSpinner size="md" />
        ) : (
          <>
            <MoonrockIcon className="w-12 h-12 text-yellow-400" />
            <span className="text-yellow-400 font-glitch text-2xl">
              {totalMoonrocks}
            </span>
            <span className="text-yellow-400/70 font-secondary text-xs tracking-wider">
              Moon Rocks
            </span>
          </>
        )}
      </button>

      {/* Cancel Inner Card - clickable */}
      <button
        type="button"
        onClick={onCancel}
        disabled={isConfirming}
        className={`flex-1 flex flex-col items-center justify-center gap-4 rounded-2xl p-6 bg-[#0A1A0A] border border-green-400/30 transition-all duration-200 ${
          isConfirming
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:brightness-125"
        }`}
      >
        <span className="text-green-400 font-secondary text-sm tracking-[0.3em] uppercase">
          Go Back
        </span>
        <ArrowLeftIcon size="md" className="text-green-400" />
        <span className="text-green-400 font-glitch text-2xl">Cancel</span>
        <span className="text-green-400/70 font-secondary text-xs tracking-wider">
          Keep Playing
        </span>
      </button>
    </div>
  );
};
