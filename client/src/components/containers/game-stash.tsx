import { OrbDisplay } from "@/components/elements";
import { ChipIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import type { Orb } from "@/models";

export interface GameStashProps {
  orbs: Orb[];
  chips: number;
  onClose: () => void;
}

export const GameStash = ({ orbs, chips, onClose }: GameStashProps) => {
  // Filter out bombs and empty orbs for display
  const displayOrbs = orbs.filter((orb) => !orb.isBomb() && !orb.isNone());

  return (
    <div className="flex flex-col gap-4 max-w-[420px] mx-auto px-4 h-full">
      {/* Header - same style as ORB SHOP */}
      <div className="flex items-center justify-between">
        <h1 className="text-white uppercase text-3xl font-primary">
          YOUR ORBS
        </h1>
        <div
          className="flex items-center gap-1 px-4 py-2 rounded"
          style={{ backgroundColor: "rgba(100, 50, 0, 0.3)" }}
        >
          <ChipIcon size="sm" className="text-orange-100" />
          <span className="text-orange-100 font-secondary text-sm">
            {chips}
          </span>
        </div>
      </div>

      {/* Subtitle - same style as shop */}
      <p className="text-green-600 font-secondary text-sm tracking-wide">
        Orbs in your bag that can be pulled
      </p>

      {/* Orbs grid */}
      <div
        className="flex-1 flex flex-col overflow-y-auto"
        style={{ scrollbarWidth: "none" }}
      >
        {displayOrbs.length > 0 ? (
          <div className="grid grid-cols-3 gap-6 py-4 justify-items-center">
            {displayOrbs.map((orb, index) => (
              <div key={index} className="flex flex-col items-center gap-4">
                <OrbDisplay orb={orb} size="lg" />
                <p className="text-green-500 text-2xs font-secondary uppercase tracking-wide">
                  {orb.name()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-green-600 text-center font-secondary text-sm tracking-wide">
              No orbs in your bag yet
            </p>
          </div>
        )}
      </div>

      {/* Action button - same style as shop */}
      <div className="flex items-stretch gap-3 w-full pt-2">
        <Button
          variant="secondary"
          className="min-h-14 flex-1 font-secondary text-sm tracking-widest"
          onClick={onClose}
        >
          ← BACK
        </Button>
      </div>
    </div>
  );
};
