import { SparkleIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

export interface MilestoneReachedProps {
  milestone: number;
  onCashOut: () => void;
  onEnterShop: () => void;
}

export const MilestoneReached = ({
  milestone,
  onCashOut,
  onEnterShop,
}: MilestoneReachedProps) => {
  return (
    <div className="absolute inset-0 flex flex-col gap-8 max-w-[420px] m-auto py-6 px-4">
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
        <Button
          variant="secondary"
          className="min-h-14 flex-1 font-secondary text-sm tracking-widest"
          onClick={onCashOut}
        >
          CASH OUT
        </Button>
        <Button
          variant="default"
          className="min-h-14 flex-1 font-secondary text-sm tracking-widest"
          onClick={onEnterShop}
        >
          ENTER SHOP
        </Button>
      </div>
    </div>
  );
};
