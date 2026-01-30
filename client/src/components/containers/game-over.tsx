import { MoonrockIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import type { OrbPulled } from "@/models";
import { InfoCard, PLChartTabs, type PLDataPoint } from "../elements";

export interface GameOverProps {
  level: number;
  moonrocksEarned: number;
  plData: PLDataPoint[];
  pulls: OrbPulled[];
  cashedOut: boolean; // true = voluntarily cashed out, false = died (health = 0)
  onPlayAgain?: () => void;
}

export const GameOver = ({
  level,
  moonrocksEarned,
  plData,
  pulls,
  cashedOut,
  onPlayAgain,
}: GameOverProps) => {
  // Green theme for cashed out, red theme for glitched out
  const titleColor = cashedOut ? "text-green-400" : "text-red-100";
  const textColor = cashedOut ? "text-green-400" : "text-red-100";

  // Use glitch font only for "glitched out", regular font for "cashed out"
  const titleFont = cashedOut ? "font-primary font-bold" : "font-glitch";

  return (
    <div className="flex flex-col gap-[clamp(8px,2svh,16px)] max-w-[420px] w-full mx-auto px-4 min-h-full">
      {/* Title Section */}
      <div className="flex flex-col items-center gap-0">
        <h1
          className={`${titleColor} ${titleFont} uppercase text-[clamp(2rem,6svh,3rem)] tracking-wider whitespace-nowrap leading-tight`}
        >
          {cashedOut ? "CASHED OUT" : "GLITCHED OUT"}
        </h1>
        <span className="text-green-600 font-secondary text-sm tracking-widest">
          Lvl {level}
        </span>
      </div>

      {/* Reuse the same PLChartTabs component */}
      <PLChartTabs data={plData} pulls={pulls} mode="absolute" title="P/L" />

      {/* Centered earnings section - fills remaining space and centers content */}
      <div className="flex-1 relative min-h-[clamp(180px,30svh,280px)]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full">
          <InfoCard
            variant={cashedOut ? "green" : "red"}
            label={`You Earned${cashedOut ? "!" : ""}`}
            className="min-h-[clamp(160px,26svh,240px)]"
          >
            <MoonrockIcon
              className={`w-[clamp(48px,8svh,72px)] h-[clamp(48px,8svh,72px)] ${textColor}`}
            />
            <span
              className={`${textColor} font-secondary text-[clamp(1rem,2.6svh,1.5rem)] tracking-[0.2em]`}
            >
              {moonrocksEarned} MOON ROCKS
            </span>
          </InfoCard>
        </div>
      </div>

      {/* Play Again Button */}
      <Button
        variant="default"
        gradient="green"
        className="min-h-[clamp(40px,6svh,56px)] w-full font-secondary text-[clamp(0.9rem,2svh,1.125rem)] tracking-widest"
        onClick={onPlayAgain}
      >
        PLAY AGAIN
      </Button>
    </div>
  );
};
