import type { Meta, StoryObj } from "@storybook/react-vite";
import { ReferralPayments } from "./referral-payments";

const samplePayments = [
  { amount: "0.10", token: "USDC", from: "clicksave", timeAgo: "2d" },
  { amount: "0.25", token: "USDC", from: "bal7hazar", timeAgo: "3d" },
  { amount: "0.05", token: "USDC", from: "neo", timeAgo: "4d" },
  { amount: "0.18", token: "USDC", from: "asher", timeAgo: "5d" },
  { amount: "0.32", token: "USDC", from: "tarrence", timeAgo: "1w" },
  { amount: "0.44", token: "USDC", from: "stormborn", timeAgo: "8d" },
  { amount: "0.78", token: "USDC", from: "glitchrider", timeAgo: "11d" },
];

const meta = {
  title: "Containers/Referral Payments",
  component: ReferralPayments,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta<typeof ReferralPayments>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    payments: samplePayments,
    className: "h-[320px] w-[420px]",
  },
};

export const Empty: Story = {
  args: {
    payments: [],
    className: "h-[320px] w-[420px]",
  },
};
