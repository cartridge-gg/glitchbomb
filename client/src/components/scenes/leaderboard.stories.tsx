import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { LeaderboardScene } from "./leaderboard";

const meta = {
  title: "Scenes/Leaderboard",
  component: LeaderboardScene,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="flex h-screen w-full p-4 md:p-6">
        <Story />
      </div>
    ),
  ],
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta<typeof LeaderboardScene>;

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
  { rank: 2, username: "bal7hazar", score: 18, reward: 16000 },
  { rank: 3, username: "ashe", score: 12, reward: 9500 },
  { rank: 4, username: "nasr", score: 8, reward: 4200 },
  { rank: 5, username: "flippertherichdolphin", score: 6, reward: 3800 },
  { rank: 6, username: "steebchen", score: 5, reward: 3200 },
  { rank: 7, username: "neo", score: 4, reward: 2900 },
  { rank: 8, username: "tarrence", score: 3, reward: 2100 },
  { rank: 9, username: "char", score: 2, reward: 1500 },
  { rank: 10, username: "broody", score: 2, reward: 1200 },
  { rank: 11, username: "glihm", score: 1, reward: 950 },
  { rank: 12, username: "mickey", score: 1, reward: 800 },
  { rank: 13, username: "donald", score: 1, reward: 720 },
  { rank: 14, username: "goofy", score: 1, reward: 650 },
  { rank: 15, username: "minnie", score: 1, reward: 580 },
  { rank: 16, username: "pluto", score: 1, reward: 510 },
  { rank: 17, username: "daisy", score: 1, reward: 440 },
  { rank: 18, username: "scrooge", score: 1, reward: 380 },
  { rank: 19, username: "huey", score: 1, reward: 320 },
  { rank: 20, username: "dewey", score: 1, reward: 260 },
];

export const Default: Story = {
  args: {
    rows: sampleRows,
    onClose: fn(),
    className: "w-full",
  },
};

export const Empty: Story = {
  args: {
    rows: [],
    onClose: fn(),
    className: "w-full",
  },
};
