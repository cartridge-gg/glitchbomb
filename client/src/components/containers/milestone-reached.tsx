import { LoadingSpinner } from "@/components/elements";
import { SparkleIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { GradientBorder } from "@/components/ui/gradient-border";

export interface MilestoneReachedProps {
  milestone: number;
  onCashOut: () => void;
  onEnterShop: () => void;
  isEnteringShop?: boolean;
}

export const MilestoneReached = ({
  milestone,
  onCashOut,
  onEnterShop,
  isEnteringShop = false,
}: MilestoneReachedProps) => {
  return (
    <div className="flex flex-col gap-8 max-w-[420px] mx-auto px-4 h-full">
      <div className="flex-1 flex flex-col items-center justify-center gap-8 text-center">
        <div className="relative">
          <SparkleIcon className="w-24 h-24 text-green-400" />
          <div
            className="absolute inset-0 blur-xl opacity-50"
            style={{ backgroundColor: "#36F818" }}
          />
        </div>
        <div className="flex flex-col gap-3">
          <h1 className="text-white uppercase text-3xl font-primary">
            Milestone Reached!
          </h1>
          <p className="text-green-600 font-secondary text-sm tracking-wide max-w-xs">
            Congratulations! You've reached{" "}
            <span className="text-green-400 font-bold">{milestone}</span>{" "}
            points. Do you want to cash out or continue playing?
          </p>
        </div>
      </div>

      <div className="flex items-stretch gap-3 w-full pt-2">
        <GradientBorder color="purple" className="flex-1">
          <button
            type="button"
            className="w-full min-h-14 font-secondary text-sm tracking-widest rounded-lg transition-all duration-200 hover:brightness-125 hover:shadow-[0_0_20px_rgba(128,0,128,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(180deg, #4A1A6B 0%, #2D1052 100%)",
              color: "#FF80FF",
            }}
            onClick={onCashOut}
            disabled={isEnteringShop}
          >
            CASH OUT
          </button>
        </GradientBorder>
        <Button
          variant="default"
          gradient="green"
          className="min-h-14 w-full font-secondary text-sm tracking-widest"
          wrapperClassName="flex-1"
          onClick={onEnterShop}
          disabled={isEnteringShop}
        >
          {isEnteringShop ? <LoadingSpinner size="sm" /> : "ENTER SHOP"}
        </Button>
      </div>
    </div>
  );
};
