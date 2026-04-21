import type { Meta, StoryObj } from "@storybook/react-vite";
import { LeaderboardScore } from "./leaderboard-score";

const meta = {
  title: "Elements/Leaderboard Score",
  component: LeaderboardScore,
  parameters: {
    layout: "padded",
  },

  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "highlighted"],
      description: "Visual variant — highlighted for current player",
    },
    rank: {
      control: { type: "number" },
    },
    username: {
      control: { type: "text" },
    },
    score: {
      control: { type: "number" },
    },
    reward: {
      control: { type: "number" },
    },
  },
} satisfies Meta<typeof LeaderboardScore>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: "default",
    rank: 2,
    username: "bal7hazar",
    score: 18,
    reward: 16000,
  },
};

export const Highlighted: Story = {
  args: {
    variant: "highlighted",
    rank: 1,
    username: "clicksave",
    score: 25,
    reward: 20000,
  },
};
