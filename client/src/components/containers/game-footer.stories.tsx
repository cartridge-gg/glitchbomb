import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { GameFooter } from "./game-footer";

const meta = {
  title: "Containers/Game Footer",
  component: GameFooter,
  parameters: {
    layout: "padded",
  },

  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default"],
      description: "Visual variant of the game header",
    },
  },
  args: {
    details: {
      simple: { total: 3, count: 1 },
      double: { total: 1, count: 1 },
      triple: { total: 1, count: 1 },
    },
    onRightClick: fn(),
  },
} satisfies Meta<typeof GameFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
