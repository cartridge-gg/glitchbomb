import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { PayoutChart } from "./payout-chart";

const meta = {
  title: "Elements/PayoutChart",
  component: PayoutChart,
  parameters: {
    layout: "padded",
    backgrounds: { default: "dark" },
  },
  decorators: [
    (Story) => (
      <div className="max-w-md bg-green-950 p-4 rounded-xl">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    stake: {
      control: { type: "range", min: 1, max: 10, step: 1 },
      description: "Stake multiplier (1-10)",
    },
    tokenPrice: {
      control: { type: "number" },
      description: "Token price in USD (null for raw token values)",
    },
  },
  args: {
    stake: 1,
    tokenPrice: null,
  },
} satisfies Meta<typeof PayoutChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const HighStake: Story = {
  args: {
    stake: 5,
  },
};

export const MaxStake: Story = {
  args: {
    stake: 10,
  },
};

export const WithTokenPrice: Story = {
  args: {
    stake: 3,
    tokenPrice: 0.05,
  },
};

export const Interactive = () => {
  const [stake, setStake] = useState(1);
  return (
    <div className="max-w-md bg-green-950 p-4 rounded-xl flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <label
          className="text-green-400 font-secondary text-sm"
          htmlFor="stake-slider"
        >
          Stake:
        </label>
        <input
          id="stake-slider"
          type="range"
          min={1}
          max={10}
          value={stake}
          onChange={(e) => setStake(Number(e.target.value))}
          className="flex-1"
        />
        <span className="text-green-400 font-secondary text-sm w-8">
          {stake}x
        </span>
      </div>
      <PayoutChart stake={stake} tokenPrice={null} />
    </div>
  );
};
