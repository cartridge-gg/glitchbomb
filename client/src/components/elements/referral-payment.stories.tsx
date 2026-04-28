import type { Meta, StoryObj } from "@storybook/react-vite";
import { ReferralPayment } from "./referral-payment";

const meta = {
  title: "Elements/Referral Payment",
  component: ReferralPayment,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta<typeof ReferralPayment>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    amount: "0.10",
    token: "USDC",
    from: "clicksave",
    timeAgo: "2d",
    className: "w-[360px]",
  },
};
