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
      options: ["default"],
      description: "Visual variant of the game graph",
    },
  },
  args: {},
} satisfies Meta<typeof GameGraph>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
