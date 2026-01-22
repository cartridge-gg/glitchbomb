import type { Meta, StoryObj } from "@storybook/react-vite";
import { GameStats } from "./game-stats";

const meta = {
  title: "Elements/GameStats",
  component: GameStats,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="w-[420px] bg-green-950 p-4">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    points: {
      control: { type: "number" },
      description: "Current points",
    },
    milestone: {
      control: { type: "number" },
      description: "Points needed to reach goal",
    },
    health: {
      control: { type: "number" },
      description: "Current health",
    },
    maxHealth: {
      control: { type: "number" },
      description: "Maximum health",
    },
    level: {
      control: { type: "number" },
      description: "Current level",
    },
  },
  args: {
    points: 50,
    milestone: 180,
    health: 5,
    maxHealth: 5,
    level: 5,
  },
} satisfies Meta<typeof GameStats>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const LowHealth: Story = {
  args: {
    health: 2,
  },
};

export const HighProgress: Story = {
  args: {
    points: 150,
    milestone: 180,
  },
};

export const EarlyGame: Story = {
  args: {
    points: 5,
    milestone: 12,
    health: 5,
    level: 1,
  },
};

export const LateGame: Story = {
  args: {
    points: 280,
    milestone: 500,
    health: 3,
    level: 10,
  },
};
