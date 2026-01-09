import type { Meta, StoryObj } from "@storybook/react-vite";
import { GameGraph } from "./game-graph";

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
    breakevenPoint: 0,
  },
} satisfies Meta<typeof GameGraph>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OnePull: Story = {
  args: {
    variant: "onePull",
  },
};

export const TwoPulls: Story = {
  args: {
    variant: "twoPulls",
  },
};

export const ThreePulls: Story = {
  args: {
    variant: "threePulls",
  },
};

export const FivePulls: Story = {
  args: {
    variant: "fivePulls",
  },
};

export const TenPulls: Story = {
  args: {
    variant: "tenPulls",
  },
};
