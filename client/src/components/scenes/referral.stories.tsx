import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { ReferralScene } from "./referral";

const samplePayments = [
  { amount: "0.10", token: "USDC", from: "clicksave", timeAgo: "2d" },
  { amount: "0.22", token: "USDC", from: "bal7hazar", timeAgo: "3d" },
  { amount: "0.08", token: "USDC", from: "ashe", timeAgo: "4d" },
  { amount: "0.14", token: "USDC", from: "neo", timeAgo: "5d" },
  { amount: "0.30", token: "USDC", from: "tarrence", timeAgo: "6d" },
  { amount: "0.17", token: "USDC", from: "goofy", timeAgo: "1w" },
  { amount: "0.41", token: "USDC", from: "donald", timeAgo: "8d" },
  { amount: "0.70", token: "USDC", from: "stormborn", timeAgo: "10d" },
  { amount: "0.10", token: "USDC", from: "glitchrider", timeAgo: "12d" },
];

const meta = {
  title: "Scenes/Referral",
  component: ReferralScene,
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
} satisfies Meta<typeof ReferralScene>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    players: "12",
    games: "32",
    totalEarned: "$2.12",
    payments: samplePayments,
    onCopy: fn(),
    onClose: fn(),
    className: "w-full",
  },
};

export const Empty: Story = {
  args: {
    players: "0",
    games: "0",
    totalEarned: "$0.00",
    payments: [],
    onCopy: fn(),
    onClose: fn(),
    className: "w-full",
  },
};
