import { MoonrockIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { GradientBorder } from "@/components/ui/gradient-border";
import type { OrbPulled } from "@/models";
import {
  InfoCard,
  PayoutChart,
  PLChartTabs,
  type PLDataPoint,
} from "../elements";

export interface GameOverProps {
  level: number;
  moonrocksEarned: number;
  plData: PLDataPoint[];
  pulls: OrbPulled[];
  cashedOut: boolean; // true = voluntarily cashed out, false = died (health = 0)
  expired?: boolean; // true = game expired without being played to completion
  onPlayAgain?: () => void;
  /** Payout chart props — when stake is provided, renders the payout chart */
  stake?: number;
  tokenPrice?: number | null;
  supply?: bigint;
  target?: bigint;
}

export const GameOver = ({
  level,
  moonrocksEarned,
  plData,
  pulls,
  cashedOut,
  expired,
  onPlayAgain,
  stake,
  tokenPrice,
  supply,
  target,
}: GameOverProps) => {
  // Yellow theme for expired, green for cashed out, red for glitched out
  const titleColor = expired
    ? "text-yellow-400"
    : cashedOut
      ? "text-green-400"
      : "text-red-100";
  const textColor = expired
    ? "text-yellow-400"
    : cashedOut
      ? "text-green-400"
      : "text-red-100";

  // Use glitch font only for "glitched out", regular font for others
  const titleFont = !cashedOut && !expired ? "font-glitch" : "font-body";

  return (
    <div className="flex flex-col max-w-[420px] w-full mx-auto px-4 min-h-full">
      {/* Content — scrollable, vertically centered when short */}
      <div className="flex flex-1 min-h-0 flex-col justify-center gap-[clamp(6px,2svh,18px)] overflow-y-auto">
        <div className="flex flex-col items-center gap-0">
          <h1
            className={`${titleColor} ${titleFont} uppercase text-[clamp(2rem,6svh,3rem)] tracking-wider leading-tight text-center ${!cashedOut && !expired ? "glitch-text" : ""}`}
          >
            {expired ? "EXPIRED" : cashedOut ? "CASHED OUT" : "GLITCHED OUT"}
          </h1>
          <span className="text-green-600 font-secondary text-sm tracking-widest">
            Lvl {level}
          </span>
        </div>

        <PLChartTabs data={plData} pulls={pulls} mode="absolute" title="P/L" />

        <InfoCard
          variant={expired ? "yellow" : cashedOut ? "green" : "red"}
          label={expired ? "Time's Up" : `You Earned${cashedOut ? "!" : ""}`}
          className="w-full h-auto min-h-[clamp(160px,24svh,210px)]"
          innerClassName="py-[clamp(8px,1.8svh,14px)] px-[clamp(10px,2svh,16px)] gap-[clamp(8px,2.2svh,20px)]"
        >
          {expired ? (
            <span
              className={`${textColor} font-secondary text-[clamp(1rem,2.6svh,1.5rem)] tracking-[0.2em] text-center`}
            >
              GAME EXPIRED
            </span>
          ) : (
            <>
              <MoonrockIcon
                className={`w-[clamp(48px,8svh,72px)] h-[clamp(48px,8svh,72px)] ${textColor}`}
              />
              <span
                className={`${textColor} font-secondary text-[clamp(1rem,2.6svh,1.5rem)] tracking-[0.2em]`}
              >
                {moonrocksEarned} MOON ROCKS
              </span>
            </>
          )}
        </InfoCard>

        {/* Payout chart — show for non-expired games when stake data is available */}
        {stake != null && !expired && (
          <GradientBorder color="green" className="rounded-xl">
            <div
              className="rounded-xl p-3"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
            >
              <PayoutChart
                stake={stake}
                tokenPrice={tokenPrice ?? null}
                supply={supply}
                target={target}
                score={moonrocksEarned}
              />
            </div>
          </GradientBorder>
        )}
      </div>

      {/* Play Again Button — pinned to bottom */}
      <div className="shrink-0 pb-4">
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
