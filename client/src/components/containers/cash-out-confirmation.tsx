import { MoonrockIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { GradientBorder } from "@/components/ui/gradient-border";

export interface CashOutConfirmationProps {
  moonrocks: number;
  points: number;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const CashOutConfirmation = ({
  moonrocks,
  points,
  onConfirm,
  onCancel,
  isLoading = false,
}: CashOutConfirmationProps) => {
  const total = moonrocks + points;

  return (
    <div className="flex flex-col gap-8 max-w-[420px] mx-auto px-4 h-full">
      <div className="flex-1 flex flex-col items-center justify-center gap-8 text-center">
        <div className="relative">
          <MoonrockIcon className="w-24 h-24 text-blue-400" />
          <div
            className="absolute inset-0 blur-xl opacity-50"
            style={{ backgroundColor: "#3B82F6" }}
          />
        </div>
        <div className="flex flex-col gap-3">
          <h1 className="text-white uppercase text-3xl font-primary">
            Cash Out?
          </h1>
          <p className="text-green-600 font-secondary text-sm tracking-wide max-w-xs">
            You will receive{" "}
            <span className="text-green-400 font-bold">{total}</span> moonrocks
            and end the current game. This action cannot be undone.
          </p>
        </div>
      </div>

      <div className="flex items-stretch gap-3 w-full pt-2">
        <Button
          variant="secondary"
          gradient="green"
          className="min-h-14 flex-1 font-secondary text-sm tracking-widest"
          onClick={onCancel}
          disabled={isLoading}
        >
          ← BACK
        </Button>
        <GradientBorder color="purple" className="flex-1">
          <button
            type="button"
            className="w-full min-h-14 font-secondary text-sm tracking-widest rounded-lg transition-all duration-200 hover:brightness-125 hover:shadow-[0_0_20px_rgba(128,0,128,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(180deg, #4A1A6B 0%, #2D1052 100%)",
              color: "#FF80FF",
            }}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "CASHING OUT..." : "CASH OUT"}
          </button>
        </GradientBorder>
      </div>
    </div>
  );
};
