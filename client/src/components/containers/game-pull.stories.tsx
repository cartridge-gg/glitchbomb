import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { GamePull } from "./game-pull";

const meta: Meta<typeof GamePull> = {
  title: "Containers/Game Pull",
  component: GamePull,
  parameters: {
    layout: "centered",
  },

  argTypes: {
    lives: {
      control: "number",
      description: "Number of lives",
    },
    bombs: {
      control: "number",
      description: "Number of bombs in the bag",
    },
    orbs: {
      control: "number",
      description: "Number of orbs",
    },
    multiplier: {
      control: "number",
      description: "Current multiplier value",
    },
    values: {
      control: "object",
      description:
        "Object with bombs, points, multipliers, chips, and moonrocks values",
    },
    pullLoading: {
      control: "boolean",
      description: "Whether a pull is in progress",
    },
    showPercentages: {
      control: "boolean",
      description: "Whether to display orb distribution percentages",
    },
    variant: {
      control: { type: "select" },
      options: ["default"],
    },
  },
  args: {
    onPull: fn(),
  },
  decorators: [
    (Story) => (
      <div className="h-[420px] w-[360px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof GamePull>;

export const Default: Story = {
  args: {
    lives: 5,
    bombs: 3,
    orbs: 5,
    multiplier: 3,
    values: {
      bombs: 20,
      points: 58,
      multipliers: 3,
      special: 23,
      health: 5,
    },
  },
};

export const LowLives: Story = {
  args: {
    lives: 1,
    bombs: 4,
    orbs: 8,
    multiplier: 2,
    values: {
      bombs: 40,
      points: 30,
      multipliers: 10,
      special: 15,
      health: 5,
    },
  },
};

export const MultiplierEffect: Story = {
  args: {
    lives: 5,
    bombs: 3,
    orbs: 5,
    multiplier: 1.5,
    values: {
      bombs: 20,
      points: 58,
      multipliers: 3,
      special: 23,
      health: 5,
    },
  },
};

export const PullLoading: Story = {
  args: {
    lives: 5,
    bombs: 3,
    orbs: 5,
    multiplier: 3,
    pullLoading: true,
    values: {
      bombs: 20,
      points: 58,
      multipliers: 3,
      special: 23,
      health: 5,
    },
  },
};

export const ShowPercentages: Story = {
  args: {
    lives: 4,
    bombs: 2,
    orbs: 6,
    multiplier: 3,
    showPercentages: true,
    values: {
      bombs: 20,
      points: 58,
      multipliers: 3,
      special: 23,
      health: 5,
    },
  },
};
