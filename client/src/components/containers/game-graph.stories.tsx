import type { Meta, StoryObj } from "@storybook/react-vite";
import { GameGraph } from "./game-graph";

const chartDatasets = {
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

const meta = {
  title: "Containers/Game Graph",
  component: GameGraph,
  parameters: {
    layout: "padded",
  },

  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["onePull", "twoPulls", "threePulls", "fivePulls", "tenPulls"],
      description: "Number of pulled orbs to display",
    },
    breakevenPoint: {
      control: { type: "number" },
      description: "Breakeven point for the graph",
    },
  },
  args: {
    variant: "onePull",
    data: chartDatasets.onePull,
    breakevenPoint: 0,
  },
} satisfies Meta<typeof GameGraph>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OnePull: Story = {
  args: {
    variant: "onePull",
    data: chartDatasets.onePull,
  },
};

export const TwoPulls: Story = {
  args: {
    variant: "twoPulls",
    data: chartDatasets.twoPulls,
  },
};

export const ThreePulls: Story = {
  args: {
    variant: "threePulls",
    data: chartDatasets.threePulls,
  },
};

export const FivePulls: Story = {
  args: {
    variant: "fivePulls",
    data: chartDatasets.fivePulls,
  },
};

export const TenPulls: Story = {
  args: {
    variant: "tenPulls",
    data: chartDatasets.tenPulls,
  },
};
