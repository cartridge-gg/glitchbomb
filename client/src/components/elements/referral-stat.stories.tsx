import type { Meta, StoryObj } from "@storybook/react-vite";
import { ReferralStat } from "./referral-stat";

const meta = {
  title: "Elements/Referral Stat",
  component: ReferralStat,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta<typeof ReferralStat>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Players",
    value: "12",
    className: "w-[180px]",
  },
};

export const Wide: Story = {
  args: {
    label: "Total Earned",
    value: "$2.12",
    wide: true,
    className: "w-[380px]",
  },
};
