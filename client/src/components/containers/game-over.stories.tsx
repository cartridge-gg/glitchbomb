import type { Meta, StoryObj } from "@storybook/react-vite";
import { BrowserRouter } from "react-router-dom";
import { GameOver } from "./game-over";

const meta = {
  title: "Containers/GameOver",
  component: GameOver,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <div className="h-screen bg-green-950">
          <Story />
        </div>
      </BrowserRouter>
    ),
  ],
  argTypes: {
    points: {
      control: { type: "number" },
      description: "Final score",
    },
    level: {
      control: { type: "number" },
      description: "Level reached",
    },
  },
  args: {
    points: 75,
    level: 3,
  },
} satisfies Meta<typeof GameOver>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const HighScore: Story = {
  args: {
    points: 5000,
    level: 10,
  },
};

export const FirstLevel: Story = {
  args: {
    points: 8,
    level: 1,
  },
};
