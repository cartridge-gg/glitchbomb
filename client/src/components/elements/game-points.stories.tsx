import type { Meta, StoryObj } from "@storybook/react-vite";
import { GamePoints } from "./game-points";

const meta = {
  title: "Elements/Game Points",
  component: GamePoints,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    points: {
      control: { type: "number" },
      description: "Total points displayed in the glitch counter",
    },
    level: {
      control: { type: "number" },
      description: "Current level shown in the pill below",
    },
    variant: {
      control: "select",
      options: ["default"],
      description: "Visual variant",
    },
  },
  args: {
    points: 50,
    level: 5,
    variant: "default",
  },
} satisfies Meta<typeof GamePoints>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Zero: Story = {
  args: { points: 0, level: 1 },
};

export const HighScore: Story = {
  args: { points: 480, level: 12 },
};
