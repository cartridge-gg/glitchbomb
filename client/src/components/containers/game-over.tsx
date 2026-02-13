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
    <div className="flex flex-col max-w-[420px] w-full mx-auto px-4 min-h-full">
      <div className="flex flex-1 min-h-0 flex-col justify-center gap-[clamp(6px,2svh,18px)]">
        {/* Title Section */}
        <div className="flex flex-col items-center gap-0">
          <h1
            className={`${titleColor} ${titleFont} uppercase text-[clamp(2rem,6svh,3rem)] tracking-wider leading-tight text-center ${cashedOut ? "" : "glitch-text"}`}
          >
            {cashedOut ? "CASHED OUT" : "GLITCHED OUT"}
          </h1>
          <span className="text-green-600 font-secondary text-sm tracking-widest">
            Lvl {level}
          </span>
        </div>

        {/* Reuse the same PLChartTabs component */}
        <PLChartTabs data={plData} pulls={pulls} mode="absolute" title="P/L" />

        {/* Centered earnings section - keeps the card compact and readable */}
        <div className="flex flex-col items-center justify-center flex-none [@media(max-height:720px)]:justify-end [@media(max-height:720px)]:pb-[clamp(6px,1.4svh,12px)]">
          <InfoCard
            variant={cashedOut ? "green" : "red"}
            label={`You Earned${cashedOut ? "!" : ""}`}
            className="w-full h-auto min-h-[clamp(160px,24svh,210px)]"
            innerClassName="py-[clamp(8px,1.8svh,14px)] px-[clamp(10px,2svh,16px)] gap-[clamp(8px,2.2svh,20px)]"
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
    </div>
  );
};
