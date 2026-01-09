"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

const chartData = [
  { pulls: 1, pnl: -5 },
  { pulls: 2, pnl: -2 },
  { pulls: 3, pnl: 3 },
  { pulls: 4, pnl: 3 },
  { pulls: 5, pnl: 8 },
  { pulls: 6, pnl: 8 },
  { pulls: 7, pnl: 20 },
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
          stroke="#8884d8"
          strokeWidth={2}
          dot={{ fill: "#8884d8" }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </div>
  );
}
