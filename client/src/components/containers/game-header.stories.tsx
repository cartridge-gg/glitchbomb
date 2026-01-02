import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import { GameHeader } from "./game-header";

const meta = {
  title: "Containers/GameHeader",
  component: GameHeader,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default"],
      description: "Visual variant of the game header",
    },
  },
  args: {
    score: 11,
    multiplier: 1,
    moonrocks: 80,
    chips: 36,
    milestone: 18,
    onLeftClick: fn(),
  },
} satisfies Meta<typeof GameHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: "default",
  },
};
