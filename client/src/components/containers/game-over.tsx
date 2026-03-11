import { useMemo, useState } from "react";
import { GlitchBombIcon, MoonrockIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { GlitchText } from "@/components/ui/glitch-text";
import { GradientBorder } from "@/components/ui/gradient-border";
import { cumulativeRewards, toTokens } from "@/helpers/payout";
import type { OrbPulled } from "@/models";
import {
  CardDivider,
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

type Step = "gameover" | "rewards";

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
  const bombsHit = useMemo(
    () => pulls.filter((p) => p.orb.isBomb()).length,
    [pulls],
  );
  const [step, setStep] = useState<Step>("gameover");

  // Compute GLITCH tokens earned and USD value for rewards step
  const { glitch, usd } = useMemo(() => {
    if (stake == null || moonrocksEarned <= 0)
      return { glitch: 0, usd: null as number | null };
    const rewards = cumulativeRewards(stake, supply, target);
    const idx = Math.min(moonrocksEarned, rewards.length) - 1;
    const raw = idx >= 0 ? rewards[idx] : 0;
    const tokens = toTokens(raw);
    const usdVal =
      tokenPrice != null && tokenPrice > 0 ? tokens * tokenPrice : null;
    return { glitch: tokens, usd: usdVal };
  }, [stake, moonrocksEarned, supply, target, tokenPrice]);

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
            className={`${titleColor} ${titleFont} uppercase text-[clamp(1.9rem,5.5svh,2.75rem)] tracking-wider leading-tight text-center ${!cashedOut && !expired ? "glitch-text" : ""}`}
          >
            {expired
              ? "EXPIRED"
              : cashedOut
                ? "CASHED OUT"
                : "GLITCHED\u00A0OUT"}
          </h1>
          <span className="text-green-600 font-secondary text-sm tracking-widest">
            Lvl {level}
          </span>
        </div>

        {expired ? (
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
        ) : step === "gameover" ? (
          <>
            <PLChartTabs
              data={plData}
              pulls={pulls}
              mode="absolute"
              title="P/L"
              tabBarClassName=""
            />

            <InfoCard
              variant={cashedOut ? "green" : "red"}
              label={`You Earned${cashedOut ? "!" : ""}`}
              className="w-full h-auto min-h-[clamp(160px,24svh,210px)]"
              innerClassName="py-[clamp(8px,1.8svh,14px)] px-[clamp(10px,2svh,16px)] gap-[clamp(8px,2.2svh,20px)]"
            >
              <div className="flex flex-col items-center">
                <MoonrockIcon
                  className={`w-[clamp(32px,6svh,48px)] h-[clamp(32px,6svh,48px)] ${textColor}`}
                />
                <span
                  className={`${textColor} font-secondary text-[clamp(0.8rem,2svh,1.1rem)] tracking-[0.2em]`}
                >
                  <GlitchText text={`${moonrocksEarned} MOONROCKS`} />
                </span>
              </div>
            </InfoCard>
          </>
        ) : (
          <>
            {/* Rewards step: payout chart + stats */}
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
              variant={cashedOut ? "green" : "red"}
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
                      <span
                        className={`${textColor} font-secondary text-[clamp(0.55rem,1.1svh,0.75rem)] leading-none`}
                      >
                        <GlitchText text={`$${usd.toFixed(2)}`} />
                      </span>
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
                  <div className="py-[clamp(1px,0.4svh,3px)] px-[clamp(8px,1.6svh,12px)]">
                    <span
                      className={`${textColor} opacity-70 font-secondary text-[clamp(0.5rem,1.1svh,0.6rem)] tracking-[0.3em] uppercase`}
                    >
                      Moonrocks
                    </span>
                  </div>
                  <CardDivider
                    className={cashedOut ? "bg-green-100" : "bg-red-100"}
                  />
                  <div className="flex-1 flex flex-col items-center justify-center gap-[clamp(6px,2svh,18px)] py-[clamp(8px,2.2svh,16px)] px-[clamp(8px,2.2svh,14px)]">
                    <div className="flex items-center justify-center gap-1">
                      <MoonrockIcon
                        className={`w-[clamp(18px,4svh,24px)] h-[clamp(18px,4svh,24px)] ${textColor}`}
                      />
                      <GlitchText
                        className={`${textColor} font-secondary text-[clamp(0.9rem,3svh,1.5rem)] leading-none`}
                        text={String(moonrocksEarned)}
                      />
                    </div>
                    <span
                      className={`${textColor} opacity-70 font-secondary text-[clamp(0.5rem,1.1svh,0.7rem)] tracking-wider`}
                    >
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
                    <div className="py-[clamp(1px,0.4svh,3px)] px-[clamp(8px,1.6svh,12px)]">
                      <span
                        className={`${textColor} font-secondary text-[clamp(0.5rem,1.1svh,0.6rem)] tracking-[0.3em] uppercase`}
                      >
                        Reward
                      </span>
                    </div>
                    <CardDivider
                      className={cashedOut ? "bg-green-100" : "bg-red-100"}
                    />
                    <div className="flex-1 flex flex-col items-center justify-center gap-[clamp(6px,2svh,18px)] py-[clamp(8px,2.2svh,16px)] px-[clamp(8px,2.2svh,14px)]">
                      <div className="flex items-center justify-center gap-1">
                        <GlitchBombIcon
                          className={`w-[clamp(14px,3svh,18px)] h-[clamp(14px,3svh,18px)] ${textColor}`}
                        />
                        <GlitchText
                          className={`${textColor} font-secondary text-[clamp(0.9rem,3svh,1.5rem)] leading-none`}
                          text={glitch.toFixed(1)}
                        />
                      </div>
                      <span
                        className={`${textColor} opacity-70 font-secondary text-[clamp(0.5rem,1.1svh,0.7rem)] tracking-wider`}
                      >
                        GLITCH
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </InfoCard>

            {/* Stats rows */}
            <div className="flex flex-col gap-px bg-black rounded-lg overflow-hidden">
              {[
                { label: "Level Reached", value: level },
                { label: "Orbs Pulled", value: pulls.length },
                { label: "Bombs Hit", value: bombsHit },
                { label: "Moonrocks Earned", value: moonrocksEarned },
              ].map((stat, i, arr) => (
                <div
                  key={stat.label}
                  className={`flex justify-between items-center px-4 py-3 ${
                    i === 0 ? "rounded-t-lg" : ""
                  } ${i === arr.length - 1 ? "rounded-b-lg" : ""}`}
                  style={{ backgroundColor: "rgba(54, 248, 24, 0.04)" }}
                >
                  <span
                    className="font-secondary text-sm"
                    style={{ color: "#FFFFFF" }}
                  >
                    {stat.label}
                  </span>
                  <GlitchText
                    className="font-secondary text-sm"
                    style={{ color: "#36F818" }}
                    text={String(stat.value)}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Button — pinned to bottom */}
      <div className="shrink-0 pb-4">
        {expired || step === "rewards" ? (
          <Button
            variant="default"
            gradient="green"
            className="min-h-[clamp(40px,6svh,56px)] w-full font-secondary text-[clamp(0.7rem,1.5svh,0.875rem)] tracking-widest"
            onClick={onPlayAgain}
          >
            PLAY AGAIN
          </Button>
        ) : (
          <Button
            variant="default"
            gradient="green"
            className="min-h-[clamp(40px,6svh,56px)] w-full font-secondary text-[clamp(0.7rem,1.5svh,0.875rem)] tracking-widest"
            onClick={() => setStep("rewards")}
          >
            CONTINUE
          </Button>
        )}
      </div>
    </div>
  );
};
