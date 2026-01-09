"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { CartesianGrid, Line, LineChart, ReferenceLine } from "recharts";
import { GraphPoint } from "@/components/elements/graphpoint";

interface ChartDataPoint {
  pulls: number;
  pnl: number;
  pointType: string;
}

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
  data: ChartDataPoint[];
  breakevenPoint?: number;
}

export function GameGraph({
  data,
  breakevenPoint = 0,
  variant = "onePull",
  className,
  ...props
}: GameGraphProps) {

  return (
    <div className={gameGraphVariants({ variant, className })} {...props}>
      <LineChart
        width={500}
        height={300}
        data={data}
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
