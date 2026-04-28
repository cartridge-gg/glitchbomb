import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { fn } from "storybook/test";
import type { StakingProps } from "./staking";
import { StakingOnly } from "./staking-only";

const meta = {
  title: "Containers/Staking Only",
  component: StakingOnly,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta<typeof StakingOnly>;

export default meta;
type Story = StoryObj<typeof meta>;

const StakingOnlyWrapper = (args: Partial<StakingProps>) => {
  const [value, setValue] = useState(0);

  return (
    <StakingOnly
      {...args}
      depositProps={{
        balance: 1000,
        numsPrice: 0.042,
        value,
        onValueChange: setValue,
      }}
      onStake={fn()}
    />
  );
};

export const Default: Story = {
  render: (args) => <StakingOnlyWrapper {...args} />,
};

export const Empty: Story = {
  render: (args) => (
    <StakingOnlyWrapper
      {...args}
      depositProps={{ balance: 0, numsPrice: 0.042 }}
    />
  ),
};
