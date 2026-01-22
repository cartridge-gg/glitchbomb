import { MoonrockIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import type { OrbPulled } from "@/models";
import { PLChartTabs, type PLDataPoint } from "../elements";

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
  const cardBg = cashedOut ? "#00FF0008" : "#FF1E000A";
  const innerCardBg = cashedOut ? "#00200020" : "#01010129";
  const textColor = cashedOut ? "text-green-400" : "text-red-100";

  // Use glitch font only for "glitched out", regular font for "cashed out"
  const titleFont = cashedOut ? "font-primary font-bold" : "font-glitch";
  // Bigger icon for cashed out
  const iconSize = "w-[72px] h-[72px]";

  return (
    <div className="flex flex-col gap-4 max-w-[420px] w-full mx-auto px-4 h-full">
      {/* Title Section */}
      <div className="flex flex-col items-center gap-0">
        <h1
          className={`${titleColor} ${titleFont} uppercase text-[2.5rem] md:text-5xl tracking-wider whitespace-nowrap leading-tight`}
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
      <div className="flex-1 relative min-h-[280px]">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full min-h-[280px] flex flex-col items-center gap-4 rounded-2xl pt-4 pb-4 px-4"
          style={{ backgroundColor: cardBg }}
        >
          <span
            className={`${textColor} font-secondary text-sm tracking-[0.4em] uppercase`}
          >
            You Earned{cashedOut ? "!" : ""}
          </span>

          {/* Inner card - dark */}
          <div
            className="flex-1 flex flex-col items-center justify-center gap-4 w-full rounded-lg py-8 px-6"
            style={{ backgroundColor: innerCardBg }}
          >
            <MoonrockIcon className={`${iconSize} ${textColor}`} />
            <span
              className={`${textColor} font-secondary text-xl md:text-2xl tracking-[0.2em]`}
            >
              {moonrocksEarned} MOON ROCKS
            </span>
          </div>
        </div>
      </div>

      {/* Play Again Button */}
      <Button
        variant="default"
        gradient="green"
        className="min-h-14 w-full font-secondary text-lg tracking-widest"
        onClick={onPlayAgain}
      >
        PLAY AGAIN
      </Button>
    </div>
  );
};
