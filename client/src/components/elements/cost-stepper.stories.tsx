import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { CostStepper } from "./cost-stepper";

const meta = {
  title: "Elements/CostStepper",
  component: CostStepper,
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
  args: {
    count: 10,
    selectedIndex: 0,
  },
} satisfies Meta<typeof CostStepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const MiddleTier: Story = {
  args: {
    selectedIndex: 4,
  },
};

export const MaxTier: Story = {
  args: {
    selectedIndex: 9,
  },
};

export const Interactive = () => {
  const [index, setIndex] = useState(0);
  return (
    <div className="max-w-md bg-green-950 p-4 rounded-xl">
      <CostStepper
        count={10}
        selectedIndex={index}
        onDecrement={() => setIndex(Math.max(0, index - 1))}
        onIncrement={() => setIndex(Math.min(9, index + 1))}
      />
    </div>
  );
};
