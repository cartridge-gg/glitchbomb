import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { PayoutChart } from "./payout-chart";

const ONE_TOKEN = 1_000_000_000_000_000_000n;
const TARGET_SUPPLY = 1_000_000n * ONE_TOKEN;
const CURRENT_SUPPLY = 250_000n * ONE_TOKEN;

const FRAME_CLASS =
  "w-full h-full bg-black/60 rounded-xl p-2 flex flex-col gap-2";

const meta = {
  title: "Elements/Payout Chart",
  component: PayoutChart,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
  argTypes: {
    stake: {
      control: { type: "range", min: 1, max: 10, step: 1 },
      description: "Stake multiplier (1-10)",
    },
    tokenPrice: {
      control: { type: "number" },
      description: "Token price in USD (null hides the Max Reward block)",
    },
    score: {
      control: { type: "range", min: 0, max: 524, step: 1 },
      description: "Player score (renders YOU marker on the curve)",
    },
  },
  args: {
    stake: 1,
    tokenPrice: 0.0869,
    supply: CURRENT_SUPPLY,
    target: TARGET_SUPPLY,
  },
  render: (args) => (
    <div className={FRAME_CLASS}>
      <PayoutChart {...args} />
    </div>
  ),
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

export const WithoutTokenPrice: Story = {
  args: {
    stake: 3,
    tokenPrice: null,
  },
};

export const WithScoreMarker: Story = {
  args: {
    stake: 3,
    tokenPrice: 0.0869,
    score: 120,
  },
};

export const WithScoreMarkerHighScore: Story = {
  args: {
    stake: 5,
    tokenPrice: 0.0869,
    score: 350,
  },
};

export const WithScoreMarkerZero: Story = {
  args: {
    stake: 3,
    tokenPrice: 0.0869,
    score: 0,
  },
};

export const Compact: Story = {
  args: {
    stake: 5,
    tokenPrice: 0.0869,
  },
  render: (args) => (
    <div className="w-full h-[200px] bg-black/60 rounded-xl p-2 flex flex-col gap-2">
      <PayoutChart {...args} />
    </div>
  ),
};

export const Framed420: Story = {
  args: {
    stake: 5,
    tokenPrice: 0.0869,
  },
  render: (args) => (
    <div className="w-full max-w-[420px] h-[240px] bg-black/60 rounded-xl p-2 flex flex-col gap-2">
      <PayoutChart {...args} />
    </div>
  ),
};

export const Interactive = () => {
  const [stake, setStake] = useState(7);
  return (
    <div className={FRAME_CLASS}>
      <div className="flex items-center gap-4 px-2">
        <label
          className="text-white-100 font-secondary text-sm uppercase tracking-widest"
          htmlFor="stake-slider"
        >
          Stake
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
        <span className="text-white-100 font-secondary text-sm w-8">
          {stake}x
        </span>
      </div>
      <PayoutChart
        stake={stake}
        tokenPrice={0.0869}
        supply={CURRENT_SUPPLY}
        target={TARGET_SUPPLY}
      />
    </div>
  );
};
