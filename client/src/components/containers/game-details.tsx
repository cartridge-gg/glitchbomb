import { CostStepper } from "@/components/elements/cost-stepper";
import { PayoutChart } from "@/components/elements/payout-chart";
import { GradientBorder } from "@/components/ui/gradient-border";
import {
  breakEvenScore,
  maxPayout,
  STARTERPACK_COUNT,
  tierPrice,
  toTokens,
} from "@/helpers/payout";

interface GameDetailsProps {
  tierIndex: number;
  onTierIndexChange: (index: number) => void;
  tokenPrice?: number | null;
}

export const GameDetails = ({
  tierIndex,
  onTierIndexChange,
  tokenPrice = null,
}: GameDetailsProps) => {
  const stake = tierIndex + 1;
  const cost = toTokens(tierPrice(stake));
  const max = toTokens(maxPayout(stake));

  const hasPrice = tokenPrice != null && tokenPrice > 0;
  const costUsd = hasPrice ? cost * tokenPrice : null;
  const maxUsd = hasPrice ? max * tokenPrice : null;

  const labelColor = "rgba(54, 248, 24, 0.40)";
  const valueColor = "#36F818";
  const rowBg = "rgba(54, 248, 24, 0.04)";

  const beScore = breakEvenScore(stake, tokenPrice ?? undefined);

  const stats = [
    {
      label: "Cost",
      value: costUsd != null ? `$${costUsd.toFixed(2)}` : `${cost.toFixed(2)} tokens`,
      color: "#FACC15",
    },
    {
      label: "Reward Multiplier",
      value: `${stake}X`,
    },
    {
      label: "Break Even",
      value: `${beScore} Points`,
    },
    { label: "Expires In", value: "24HRS" },
    {
      label: "Maximum Reward",
      value:
        maxUsd != null
          ? `${max.toFixed(4)} tokens ~ $${maxUsd.toFixed(2)}`
          : `${max.toFixed(4)} tokens`,
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
            <PayoutChart stake={stake} tokenPrice={tokenPrice ?? null} />
          </div>
        </GradientBorder>

        {/* Token price info box (like nums) */}
        {hasPrice && (
          <div
            className="flex items-center gap-2 rounded-lg px-3 py-2"
            style={{ backgroundColor: rowBg }}
          >
            <span className="font-secondary text-xs" style={{ color: labelColor }}>
              *
            </span>
            <span className="font-secondary text-xs" style={{ color: labelColor }}>
              1 token = ${tokenPrice.toFixed(5)} USD
            </span>
          </div>
        )}

        {/* Cost stepper */}
        <CostStepper
          count={STARTERPACK_COUNT}
          selectedIndex={tierIndex}
          onDecrement={() => onTierIndexChange(Math.max(0, tierIndex - 1))}
          onIncrement={() =>
            onTierIndexChange(
              Math.min(STARTERPACK_COUNT - 1, tierIndex + 1),
            )
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
