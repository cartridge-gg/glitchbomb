import { useMemo } from "react";
import { MoonrockIcon } from "@/components/icons";
import type { PayoutTier } from "@/constants";

export interface PayoutChartProps {
  tiers: PayoutTier[];
  entryPrice: number;
  className?: string;
}

export const PayoutChart = ({
  tiers,
  entryPrice,
  className = "",
}: PayoutChartProps) => {
  const maxPayout = useMemo(
    () => Math.max(...tiers.map((t) => t.payout)),
    [tiers],
  );

  const breakEvenTier = useMemo(
    () => tiers.find((t) => t.payout >= entryPrice),
    [tiers, entryPrice],
  );

  // Chart layout constants
  const viewWidth = 440;
  const viewHeight = 220;
  const padLeft = 70;
  const padRight = 20;
  const padTop = 25;
  const padBottom = 35;
  const chartWidth = viewWidth - padLeft - padRight;
  const chartHeight = viewHeight - padTop - padBottom;

  // Max moonrocks for x-axis (extend past last tier)
  const maxMoonrocks = tiers[tiers.length - 1].minMoonrocks + 100;

  const xScale = (moonrocks: number) =>
    padLeft + (moonrocks / maxMoonrocks) * chartWidth;

  const yScale = (payout: number) => {
    const maxY = maxPayout * 1.15;
    return padTop + chartHeight - (payout / maxY) * chartHeight;
  };

  // Build step path
  const stepPath = useMemo(() => {
    const parts: string[] = [];
    // Start at bottom-left
    parts.push(`M ${xScale(0)} ${yScale(0)}`);

    for (let i = 0; i < tiers.length; i++) {
      const tier = tiers[i];
      const prevPayout = i > 0 ? tiers[i - 1].payout : 0;
      // Horizontal to this tier boundary
      parts.push(`L ${xScale(tier.minMoonrocks)} ${yScale(prevPayout)}`);
      // Vertical step up
      parts.push(`L ${xScale(tier.minMoonrocks)} ${yScale(tier.payout)}`);
    }

    // Extend last tier to right edge
    const last = tiers[tiers.length - 1];
    parts.push(`L ${xScale(last.minMoonrocks + 100)} ${yScale(last.payout)}`);

    return parts.join(" ");
  }, [tiers]);

  // Fill path (closed polygon for gradient fill under step)
  const fillPath = useMemo(() => {
    const parts: string[] = [];
    parts.push(`M ${xScale(0)} ${yScale(0)}`);

    for (let i = 0; i < tiers.length; i++) {
      const tier = tiers[i];
      const prevPayout = i > 0 ? tiers[i - 1].payout : 0;
      parts.push(`L ${xScale(tier.minMoonrocks)} ${yScale(prevPayout)}`);
      parts.push(`L ${xScale(tier.minMoonrocks)} ${yScale(tier.payout)}`);
    }

    const last = tiers[tiers.length - 1];
    const endX = xScale(last.minMoonrocks + 100);
    parts.push(`L ${endX} ${yScale(last.payout)}`);
    // Close to bottom-right and bottom-left
    parts.push(`L ${endX} ${yScale(0)}`);
    parts.push(`L ${xScale(0)} ${yScale(0)}`);
    parts.push("Z");

    return parts.join(" ");
  }, [tiers]);

  // Break-even Y position
  const breakEvenY = yScale(entryPrice);

  // Y-axis labels (a few key values)
  const yLabels = useMemo(() => {
    const labels: { value: number; y: number }[] = [{ value: 0, y: yScale(0) }];

    if (breakEvenTier) {
      labels.push({ value: entryPrice, y: breakEvenY });
    }

    // Add a top label near max
    labels.push({ value: maxPayout, y: yScale(maxPayout) });

    return labels;
  }, [entryPrice, maxPayout, breakEvenTier, breakEvenY]);

  // Grid lines
  const verticalGridCount = tiers.length + 1;
  const horizontalGridCount = 5;

  return (
    <div className={`relative w-full ${className}`}>
      <svg
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        className="w-full"
        preserveAspectRatio="xMidYMid meet"
        style={{ height: "clamp(140px, 28svh, 240px)" }}
      >
        <defs>
          {/* Green gradient fill for area under curve */}
          <linearGradient id="payout-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#36F818" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#36F818" stopOpacity="0.02" />
          </linearGradient>
          {/* Glow filter for the step line */}
          <filter id="step-glow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Fade mask for grid */}
          <radialGradient id="grid-fade">
            <stop offset="40%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="grid-mask">
            <ellipse
              cx={padLeft + chartWidth / 2}
              cy={padTop + chartHeight / 2}
              rx={chartWidth * 0.6}
              ry={chartHeight * 0.7}
              fill="url(#grid-fade)"
            />
          </mask>
        </defs>

        {/* Grid background */}
        <g mask="url(#grid-mask)">
          {/* Vertical grid */}
          {Array.from({ length: verticalGridCount }).map((_, i) => {
            const x =
              padLeft + ((i + 1) / (verticalGridCount + 1)) * chartWidth;
            return (
              <line
                key={`vg-${i}`}
                x1={x}
                y1={padTop}
                x2={x}
                y2={padTop + chartHeight}
                stroke="rgba(20, 83, 45, 0.4)"
                strokeWidth="0.5"
                strokeDasharray="3 3"
              />
            );
          })}
          {/* Horizontal grid */}
          {Array.from({ length: horizontalGridCount }).map((_, i) => {
            const y =
              padTop + ((i + 1) / (horizontalGridCount + 1)) * chartHeight;
            return (
              <line
                key={`hg-${i}`}
                x1={padLeft}
                y1={y}
                x2={padLeft + chartWidth}
                y2={y}
                stroke="rgba(20, 83, 45, 0.4)"
                strokeWidth="0.5"
                strokeDasharray="3 3"
              />
            );
          })}
        </g>

        {/* Break-even dashed line */}
        <line
          x1={padLeft}
          y1={breakEvenY}
          x2={padLeft + chartWidth}
          y2={breakEvenY}
          stroke="rgba(255, 255, 255, 0.25)"
          strokeWidth="1"
          strokeDasharray="4 3"
        />

        {/* Break-even label */}
        <text
          x={padLeft + chartWidth}
          y={breakEvenY - 6}
          textAnchor="end"
          fill="rgba(255, 255, 255, 0.5)"
          fontSize="8"
          fontFamily="VCR OSD Mono, monospace"
          letterSpacing="0.1em"
        >
          BREAK EVEN
        </text>

        {/* Filled area under step function */}
        <path d={fillPath} fill="url(#payout-fill)" />

        {/* Step function line */}
        <path
          d={stepPath}
          fill="none"
          stroke="#36F818"
          strokeWidth="2"
          filter="url(#step-glow)"
        />

        {/* Step dots at each tier transition */}
        {tiers.map((tier) => (
          <circle
            key={`dot-${tier.minMoonrocks}`}
            cx={xScale(tier.minMoonrocks)}
            cy={yScale(tier.payout)}
            r="3"
            fill="#36F818"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="0.5"
          />
        ))}

        {/* Y-axis labels */}
        {yLabels.map((label) => (
          <g key={`yl-${label.value}`}>
            <rect
              x={2}
              y={label.y - 9}
              width={padLeft - 10}
              height={18}
              rx="9"
              fill="var(--green-950, #052e16)"
            />
            <text
              x={padLeft / 2 - 2}
              y={label.y + 4}
              textAnchor="middle"
              fill="#36F818"
              fontSize="9"
              fontFamily="VCR OSD Mono, monospace"
              letterSpacing="0.05em"
            >
              {label.value}
            </text>
          </g>
        ))}

        {/* X-axis labels */}
        {tiers.map((tier) => (
          <text
            key={`xl-${tier.minMoonrocks}`}
            x={xScale(tier.minMoonrocks)}
            y={viewHeight - 6}
            textAnchor="middle"
            fill="rgba(54, 248, 24, 0.5)"
            fontSize="9"
            fontFamily="VCR OSD Mono, monospace"
            letterSpacing="0.05em"
          >
            {tier.label}
          </text>
        ))}
      </svg>

      {/* Break-even pill overlay on Y-axis */}
      {breakEvenTier && (
        <div
          className="absolute left-0 flex items-center gap-1"
          style={{
            top: `${((breakEvenY - padTop) / (viewHeight - padTop - padBottom)) * 100}%`,
            transform: "translateY(-50%)",
          }}
        >
          <div className="flex items-center gap-0.5 bg-green-950 px-2 py-0.5 rounded-full">
            <MoonrockIcon className="w-3 h-3 text-green-400" />
            <span className="font-secondary text-green-400 text-[9px] tracking-wider">
              {entryPrice}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
