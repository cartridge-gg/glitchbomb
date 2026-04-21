import type { Meta, StoryObj } from "@storybook/react-vite";
import { LeaderboardScores } from "./leaderboard-scores";

const meta = {
  title: "Containers/Leaderboard Scores",
  component: LeaderboardScores,
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div className="flex h-full w-full">
        <Story />
      </div>
    ),
  ],
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta<typeof LeaderboardScores>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleRows = [
  {
    rank: 1,
    username: "clicksave",
    score: 25,
    reward: 20000,
    variant: "highlighted" as const,
  },
  {
    rank: 2,
    username: "bal7hazar",
    score: 18,
    reward: 16000,
  },
  {
    rank: 3,
    username: "shinobi",
    score: 12,
    reward: 9500,
  },
  {
    rank: 4,
    username: "0xdeadbeef",
    score: 8,
    reward: 4200,
  },
  {
    rank: 5,
    username: "flippertherichdolphin",
    score: 6,
    reward: 3800,
  },
  {
    rank: 6,
    username: "steebchen",
    score: 5,
    reward: 3200,
  },
  {
    rank: 7,
    username: "nasr",
    score: 4,
    reward: 2900,
  },
  {
    rank: 8,
    username: "neo",
    score: 3,
    reward: 2100,
  },
  {
    rank: 9,
    username: "broody",
    score: 2,
    reward: 1500,
  },
  {
    rank: 10,
    username: "tarrence",
    score: 1,
    reward: 800,
  },
];

export const Default: Story = {
  args: {
    rows: sampleRows,
  },
};

export const Empty: Story = {
  args: {
    rows: [],
  },
};

export const SingleRow: Story = {
  args: {
    rows: [sampleRows[0]],
  },
};
