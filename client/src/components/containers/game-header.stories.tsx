import type { Meta, StoryObj } from "@storybook/react-vite";
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
    score: 58,
    multiplier: 1,
    moonrocks: 80,
    chips: 36,
    milestone: 18,
  },
} satisfies Meta<typeof GameHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: "default",
  },
};
