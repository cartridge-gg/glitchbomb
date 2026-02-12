import { GradientBorder } from "@/components/ui/gradient-border";
import {
  BREAK_EVEN_TIER,
  ENTRY_PRICE,
  MAX_REWARD,
  PAYOUT_TIERS,
} from "@/constants";
import { MoonrockIcon } from "@/components/icons";
import { PayoutChart } from "./payout-chart";

export interface GameDetailsProps {
  entryPrice?: number;
  onBack: () => void;
  onPurchase: () => void;
}

interface DetailRowProps {
  label: string;
  value: string;
  isLast?: boolean;
}

const DetailRow = ({ label, value, isLast = false }: DetailRowProps) => (
  <>
    <div className="flex items-center justify-between py-2.5 px-1">
      <span className="font-secondary text-[clamp(0.65rem,1.4svh,0.8rem)] tracking-wider text-green-600">
        {label}
      </span>
      <span className="font-secondary text-[clamp(0.65rem,1.4svh,0.8rem)] tracking-wider text-green-400">
        {value}
      </span>
    </div>
    {!isLast && <div className="h-px bg-green-900/50" />}
  </>
);

export const GameDetails = ({
  entryPrice = ENTRY_PRICE,
  onBack,
  onPurchase,
}: GameDetailsProps) => {
  return (
    <div className="flex flex-col h-full w-full max-w-[500px] mx-auto">
      {/* Title */}
      <h1 className="font-glitch text-green-400 text-[clamp(1rem,2.5svh,1.5rem)] tracking-[0.3em] uppercase text-center py-3">
        Game Details
      </h1>

      {/* Chart Section */}
      <div className="flex-shrink-0">
        <PayoutChart
          tiers={PAYOUT_TIERS}
          entryPrice={entryPrice}
          className="px-1"
        />
      </div>

      {/* Zoom Controls (cosmetic) */}
      <div className="flex items-center justify-center gap-3 py-2">
        <button
          type="button"
          className="w-8 h-8 rounded-md border border-green-900 bg-green-950/30 flex items-center justify-center text-green-600 font-secondary text-sm"
          tabIndex={-1}
        >
          -
        </button>
        <div className="flex-1 max-w-[120px] h-1.5 rounded-full bg-green-950 overflow-hidden">
          <div className="h-full w-1/3 rounded-full bg-green-400" />
        </div>
        <button
          type="button"
          className="w-8 h-8 rounded-md border border-green-900 bg-green-950/30 flex items-center justify-center text-green-600 font-secondary text-sm"
          tabIndex={-1}
        >
          +
        </button>
      </div>

      {/* Details Section */}
      <div className="flex-1 min-h-0 overflow-y-auto px-2 py-2">
        <div className="rounded-xl border border-green-900/50 bg-green-950/20 px-4 py-1">
          <DetailRow label="Cost" value={`${entryPrice}`} />
          <DetailRow label="Reward Multiplier" value="1X" />
          <DetailRow label="Break Even" value={`${BREAK_EVEN_TIER}+`} />
          <DetailRow label="Expires In" value="24HRS" />
          <DetailRow
            isLast
            label="Maximum Reward"
            value={`${MAX_REWARD}`}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex-shrink-0 flex gap-3 px-2 pb-4 pt-3">
        <GradientBorder color="green" className="flex-1 rounded-xl">
          <button
            type="button"
            onClick={onBack}
            className="w-full py-3 rounded-xl bg-[#0A1A0A] font-secondary text-green-400 text-[clamp(0.7rem,1.5svh,0.9rem)] tracking-[0.3em] uppercase transition-all duration-200 hover:brightness-125"
          >
            Back
          </button>
        </GradientBorder>
        <GradientBorder color="yellow" className="flex-1 rounded-xl">
          <button
            type="button"
            onClick={onPurchase}
            className="w-full py-3 rounded-xl bg-[#1A1A0A] font-secondary text-yellow-100 text-[clamp(0.7rem,1.5svh,0.9rem)] tracking-[0.3em] uppercase transition-all duration-200 hover:brightness-125"
          >
            Purchase
          </button>
        </GradientBorder>
      </div>
    </div>
  );
};
