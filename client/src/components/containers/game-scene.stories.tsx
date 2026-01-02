import type { Meta, StoryObj } from "@storybook/react-vite";
import { GameScene } from "./game-scene";

const meta: Meta<typeof GameScene> = {
  title: "Containers/GameScene",
  component: GameScene,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    lives: {
      control: "number",
      description: "Number of lives",
    },
    orbs: {
      control: "number",
      description: "Number of orbs",
    },
    values: {
      control: "object",
      description:
        "Object with bombs, points, multipliers, chips, and moonrocks values",
    },
    variant: {
      control: { type: "select" },
      options: ["default"],
    },
  },
  args: {
    lives: 5,
    orbs: 5,
    values: {
      bombs: 20,
      points: 58,
      multipliers: 3,
      chips: 15,
      moonrocks: 8,
      health: 5,
    },
  },
};

export default meta;
type Story = StoryObj<typeof GameScene>;

export const Default: Story = {};
