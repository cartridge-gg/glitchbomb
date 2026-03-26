import { useMemo, useState } from "react";
import {
  BagIcon,
  GlitchTokenLargeIcon,
  MoonrockLargeIcon,
} from "@/components/icons";
import { GlitchText } from "@/components/ui/glitch-text";
import { GradientBorder } from "@/components/ui/gradient-border";
import { tokenPayout, toTokens } from "@/helpers/payout";
import type { OrbPulled } from "@/models";
import {
  GameStats,
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
  onOpenStash?: () => void;
  /** Game stats for header */
  health: number;
  points: number;
  milestone: number;
  /** Payout chart props — when stake is provided, renders the payout chart */
  stake?: number;
  tokenPrice?: number | null;
  supply?: bigint;
  target?: bigint;
}

type Step = "gameover" | "rewards";

export const GameOver = ({
  level,
  moonrocksEarned,
  plData,
  pulls,
  cashedOut,
  expired,
  onPlayAgain,
  onOpenStash,
  health,
  points,
  milestone,
  stake,
  tokenPrice,
  supply,
  target,
}: GameOverProps) => {
  const [step, setStep] = useState<Step>("gameover");

  // Compute GLITCH tokens earned and USD value for rewards step
  const { glitch, usd } = useMemo(() => {
    if (stake == null || moonrocksEarned <= 0)
      return { glitch: 0, usd: null as number | null };
    const raw = tokenPayout(moonrocksEarned, stake, supply, target);
    const tokens = toTokens(raw);
    const usdVal =
      tokenPrice != null && tokenPrice > 0 ? tokens * tokenPrice : null;
    return { glitch: tokens, usd: usdVal };
  }, [stake, moonrocksEarned, supply, target, tokenPrice]);

  const textColor = expired
    ? "text-yellow-400"
    : cashedOut
      ? "text-green-400"
      : "text-red-100";

  const titleFont = "font-secondary";

  const cardVariant = expired ? "yellow" : cashedOut ? "green" : "red";

  return (
    <div className="flex min-h-full flex-col max-w-[420px] mx-auto px-4 pb-[clamp(6px,1.1svh,12px)]">
      <div className="flex flex-1 min-h-0 flex-col gap-[clamp(6px,2svh,18px)]">
        {/* Game Stats header — same as game scene */}
        <GameStats
          points={points}
          milestone={milestone}
          health={health}
          level={level}
        />

        {expired ? (
          <>
            <PLChartTabs
              data={plData}
              pulls={pulls}
              mode="absolute"
              title="P/L"
            />
            <InfoCard
              variant="yellow"
              label="Time's Up"
              className="w-full h-auto"
              innerClassName="py-[clamp(12px,3svh,24px)] px-[clamp(10px,2svh,16px)] gap-[clamp(8px,2.2svh,20px)]"
            >
              <span
                className={`${textColor} font-secondary text-[clamp(1rem,2.6svh,1.5rem)] tracking-[0.2em] text-center`}
              >
                GAME EXPIRED
              </span>
            </InfoCard>
          </>
        ) : step === "gameover" ? (
          <>
            {/* Chart */}
            <PLChartTabs
              data={plData}
              pulls={pulls}
              mode="absolute"
              title="P/L"
            />

            {/* Big centered card with title + moonrocks */}
            <div className="flex-1 min-h-0 flex items-center justify-center">
              <InfoCard
                variant={cardVariant}
                label={cashedOut ? "CASHED OUT" : "GLITCHED\u00A0OUT"}
                labelClassName={`${titleFont} text-[clamp(0.7rem,1.8svh,1rem)] tracking-[0.3em] ${!cashedOut ? "glitch-text" : ""}`}
                className="w-full h-auto"
                innerClassName="py-[clamp(16px,3svh,28px)] px-[clamp(10px,2svh,16px)] gap-[clamp(8px,2svh,16px)]"
              >
                <div className="flex flex-col items-center gap-[clamp(8px,2svh,16px)]">
                  <MoonrockLargeIcon className="w-[clamp(56px,10svh,72px)] h-auto" />

                  <div className="flex flex-col items-center gap-1">
                    <GlitchText
                      className="text-yellow-400 font-secondary text-[clamp(1.2rem,3.5svh,2rem)] tracking-[0.2em]"
                      text={String(moonrocksEarned)}
                    />
                    <span className="text-yellow-400 font-secondary text-[clamp(0.5rem,1.1svh,0.7rem)] tracking-[0.3em] uppercase opacity-70">
                      Moonrocks
                    </span>
                  </div>
                </div>
              </InfoCard>
            </div>
          </>
        ) : (
          <div className="flex-1 min-h-0 flex flex-col justify-center gap-[clamp(6px,2svh,18px)]">
            {/* Rewards step header */}
            <span className="font-secondary text-[clamp(0.6rem,1.3svh,0.8rem)] tracking-[0.3em] uppercase text-green-400">
              GAME REWARDS
            </span>

            {/* Payout chart */}
            {stake != null ? (
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
            ) : (
              <PLChartTabs
                data={plData}
                pulls={pulls}
                mode="absolute"
                title="P/L"
              />
            )}

            {/* Earnings card */}
            <InfoCard
              variant={cardVariant}
              className="w-full h-auto"
              contentClassName="p-[clamp(8px,2svh,12px)] gap-[clamp(8px,2.2svh,18px)]"
              labelClassName="text-[clamp(0.55rem,1.2svh,0.75rem)] tracking-[0.32em]"
              hideInner
            >
              {/* Header row: Earnings label + USD value pill */}
              <div className="flex items-center justify-between w-full">
                <span
                  className={`${textColor} font-secondary text-sm tracking-[0.4em] uppercase text-[clamp(0.55rem,1.2svh,0.75rem)]`}
                >
                  Earnings
                </span>
                {usd != null && (
                  <div
                    className="flex items-center rounded-md overflow-hidden"
                    style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}
                  >
                    <div
                      className="flex items-center justify-center px-[clamp(6px,1.2svh,10px)] py-[clamp(2px,0.5svh,4px)]"
                      style={{ backgroundColor: "rgba(0, 0, 0, 0.15)" }}
                    >
                      <span
                        className={`${textColor} font-secondary text-[clamp(0.45rem,0.9svh,0.6rem)] tracking-[0.25em] uppercase`}
                      >
                        Value
                      </span>
                    </div>
                    <div
                      className={`w-px self-stretch ${cashedOut ? "bg-green-100" : "bg-red-100"} opacity-5`}
                    />
                    <div className="flex items-center px-[clamp(6px,1.2svh,10px)] py-[clamp(2px,0.5svh,4px)]">
                      <GlitchText
                        className={`${textColor} font-secondary text-[clamp(0.55rem,1.1svh,0.75rem)] leading-none`}
                        text={`$${usd.toFixed(2)}`}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-[clamp(8px,2.2svh,18px)] w-full h-full">
                {/* Moonrocks inner card */}
                <div
                  className="flex-1 flex flex-col rounded-lg overflow-hidden"
                  style={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }}
                >
                  <div className="flex-1 flex flex-col items-center justify-center gap-[clamp(4px,1svh,10px)] py-[clamp(8px,2.2svh,16px)] px-[clamp(8px,2.2svh,14px)]">
                    <MoonrockLargeIcon className="w-[clamp(40px,7svh,56px)] h-auto" />
                    <GlitchText
                      className="text-yellow-400 font-secondary text-[clamp(0.9rem,3svh,1.5rem)] leading-none"
                      text={String(moonrocksEarned)}
                    />
                    <span className="text-yellow-400 opacity-70 font-secondary text-[clamp(0.5rem,1.1svh,0.7rem)] tracking-wider">
                      Moonrocks
                    </span>
                  </div>
                </div>

                {/* GLITCH tokens inner card */}
                {stake != null && (
                  <div
                    className="flex-1 flex flex-col rounded-lg overflow-hidden"
                    style={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }}
                  >
                    <div className="flex-1 flex flex-col items-center justify-center gap-[clamp(4px,1svh,10px)] py-[clamp(8px,2.2svh,16px)] px-[clamp(8px,2.2svh,14px)]">
                      <GlitchTokenLargeIcon className="w-[clamp(40px,7svh,56px)] h-auto" />
                      <GlitchText
                        className="text-[#FF0099] font-secondary text-[clamp(0.9rem,3svh,1.5rem)] leading-none"
                        text={String(Math.floor(glitch))}
                      />
                      <span className="text-[#FF0099] opacity-70 font-secondary text-[clamp(0.5rem,1.1svh,0.7rem)] tracking-wider">
                        GLITCH
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </InfoCard>
          </div>
        )}
      </div>

      {/* Bottom buttons — pinned to bottom */}
      <div className="shrink-0 pt-[clamp(4px,0.8svh,8px)] pb-[clamp(4px,0.8svh,8px)]">
        {expired ? (
          <GradientBorder color="green" className="w-full">
            <button
              type="button"
              className="w-full flex items-center justify-center min-h-[clamp(40px,6svh,56px)] font-secondary text-[clamp(0.65rem,1.5svh,0.875rem)] tracking-widest text-green-400 rounded-lg transition-all duration-200 hover:brightness-110 bg-[#0D2518]"
              onClick={onPlayAgain}
            >
              PLAY AGAIN
            </button>
          </GradientBorder>
        ) : step === "rewards" ? (
          <GradientBorder color="green" className="w-full">
            <button
              type="button"
              className="w-full flex items-center justify-center min-h-[clamp(40px,6svh,56px)] font-secondary text-[clamp(0.65rem,1.5svh,0.875rem)] tracking-widest text-green-400 rounded-lg transition-all duration-200 hover:brightness-110 bg-[#0D2518]"
              onClick={onPlayAgain}
            >
              PLAY AGAIN
            </button>
          </GradientBorder>
        ) : (
          <div className="flex items-stretch gap-[clamp(8px,2.4svh,20px)]">
            <GradientBorder color="green" className="flex-1">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 min-h-[clamp(40px,6svh,56px)] font-secondary text-[clamp(0.65rem,1.5svh,0.875rem)] tracking-widest text-green-400 rounded-lg transition-all duration-200 hover:brightness-110 bg-[#0D2518]"
                onClick={onOpenStash}
              >
                <BagIcon className="w-5 h-5" />
                ORBS
              </button>
            </GradientBorder>
            <GradientBorder color="green" className="flex-1">
              <button
                type="button"
                className="w-full flex items-center justify-center min-h-[clamp(40px,6svh,56px)] font-secondary text-[clamp(0.65rem,1.5svh,0.875rem)] tracking-widest text-green-400 rounded-lg transition-all duration-200 hover:brightness-110 bg-[#0D2518]"
                onClick={() => setStep("rewards")}
              >
                CONTINUE
              </button>
            </GradientBorder>
          </div>
        )}
      </div>
    </div>
  );
};
