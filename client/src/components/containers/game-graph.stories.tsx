import type { Meta, StoryObj } from "@storybook/react-vite";
import { GameGraph } from "./game-graph";

const meta = {
  title: "Containers/Game Graph",
  component: GameGraph,
  parameters: {
    layout: "padded",
  },

  argTypes: {
    breakevenPoint: {
      control: { type: "number" },
      description: "Breakeven point for the graph",
    },
  },
  args: {
    breakevenPoint: 0,
  },
} satisfies Meta<typeof GameGraph>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
