"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { CartesianGrid, Line, LineChart, ReferenceLine } from "recharts";
import { GraphPoint } from "@/components/elements/graphpoint";

const pointTypes = ["point", "bomb", "health", "multiplier", "chip", "moonrock"];

const chartDataMap = {
  onePull: [{ pulls: 1, pnl: -2, pointType: "point" }],
  twoPulls: [
    { pulls: 1, pnl: -2, pointType: "point" },
    { pulls: 2, pnl: 2, pointType: "bomb" },
  ],
  threePulls: [
    { pulls: 1, pnl: -2, pointType: "point" },
    { pulls: 2, pnl: 1, pointType: "bomb" },
    { pulls: 3, pnl: 5, pointType: "health" },
  ],
  fivePulls: [
    { pulls: 1, pnl: -2, pointType: "point" },
    { pulls: 2, pnl: 0, pointType: "bomb" },
    { pulls: 3, pnl: 3, pointType: "health" },
    { pulls: 4, pnl: 6, pointType: "multiplier" },
    { pulls: 5, pnl: 11, pointType: "chip" },
  ],
  tenPulls: [
    { pulls: 1, pnl: -3, pointType: "point" },
    { pulls: 2, pnl: 2, pointType: "bomb" },
    { pulls: 3, pnl: 2, pointType: "health" },
    { pulls: 4, pnl: 2, pointType: "multiplier" },
    { pulls: 5, pnl: 6, pointType: "chip" },
    { pulls: 6, pnl: 6, pointType: "moonrock" },
    { pulls: 7, pnl: 10, pointType: "point" },
    { pulls: 8, pnl: 10, pointType: "bomb" },
    { pulls: 9, pnl: 15, pointType: "health" },
    { pulls: 10, pnl: 22, pointType: "multiplier" },
  ],
};

const gameGraphVariants = cva("flex items-center justify-center", {
  variants: {
    variant: {
      onePull: "w-full",
      twoPulls: "w-full",
      threePulls: "w-full",
      fivePulls: "w-full",
      tenPulls: "w-full",
    },
  },
  defaultVariants: {
    variant: "onePull",
  },
});

interface GameGraphProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gameGraphVariants> {
  breakevenPoint?: number;
}

export function GameGraph({
  breakevenPoint = 0,
  variant = "onePull",
  className,
  ...props
}: GameGraphProps) {
  const chartData = chartDataMap[variant as keyof typeof chartDataMap] || chartDataMap.onePull;

  return (
    <div className={gameGraphVariants({ variant, className })} {...props}>
      <LineChart
        width={500}
        height={300}
        data={chartData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255, 255, 255, 0.1)"
        />
        <ReferenceLine
          y={breakevenPoint}
          stroke="rgba(255, 255, 255, 0.3)"
          strokeDasharray="5 5"
        />
        <Line
          type="linear"
          dataKey="pnl"
          stroke="var(--green-400)"
          strokeWidth={3}
          style={{
            filter: "drop-shadow(0 0 8px var(--green-400))",
          }}
          dot={(props: any) => {
            const { cx, cy, payload } = props;
            return (
              <foreignObject x={cx - 16} y={cy - 16} width={32} height={32}>
                <GraphPoint icon={payload.pointType} />
              </foreignObject>
            );
          }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </div>
  );
}
