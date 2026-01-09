"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { GraphPoint } from "@/components/elements/graphpoint";

const chartData = [
  { pulls: 1, pnl: -5, pointType: "point" },
  { pulls: 2, pnl: -2, pointType: "bomb" },
  { pulls: 3, pnl: 3, pointType: "health" },
  { pulls: 4, pnl: 3, pointType: "multiplier" },
  { pulls: 5, pnl: 8, pointType: "chip" },
  { pulls: 6, pnl: 8, pointType: "moonrock" },
  { pulls: 7, pnl: 20, pointType: "point" },
];

export function GameGraph() {
  return (
    <div className="w-full h-full flex items-center justify-center">
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
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="pulls"
          label={{ value: "Pulls", position: "insideBottom", offset: -5 }}
        />
        <YAxis label={{ value: "PnL", angle: -90, position: "insideLeft" }} />
        <Line
          type="linear"
          dataKey="pnl"
          stroke="var(--green-400)"
          strokeWidth={2}
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
