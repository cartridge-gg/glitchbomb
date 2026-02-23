import { CostStepper } from "@/components/elements/cost-stepper";
import { PayoutChart } from "@/components/elements/payout-chart";
import { GradientBorder } from "@/components/ui/gradient-border";
import {
  breakEvenPoints,
  COST_TIERS,
  maxPayout,
  rewardMultiplier,
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
  const cost = COST_TIERS[tierIndex];
  const multiplier = rewardMultiplier(cost);
  const max = maxPayout(cost);

  const hasPrice = tokenPrice != null && tokenPrice > 0;
  const maxUsd = hasPrice ? max * tokenPrice : null;

  const labelColor = "rgba(54, 248, 24, 0.40)";
  const valueColor = "#36F818";

  const rowBg = "rgba(54, 248, 24, 0.04)";

  const stats = [
    { label: "Cost", value: `$${cost.toFixed(2)}`, color: "#FACC15" },
    {
      label: "Reward Multiplier",
      value: `${multiplier % 1 === 0 ? multiplier : multiplier.toFixed(1)}X`,
    },
    {
      label: "Break Even",
      value: `${breakEvenPoints(cost, tokenPrice ?? undefined)} Moonrocks`,
    },
    { label: "Expires In", value: "24HRS" },
    {
      label: "Maximum Reward",
      value:
        maxUsd != null
          ? `$${maxUsd.toFixed(0)} (${max.toFixed(0)} Glitch)`
          : `${max.toFixed(0)} Glitch`,
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
            <PayoutChart entryCost={cost} tokenPrice={tokenPrice ?? null} />
          </div>
        </GradientBorder>

        {/* Cost stepper */}
        <CostStepper
          count={COST_TIERS.length}
          selectedIndex={tierIndex}
          onDecrement={() => onTierIndexChange(Math.max(0, tierIndex - 1))}
          onIncrement={() =>
            onTierIndexChange(Math.min(COST_TIERS.length - 1, tierIndex + 1))
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
