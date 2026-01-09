import type { Meta, StoryObj } from "@storybook/react-vite";
import { GameGraphAlt } from "./game-graph-alt";

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
  volatile: [
    { pulls: 1, pnl: -5, pointType: "bomb" },
    { pulls: 2, pnl: 3, pointType: "point" },
    { pulls: 3, pnl: -2, pointType: "bomb" },
    { pulls: 4, pnl: 8, pointType: "multiplier" },
    { pulls: 5, pnl: -1, pointType: "bomb" },
    { pulls: 6, pnl: 4, pointType: "health" },
    { pulls: 7, pnl: -3, pointType: "bomb" },
    { pulls: 8, pnl: 12, pointType: "chip" },
  ],
  allNegative: [
    { pulls: 1, pnl: -2, pointType: "bomb" },
    { pulls: 2, pnl: -5, pointType: "bomb" },
    { pulls: 3, pnl: -8, pointType: "bomb" },
    { pulls: 4, pnl: -12, pointType: "bomb" },
  ],
};

const meta = {
  title: "Containers/Game Graph Alt",
  component: GameGraphAlt,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "compact"],
      description: "Visual variant of the chart",
    },
    title: {
      control: { type: "text" },
      description: "Chart title",
    },
    breakevenPoint: {
      control: { type: "number" },
      description: "Breakeven point for the graph",
    },
  },
  args: {
    variant: "default",
    title: "PROFIT/LOSS",
    data: chartDatasets.fivePulls,
    breakevenPoint: 0,
  },
  decorators: [
    (Story) => (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100vh" }}>
        <div style={{ width: "400px", height: "300px" }}>
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof GameGraphAlt>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: chartDatasets.fivePulls,
  },
};

export const OnePull: Story = {
  args: {
    data: chartDatasets.onePull,
  },
};

export const TwoPulls: Story = {
  args: {
    data: chartDatasets.twoPulls,
  },
};

export const ThreePulls: Story = {
  args: {
    data: chartDatasets.threePulls,
  },
};

export const TenPulls: Story = {
  args: {
    data: chartDatasets.tenPulls,
  },
};

export const Volatile: Story = {
  args: {
    data: chartDatasets.volatile,
  },
};

export const AllNegative: Story = {
  args: {
    data: chartDatasets.allNegative,
  },
};

export const Empty: Story = {
  args: {
    data: [],
  },
};

export const Compact: Story = {
  args: {
    variant: "compact",
    data: chartDatasets.fivePulls,
  },
};
