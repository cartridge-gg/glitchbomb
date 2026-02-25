import { CostStepper } from "@/components/elements/cost-stepper";
import { PayoutChart } from "@/components/elements/payout-chart";
import { GradientBorder } from "@/components/ui/gradient-border";
import {
  breakEvenScore,
  MAX_SCORE,
  maxPayout,
  STARTERPACK_COUNT,
  tierPrice,
  toTokens,
} from "@/helpers/payout";

interface GameDetailsProps {
  tierIndex: number;
  onTierIndexChange: (index: number) => void;
  tokenPrice?: number | null;
  supply?: bigint;
  target?: bigint;
}

export const GameDetails = ({
  tierIndex,
  onTierIndexChange,
  tokenPrice,
  supply = 0n,
  target = 0n,
}: GameDetailsProps) => {
  const stake = tierIndex + 1;
  const cost = toTokens(tierPrice(stake));
  const max = toTokens(maxPayout(stake, supply, target));

  const labelColor = "#FFFFFF";
  const valueColor = "#36F818";
  const rowBg = "rgba(54, 248, 24, 0.04)";

  const beScore = breakEvenScore(
    stake,
    tokenPrice ?? undefined,
    supply,
    target,
  );

  const hasPrice = tokenPrice != null && tokenPrice > 0;
  const maxUsd = hasPrice ? max * tokenPrice : null;

  const stats = [
    {
      label: "Cost",
      value: `$${cost.toFixed(2)}`,
      color: "#FACC15",
    },
    {
      label: "Reward Multiplier",
      value: `${stake}X`,
    },
    ...(hasPrice
      ? [
          {
            label: "Token Price",
            value: `1 USD = ${Math.round(1 / tokenPrice).toLocaleString("en-US")} GLITCH`,
          },
        ]
      : []),
    {
      label: "Break Even",
      value: beScore === MAX_SCORE ? "\u2014" : `${beScore} Moonrocks`,
    },
    { label: "Expires In", value: "24HRS" },
    {
      label: "Maximum Reward",
      value:
        maxUsd != null
          ? `${max.toFixed(1)} GLITCH ($${maxUsd.toFixed(2)})`
          : `${max.toFixed(1)} GLITCH`,
      highlight: true,
    },
  ];

  return (
    <div className="flex flex-col w-full h-full">
      {/* Scrollable content */}
      <div className="flex-1 flex flex-col gap-5 min-h-0 overflow-y-auto">
        {/* Title */}
        <h2
          className="font-secondary text-lg tracking-widest uppercase px-1"
          style={{ color: valueColor }}
        >
          GAME DETAILS
        </h2>

        {/* Chart */}
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
            />
          </div>
        </GradientBorder>

        {/* Cost stepper */}
        <CostStepper
          count={STARTERPACK_COUNT}
          selectedIndex={tierIndex}
          onDecrement={() => onTierIndexChange(Math.max(0, tierIndex - 1))}
          onIncrement={() =>
            onTierIndexChange(Math.min(STARTERPACK_COUNT - 1, tierIndex + 1))
          }
        />

        {/* Stats rows */}
        <div className="flex flex-col gap-px bg-black rounded-lg overflow-hidden">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`flex justify-between items-center px-4 py-3 ${
                i === 0 ? "rounded-t-lg" : ""
              } ${i === stats.length - 1 ? "rounded-b-lg" : ""}`}
              style={{ backgroundColor: rowBg }}
            >
              <span
                className="font-secondary text-sm"
                style={{ color: labelColor }}
              >
                {stat.label}
              </span>
              <span
                className="font-secondary text-sm"
                style={{ color: stat.color ?? valueColor }}
              >
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
